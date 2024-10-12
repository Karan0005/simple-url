import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { MongoClient } from 'mongodb';
import semver from 'semver';

export class DependencyChecker {
    private readonly logger: LoggerService;
    private readonly configService: ConfigService;

    constructor(logger: LoggerService, configService: ConfigService) {
        this.logger = logger;
        this.configService = configService;
    }

    public async verify(): Promise<void> {
        await this.checkMongo();
        await this.checkRedis();
    }

    private async checkMongo(): Promise<void> {
        const minVersion = this.configService.get('mongodb.minVersion');
        const mongoURI = this.configService.get('mongodb.uri');
        const client = new MongoClient(mongoURI);

        try {
            // Attempt to connect to the MongoDB server
            await client.connect();

            // Connect to any accessible database (e.g., default 'test' database)
            const db = client.db();
            const buildInfo = await db.command({ buildInfo: 1 });
            const currentMongoVersion = buildInfo.version;

            if (currentMongoVersion && semver.gte(currentMongoVersion, minVersion)) {
                this.logger.log(`Mongo greater then or equal to ${minVersion} found and running.`);
                return;
            }

            throw new Error(`Mongo ${minVersion} is not up and running on ${mongoURI}.`);
        } catch (error) {
            throw new Error(`Mongo ${minVersion} is not up and running on ${mongoURI}.`);
        }
    }

    private async checkRedis(): Promise<void> {
        const minVersion = this.configService.get('redis.minVersion');
        const redisHost = this.configService.get('redis.host');
        const redisPort = this.configService.get('redis.port');

        try {
            const redisPingCommand = `redis-cli -h ${redisHost} -p ${redisPort} ping 2>&1`;
            const result = execSync(redisPingCommand, { encoding: 'utf8' })?.trim();

            if (result === 'PONG') {
                const currentRedisVersion = execSync('redis-cli --version 2>&1', {
                    encoding: 'utf8'
                })?.split(' ')[1];

                if (currentRedisVersion && semver.gte(currentRedisVersion, minVersion)) {
                    this.logger.log(
                        `Redis greater then or equal to ${minVersion} found and running.`
                    );
                    return;
                }
            }

            throw new Error(`Redis ${minVersion} is not up and running.`);
        } catch (error) {
            throw new Error(`Redis ${minVersion} is not up and running.`);
        }
    }
}
