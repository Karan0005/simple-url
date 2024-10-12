import { Test, TestingModule } from '@nestjs/testing';
import { ConvertController } from './convert.controller';

describe('ConvertController', () => {
    let controller: ConvertController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ConvertController]
        }).compile();

        controller = module.get<ConvertController>(ConvertController);
    });

    it('It should success, convert controller', () => {
        expect(controller).toBeDefined();
    });
});
