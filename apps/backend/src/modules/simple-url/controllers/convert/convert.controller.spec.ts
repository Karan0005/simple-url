import { Test, TestingModule } from '@nestjs/testing';
import { ConvertService } from '../../services';
import { ConvertController } from './convert.controller';

describe('ConvertController', () => {
    let controller: ConvertController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ConvertController],
            providers: [
                {
                    provide: ConvertService,
                    useValue: {
                        createShortLink: jest.fn(),
                        createShortLinkBulk: jest.fn(),
                        updateShortLink: jest.fn(),
                        deleteShortLink: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<ConvertController>(ConvertController);
    });

    it('It should success, convert controller', () => {
        expect(controller).toBeDefined();
    });
});
