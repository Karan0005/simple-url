import { MongoConnectionFactory } from '@backend/utilities';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConvertController } from './controllers';
import { ShortLinkEntity, ShortLinkSchema } from './models';
import { ConvertService, RedisService, UniqueStringService } from './services';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ShortLinkEntity.name, schema: ShortLinkSchema }]),
        MongooseModule.forRootAsync({ useFactory: MongoConnectionFactory, inject: [ConfigService] })
    ],
    controllers: [ConvertController],
    providers: [ConvertService, UniqueStringService, RedisService, Logger]
})
export class SimpleUrlModule {}
