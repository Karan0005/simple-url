import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ShortLinkEntity } from '../../models'; // Adjust the path as needed
import { RedisService } from '../redis/redis.service';
import { UniqueStringService } from './unique-string.service';

describe('UniqueStringService', () => {
    let service: UniqueStringService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UniqueStringService,
                {
                    provide: getModelToken(ShortLinkEntity.name),
                    useValue: {
                        findOne: jest.fn(),
                        exec: jest.fn()
                    }
                },
                {
                    provide: RedisService,
                    useValue: {
                        exists: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<UniqueStringService>(UniqueStringService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
