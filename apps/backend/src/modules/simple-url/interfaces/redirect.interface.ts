import { Response } from 'express';

export interface IRedirectController {
    renderShortLink(
        shortCode: string,
        queryParams: Record<string, string>,
        response: Response
    ): Promise<void>;
}

export interface IRedirectService {
    getOriginalLink(params: string): Promise<string>;
}
