import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ShortLinkEntity } from '../../entities';
import { RedisService } from '../redis/redis.service';
import { UniqueStringService } from '../unique-string/unique-string.service';
import { ConvertService } from './convert.service';

describe('ConvertService', () => {
    let service: ConvertService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConvertService,
                {
                    provide: getModelToken(ShortLinkEntity.name),
                    useValue: {
                        findOneAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                        constructor: jest.fn().mockImplementation(() => ({
                            save: jest.fn().mockResolvedValue({})
                        }))
                    }
                },
                {
                    provide: RedisService,
                    useValue: {
                        set: jest.fn(),
                        del: jest.fn()
                    }
                },
                {
                    provide: UniqueStringService,
                    useValue: {
                        generateUniqueString: jest.fn()
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ConvertService>(ConvertService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
