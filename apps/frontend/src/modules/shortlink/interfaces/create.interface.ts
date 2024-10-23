import { ExpireTimeEnum } from '@full-stack-project/shared';

export interface ICreateShortLinkRequest {
    OriginalLink: string;
    ExpireTime: ExpireTimeEnum;
}

export interface ICreateShortLinkResponse {
    OriginalLink: string;
    ShortLink: string;
}

export interface IGetShortLinkListRequest {
    ShortLink: string;
    Page: number;
    Limit: number;
}

export interface IGetShortLinkListResponse {
    TotalItems: number;
    CurrentPage: number;
    TotalPages: number;
    LinkBaseURL: string;
    ShortLinks: {
        _id: string;
        OriginalLink: string;
        ShortLink: string;
        ExpirationDate: Date;
        IsDisabled: boolean;
    }[];
}

export interface IUpdateShortLinkRequest {
    ShortLink: string;
    OriginalLink: string;
}

export interface IUpdateShortLinkStatusRequest {
    ShortLink: string;
    IsDisabled: boolean;
}

export interface IDeleteShortLinkRequest {
    ShortLink: string;
}
