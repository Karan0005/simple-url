import { DateProcessor, DateTimeTypeEnum, ExpireTimeEnum } from '@full-stack-project/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShortLinkDocument, ShortLinkEntity } from '../../entities';
import {
    IConvertService,
    ICreateShortLinkResponse,
    IGetShortLinkListResponse
} from '../../interfaces';
import {
    CreateShortLinkBulkValidator,
    CreateShortLinkValidator,
    DeleteShortLinkValidator,
    GetShortLinkListValidator,
    UpdateShortLinkStatusValidator,
    UpdateShortLinkValidator
} from '../../validators';
import { RedisService } from '../redis/redis.service';
import { UniqueStringService } from '../unique-string/unique-string.service';

@Injectable()
export class ConvertService implements IConvertService {
    constructor(
        @InjectModel(ShortLinkEntity.name)
        private readonly shortLinkModel: Model<ShortLinkDocument>,
        private readonly redisService: RedisService,
        private readonly uniqueStringService: UniqueStringService,
        private readonly configService: ConfigService
    ) {}

    async createShortLink(params: CreateShortLinkValidator): Promise<ICreateShortLinkResponse> {
        const ShortLink: string = await this.uniqueStringService.generateUniqueString();

        // Setting up expiration date for short link in persistent db model
        let expiresIn: Date | null = null;
        if (params.ExpireTime === ExpireTimeEnum.ONE_DAY) {
            expiresIn = DateProcessor.FutureDateTimeStamp(DateTimeTypeEnum.DAYS, 1);
        } else if (params.ExpireTime === ExpireTimeEnum.ONE_WEEK) {
            expiresIn = DateProcessor.FutureDateTimeStamp(DateTimeTypeEnum.DAYS, 7);
        }

        // Saving short link persistent db model
        await new this.shortLinkModel({
            OriginalLink: params.OriginalLink,
            ShortLink: ShortLink,
            ExpirationDate: expiresIn
        }).save();

        // Returning response
        const apiBaseURL: string = this.configService.get('server.apiBaseURL') as string;
        return { OriginalLink: params.OriginalLink, ShortLink: apiBaseURL + '/' + ShortLink };
    }

    async createShortLinkBulk(
        params: CreateShortLinkBulkValidator
    ): Promise<{ Links: ICreateShortLinkResponse[] }> {
        const response: ICreateShortLinkResponse[] = [];

        //Instead of parallel processing, using sequence to ensure short link unique
        for (const data of params.Data) {
            const result = await this.createShortLink(data);
            response.push(result);
        }

        return { Links: response };
    }

    async updateShortLink(params: UpdateShortLinkValidator): Promise<void> {
        const updatedLink: ShortLinkDocument | null = await this.shortLinkModel.findOneAndUpdate(
            { ShortLink: params.ShortLink },
            {
                OriginalLink: params.OriginalLink,
                ShortLink: params.ShortLink
            },
            {
                new: true
            }
        );
        if (!updatedLink) throw new NotFoundException('Short Link not found');

        // Update Redis cache
        await this.redisService.del(params.ShortLink);
    }

    async updateShortLinkStatus(params: UpdateShortLinkStatusValidator): Promise<void> {
        const updatedLink: ShortLinkDocument | null = await this.shortLinkModel.findOneAndUpdate(
            { ShortLink: params.ShortLink },
            {
                IsDisabled: params.IsDisabled
            },
            {
                new: true
            }
        );
        if (!updatedLink) throw new NotFoundException('Short Link not found');

        // Update Redis cache
        await this.redisService.del(params.ShortLink);
    }

    async deleteShortLink(params: DeleteShortLinkValidator): Promise<void> {
        const result: ShortLinkDocument | null = await this.shortLinkModel.findOneAndDelete({
            ShortLink: params.ShortLink
        });
        if (!result) throw new NotFoundException('Short Link not found');

        // Remove from Redis
        await this.redisService.del(params.ShortLink);
    }

    async getShortLinkList(params: GetShortLinkListValidator): Promise<IGetShortLinkListResponse> {
        const { ShortLink, Page = 1, Limit = 10 } = params;

        const query: { ShortLink?: { $regex: string } } = {};
        if (ShortLink) {
            query.ShortLink = { $regex: ShortLink };
        }

        const skip = (Page - 1) * Limit;

        const shortLinks: ShortLinkDocument[] = await this.shortLinkModel
            .find(query)
            .skip(skip)
            .limit(Limit)
            .sort({ _id: 1 })
            .exec();

        const totalItems = await this.shortLinkModel.countDocuments(query);

        return {
            TotalItems: totalItems,
            CurrentPage: Page,
            TotalPages: Math.ceil(totalItems / Limit),
            LinkBaseURL: this.configService.get('server.apiBaseURL') as string,
            ShortLinks: shortLinks
        };
    }
}
