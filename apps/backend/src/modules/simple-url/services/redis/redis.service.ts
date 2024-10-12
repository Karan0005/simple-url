import {
    Inject,
    Injectable,
    Logger,
    LoggerService,
    OnModuleDestroy,
    OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';
import { IRedisConfig } from '../../interfaces';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: RedisClientType;
    private readonly config: IRedisConfig;

    constructor(
        private readonly configService: ConfigService,
        @Inject(Logger) private readonly logger: LoggerService
    ) {
        this.config = {
            host: this.configService.get<string>('redis.host') ?? '',
            port: this.configService.get<number>('redis.port') ?? 6379
        };
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private async connect() {
        try {
            // Construct the Redis URL based on the provided config
            const passwordPart = this.config.password ? `${this.config.password}@` : '';
            const url = `redis://${passwordPart}${this.config.host}:${this.config.port}`;

            this.client = createClient({ url });

            this.client.on('error', (err) => {
                this.logger.error('Redis Client Error:', err);
            });

            // Automatically reconnect on disconnection
            this.client.on('end', async () => {
                this.logger.warn('Redis connection closed, attempting to reconnect...');
                await this.client.connect();
            });

            await this.client.connect();
            this.logger.log('Connected to Redis');
        } catch (error) {
            this.logger.error('Error connecting to Redis:', error);
            throw new Error('Could not connect to Redis');
        }
    }

    private async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.logger.log('Redis connection closed');
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error(`Error getting key "${key}" from Redis:`, error);
            throw new Error(`Could not get key "${key}" from Redis`);
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            await this.client.set(key, value);
            if (ttl) {
                await this.client.expire(key, ttl);
            }
        } catch (error) {
            this.logger.error(`Error setting key "${key}" in Redis:`, error);
            throw new Error(`Could not set key "${key}" in Redis`);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Error deleting key "${key}" from Redis:`, error);
            throw new Error(`Could not delete key "${key}" from Redis`);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            this.logger.error(`Error checking existence of key "${key}" in Redis:`, error);
            throw new Error(`Could not check existence of key "${key}" in Redis`);
        }
    }
}
