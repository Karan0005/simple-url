import {
    CreateShortLinkBulkValidator,
    CreateShortLinkValidator,
    DeleteShortLinkValidator,
    UpdateShortLinkStatusValidator,
    UpdateShortLinkValidator
} from '../validators';

export interface IConvertController {
    createShortLink(params: CreateShortLinkValidator): Promise<ICreateShortLinkResponse>;
    createShortLinkBulk(
        params: CreateShortLinkBulkValidator
    ): Promise<{ Links: ICreateShortLinkResponse[] }>;
    updateShortLink(params: UpdateShortLinkValidator): Promise<void>;
    updateShortLinkStatus(params: UpdateShortLinkStatusValidator): Promise<void>;
    deleteShortLink(params: DeleteShortLinkValidator): Promise<void>;
}

export interface IConvertService {
    createShortLink(params: CreateShortLinkValidator): Promise<ICreateShortLinkResponse>;
    createShortLinkBulk(
        params: CreateShortLinkBulkValidator
    ): Promise<{ Links: ICreateShortLinkResponse[] }>;
    updateShortLink(params: UpdateShortLinkValidator): Promise<void>;
    updateShortLinkStatus(params: UpdateShortLinkStatusValidator): Promise<void>;
    deleteShortLink(params: DeleteShortLinkValidator): Promise<void>;
}

export interface ICreateShortLinkResponse {
    OriginalLink: string;
    ShortLink: string;
}
