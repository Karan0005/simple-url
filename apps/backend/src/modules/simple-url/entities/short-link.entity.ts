import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShortLinkDocument = ShortLinkEntity & Document;

@Schema({ collection: 'ShortLink', versionKey: false })
export class ShortLinkEntity {
    @Prop({ required: true, type: String, trim: true, minlength: 10, maxlength: 2048 })
    OriginalLink!: string;

    @Prop({
        required: true,
        unique: true,
        index: true,
        type: String,
        length: 8,
        trim: true
    })
    ShortLink!: string;

    @Prop({ type: Date, default: null })
    ExpirationDate?: Date | null;

    @Prop({ default: false, type: Boolean })
    IsDisabled!: boolean;
}

export const ShortLinkSchema = SchemaFactory.createForClass(ShortLinkEntity);

// TTL index for automatic deletion based on ExpirationDate
ShortLinkSchema.index({ ExpirationDate: 1 }, { expireAfterSeconds: 0 });

// Sharding index based on ShortLink to distribute records across shards
ShortLinkSchema.index({ ShortLink: 1 }, { unique: true });
