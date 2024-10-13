import { ControllerExceptionProcessor } from '@backend/utilities';
import { BaseMessage } from '@full-stack-project/shared';
import { Body, Controller, Delete, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IConvertController, ICreateShortLinkResponse } from '../../interfaces';
import { ConvertService } from '../../services';
import {
    CreateShortLinkBulkResponse,
    CreateShortLinkResponse,
    DeleteShortLinkResponse,
    UpdateShortLinkResponse,
    UpdateShortLinkStatusResponse
} from '../../swagger';
import {
    CreateShortLinkBulkValidator,
    CreateShortLinkValidator,
    DeleteShortLinkValidator,
    UpdateShortLinkStatusValidator,
    UpdateShortLinkValidator
} from '../../validators';

@Controller('short-link')
export class ConvertController implements IConvertController {
    constructor(private readonly convertService: ConvertService) {}

    @Post('create/v1')
    @ApiOperation({ summary: 'Create short link' })
    @ApiResponse({
        status: BaseMessage.SwaggerMessage.Response.Ok.Status,
        description: BaseMessage.SwaggerMessage.Response.Ok.Description,
        type: CreateShortLinkResponse
    })
    async createShortLink(
        @Body() params: CreateShortLinkValidator
    ): Promise<ICreateShortLinkResponse> {
        try {
            return await this.convertService.createShortLink(params);
        } catch (error) {
            throw ControllerExceptionProcessor(error);
        }
    }

    @Post('create-bulk/v1')
    @ApiOperation({ summary: 'Create short link in bulk' })
    @ApiResponse({
        status: BaseMessage.SwaggerMessage.Response.Ok.Status,
        description: BaseMessage.SwaggerMessage.Response.Ok.Description,
        type: CreateShortLinkBulkResponse
    })
    async createShortLinkBulk(
        @Body() params: CreateShortLinkBulkValidator
    ): Promise<{ Links: ICreateShortLinkResponse[] }> {
        try {
            return await this.convertService.createShortLinkBulk(params);
        } catch (error) {
            throw ControllerExceptionProcessor(error);
        }
    }

    @Patch('update/v1/')
    @ApiOperation({ summary: 'update short link' })
    @ApiResponse({
        status: BaseMessage.SwaggerMessage.Response.Ok.Status,
        description: BaseMessage.SwaggerMessage.Response.Ok.Description,
        type: UpdateShortLinkResponse
    })
    async updateShortLink(@Body() params: UpdateShortLinkValidator): Promise<void> {
        try {
            return await this.convertService.updateShortLink(params);
        } catch (error) {
            throw ControllerExceptionProcessor(error);
        }
    }

    @Patch('update-status/v1/')
    @ApiOperation({ summary: 'update short link status' })
    @ApiResponse({
        status: BaseMessage.SwaggerMessage.Response.Ok.Status,
        description: BaseMessage.SwaggerMessage.Response.Ok.Description,
        type: UpdateShortLinkStatusResponse
    })
    async updateShortLinkStatus(@Body() params: UpdateShortLinkStatusValidator): Promise<void> {
        try {
            return await this.convertService.updateShortLinkStatus(params);
        } catch (error) {
            throw ControllerExceptionProcessor(error);
        }
    }

    @Delete('delete/v1/')
    @ApiOperation({ summary: 'delete short link' })
    @ApiResponse({
        status: BaseMessage.SwaggerMessage.Response.Ok.Status,
        description: BaseMessage.SwaggerMessage.Response.Ok.Description,
        type: DeleteShortLinkResponse
    })
    async deleteShortLink(@Body() params: DeleteShortLinkValidator): Promise<void> {
        try {
            await this.convertService.deleteShortLink(params);
        } catch (error) {
            throw ControllerExceptionProcessor(error);
        }
    }
}
