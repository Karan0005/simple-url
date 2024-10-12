import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { IRedisConfig } from '../../interfaces';
import { RedisService } from './redis.service';

describe('RedisService', () => {
    let service: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => {
                            const config: IRedisConfig = {
                                host: 'localhost',
                                port: 6379
                            };
                            return config[key.split('.').pop() as keyof IRedisConfig];
                        })
                    }
                },
                {
                    provide: Logger,
                    useValue: {
                        log: jest.fn(),
                        error: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
