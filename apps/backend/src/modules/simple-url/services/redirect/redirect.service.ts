import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShortLinkDocument, ShortLinkEntity } from '../../entities';
import { IRedirectService } from '../../interfaces';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedirectService implements IRedirectService {
    constructor(
        @InjectModel(ShortLinkEntity.name)
        private readonly shortLinkModel: Model<ShortLinkDocument>,
        private readonly redisService: RedisService
    ) {}

    async getOriginalLink(shortLink: string): Promise<string> {
        // Check Redis cache
        const cachedLink = await this.redisService.get(shortLink);
        if (cachedLink) return cachedLink;

        // Fetch from DB if not cached
        const link: ShortLinkDocument | null = await this.shortLinkModel.findOne({
            ShortLink: shortLink
        });
        if (!link || (link && link.IsDisabled)) throw new NotFoundException('Short Link not found');

        // Cache it for future reference
        const TTL_24_HOUR = 86400;
        await this.redisService.set(shortLink, link.OriginalLink, TTL_24_HOUR);
        return link.OriginalLink;
    }
}
