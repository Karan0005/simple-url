import { MongoConnectionFactory } from '@backend/utilities';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConvertController, RedirectController } from './controllers';
import { ShortLinkEntity, ShortLinkSchema } from './entities';
import { ConvertService, RedirectService, RedisService, UniqueStringService } from './services';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ShortLinkEntity.name, schema: ShortLinkSchema }]),
        MongooseModule.forRootAsync({ useFactory: MongoConnectionFactory, inject: [ConfigService] })
    ],
    controllers: [ConvertController, RedirectController],
    providers: [ConvertService, UniqueStringService, RedirectService, RedisService, Logger]
})
export class SimpleUrlModule {}
