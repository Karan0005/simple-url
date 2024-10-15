import { ShortLinkDocument } from '../entities';
import {
    CreateShortLinkBulkValidator,
    CreateShortLinkValidator,
    DeleteShortLinkValidator,
    GetShortLinkListValidator,
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
    getShortLinkList(params: GetShortLinkListValidator): Promise<IGetShortLinkListResponse>;
}

export interface IConvertService {
    createShortLink(params: CreateShortLinkValidator): Promise<ICreateShortLinkResponse>;
    createShortLinkBulk(
        params: CreateShortLinkBulkValidator
    ): Promise<{ Links: ICreateShortLinkResponse[] }>;
    updateShortLink(params: UpdateShortLinkValidator): Promise<void>;
    updateShortLinkStatus(params: UpdateShortLinkStatusValidator): Promise<void>;
    deleteShortLink(params: DeleteShortLinkValidator): Promise<void>;
    getShortLinkList(params: GetShortLinkListValidator): Promise<IGetShortLinkListResponse>;
}

export interface ICreateShortLinkResponse {
    OriginalLink: string;
    ShortLink: string;
}

export interface IGetShortLinkListResponse {
    TotalItems: number;
    CurrentPage: number;
    TotalPages: number;
    LinkBaseURL: string;
    ShortLinks: ShortLinkDocument[];
}
