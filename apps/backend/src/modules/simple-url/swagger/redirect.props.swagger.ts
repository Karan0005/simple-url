import { APISuccessResponse } from '@backend/utilities';
import { BaseMessage, IBaseResponse } from '@full-stack-project/shared';
import { ApiProperty } from '@nestjs/swagger';

export class RedirectShortLinkResponse<T>
    extends APISuccessResponse<T>
    implements IBaseResponse<T>
{
    @ApiProperty({
        example: {},
        description: BaseMessage.SwaggerMessage.Property.Description.Data
    })
    declare Data: T;
}
