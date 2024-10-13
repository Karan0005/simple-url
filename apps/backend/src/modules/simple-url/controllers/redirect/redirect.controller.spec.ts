import { Test, TestingModule } from '@nestjs/testing';
import { RedirectService } from '../../services';
import { RedirectController } from './redirect.controller';

describe('RedirectController', () => {
    let controller: RedirectController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RedirectController],
            providers: [
                {
                    provide: RedirectService,
                    useValue: {
                        getOriginalLink: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<RedirectController>(RedirectController);
    });

    it('It should success, redirect controller', () => {
        expect(controller).toBeDefined();
    });
});
