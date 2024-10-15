import { APISuccessResponse, IBaseResponse } from '@backend/utilities';
import { BaseMessage } from '@full-stack-project/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShortLinkResponse<T> extends APISuccessResponse<T> implements IBaseResponse<T> {
    @ApiProperty({
        example: {
            OriginalLink: 'https://www.instagram.com/samcrist21344/',
            ShortLink: 'https://app.com/DYrR54n9'
        },
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}

export class CreateShortLinkBulkResponse<T>
    extends APISuccessResponse<T>
    implements IBaseResponse<T>
{
    @ApiProperty({
        example: {
            Links: [
                {
                    OriginalLink: 'https://www.instagram.com/samcrist21344/',
                    ShortLink: 'http://localhost:8000/nqb0SCts'
                },
                {
                    OriginalLink: 'https://www.instagram.com/johndoe21344/',
                    ShortLink: 'http://localhost:8000/L65qE6BC'
                }
            ]
        },
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}

export class UpdateShortLinkResponse<T> extends APISuccessResponse<T> implements IBaseResponse<T> {
    @ApiProperty({
        example: {},
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}

export class UpdateShortLinkStatusResponse<T>
    extends APISuccessResponse<T>
    implements IBaseResponse<T>
{
    @ApiProperty({
        example: {},
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}

export class DeleteShortLinkResponse<T> extends APISuccessResponse<T> implements IBaseResponse<T> {
    @ApiProperty({
        example: {},
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}

export class GetShortLinkListResponse<T> extends APISuccessResponse<T> implements IBaseResponse<T> {
    @ApiProperty({
        example: {
            TotalItems: 3,
            CurrentPage: 1,
            TotalPages: 1,
            LinkBaseURL: 'http://localhost:8000',
            ShortLinks: [
                {
                    _id: '670b76970a2e7f2b4bf55c55',
                    OriginalLink: 'https://www.instagram.com/kairagupta0005/',
                    ShortLink: '123hZfdO',
                    ExpirationDate: null,
                    IsDisabled: false
                }
            ]
        },
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}
