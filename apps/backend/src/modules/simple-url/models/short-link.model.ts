import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShortLinkDocument = ShortLinkEntity & Document;

@Schema({ collection: 'ShortLink', versionKey: false })
export class ShortLinkEntity {
    @Prop({ required: true, type: String, trim: true, minlength: 10, maxlength: 2048 })
    originalUrl!: string;

    @Prop({
        required: true,
        unique: true,
        index: true,
        type: String,
        length: 8,
        trim: true
    })
    shortUrl!: string;

    @Prop({ type: Date, default: null })
    expirationDate?: Date | null;

    @Prop({ default: false, type: Boolean })
    isDeleted!: boolean;
}

export const ShortLinkSchema = SchemaFactory.createForClass(ShortLinkEntity);

// TTL index for automatic deletion based on expirationDate
ShortLinkSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });

// Sharding index based on shortUrl to distribute records across shards
ShortLinkSchema.index({ shortUrl: 1 }, { unique: true });
