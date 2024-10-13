import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ShortLinkEntity } from '../../entities';
import { RedisService } from '../redis/redis.service';
import { RedirectService } from './redirect.service';

describe('RedirectService', () => {
    let service: RedirectService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedirectService,
                {
                    provide: getModelToken(ShortLinkEntity.name),
                    useValue: {
                        findOne: jest.fn()
                    }
                },
                {
                    provide: RedisService,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<RedirectService>(RedirectService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
