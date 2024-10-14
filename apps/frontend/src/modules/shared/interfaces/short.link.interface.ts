import { ExpireTimeEnum } from '@full-stack-project/shared';

export interface IShortLinkRequest {
    OriginalLink: string;
    ExpireTime: ExpireTimeEnum;
}

export interface IShortLinkResponse {
    OriginalLink: string;
    ShortLink: string;
}
