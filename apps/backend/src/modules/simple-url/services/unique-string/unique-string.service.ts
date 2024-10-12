import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { ShortLinkDocument, ShortLinkEntity } from '../../models';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UniqueStringService {
    private readonly BASE62_CHARACTERS =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    private readonly SHORT_LINK_LENGTH = 8;

    constructor(
        private readonly redisService: RedisService,
        @InjectModel(ShortLinkEntity.name) private readonly shortLinkModel: Model<ShortLinkDocument>
    ) {}

    /**
     * Generates a random Base62 string of the given length.
     * @param length - The length of the generated string.
     */
    private generateBase62String(length: number): string {
        const bytes = randomBytes(length);
        return Array.from(bytes)
            .map((byte) => this.BASE62_CHARACTERS[byte % this.BASE62_CHARACTERS.length])
            .join('');
    }

    /**
     * Checks if a generated string is unique across Redis and MongoDB.
     * @param shortLink - The generated Base62 string.
     */
    private async isUnique(shortUrl: string): Promise<boolean> {
        // Check in Redis
        const redisResult = await this.redisService.exists(shortUrl);
        if (redisResult) {
            return false;
        }

        // Check in MongoDB
        const mongoResult = await this.shortLinkModel.findOne({ shortUrl }).exec();
        if (mongoResult) {
            return false;
        }

        // If not found in Redis and MongoDB, it's unique
        return true;
    }

    /**
     * Generates a unique 8-character Base62 string and checks its uniqueness.
     * If the string is already in Redis or MongoDB, it retries until a unique string is generated.
     */
    async generateUniqueString(): Promise<string> {
        let uniqueString = '';
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            // Generate a new Base62 string
            uniqueString = this.generateBase62String(this.SHORT_LINK_LENGTH);

            // Check if the string is unique across Redis and MongoDB
            isUnique = await this.isUnique(uniqueString);

            if (isUnique) {
                return uniqueString;
            }

            attempts++;
        }

        // If uniqueness couldn't be ensured after multiple attempts
        throw new Error('Could not generate a unique string.');
    }
}
