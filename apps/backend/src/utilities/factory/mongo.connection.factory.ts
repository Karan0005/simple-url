import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const MongoConnectionFactory = async (
    configService: ConfigService
): Promise<MongooseModuleFactoryOptions> => {
    return {
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongodb.dbName')
    };
};
