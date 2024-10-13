import { ControllerExceptionProcessor } from '@backend/utilities';
import { BaseMessage } from '@full-stack-project/shared';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { RedirectService } from '../../services';
import { RedirectShortLinkResponse } from '../../swagger';

@Controller()
export class RedirectController {
    constructor(private readonly redirectService: RedirectService) {}

    @Get('/:shortLink')
    @ApiOperation({ summary: 'Redirect to original link' })
    @ApiResponse({
        status: BaseMessage.SwaggerMessage.Response.Ok.Status,
        description: BaseMessage.SwaggerMessage.Response.Ok.Description,
        type: RedirectShortLinkResponse
    })
    async redirectShortLink(
        @Param('shortLink') shortLink: string,
        @Query() queryParams: Record<string, string>,
        @Res() response: Response
    ): Promise<void> {
        try {
            // Fetch the original Link and validate
            const originalLink = await this.redirectService.getOriginalLink(shortLink);

            // Construct the final Link with query parameters, if any
            const queryString = new URLSearchParams(queryParams).toString();
            const redirectLink = queryString ? `${originalLink}?${queryString}` : originalLink;

            response.redirect(redirectLink);
        } catch (error) {
            throw ControllerExceptionProcessor(error);
        }
    }
}
