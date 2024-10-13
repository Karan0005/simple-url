import { ExpireTimeEnum } from '@full-stack-project/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';

export class CreateShortLinkValidator {
    @IsString({ message: 'OriginalLink must be a string' })
    @ApiProperty({
        description: 'OriginalLink provided by the user to be converted into short url',
        maxLength: 1000
    })
    @MinLength(1, { message: 'OriginalLink must not be empty' })
    @MaxLength(1000, { message: 'OriginalLink is too long' })
    OriginalLink!: string;

    @ApiProperty({
        description: 'ExpireTime to set expiration for short link',
        enum: ExpireTimeEnum
    })
    @IsEnum(ExpireTimeEnum, {
        message: 'Invalid ExpireTime. Supported values are 1, 7, 0.'
    })
    ExpireTime!: ExpireTimeEnum;
}

export class CreateShortLinkBulkValidator {
    @IsArray({ message: 'Data must be an array' })
    @ValidateNested({ each: true })
    @Type(() => CreateShortLinkValidator)
    @ArrayMinSize(1, { message: 'At least one Link is required for bulk creation' })
    @ApiProperty({
        description: 'Array of OriginalLinks to be converted into short Links',
        type: [CreateShortLinkValidator]
    })
    Data!: CreateShortLinkValidator[];
}

export class UpdateShortLinkValidator {
    @IsString({ message: 'ShortLink must be a string' })
    @ApiProperty({
        description: 'ShortLink provided by the user to be updated',
        maxLength: 100
    })
    @MinLength(1, { message: 'ShortLink must not be empty' })
    @MaxLength(100, { message: 'ShortLink is too long' })
    ShortLink!: string;

    @IsString({ message: 'OriginalLink must be a string' })
    @ApiProperty({
        description: 'OriginalLink provided by the user to be updated',
        maxLength: 1000
    })
    @MinLength(1, { message: 'OriginalLink must not be empty' })
    @MaxLength(1000, { message: 'OriginalLink is too long' })
    OriginalLink!: string;
}

export class UpdateShortLinkStatusValidator {
    @IsString({ message: 'ShortLink must be a string' })
    @ApiProperty({
        description: 'ShortLink provided by the user to be updated',
        maxLength: 100
    })
    @MinLength(1, { message: 'ShortLink must not be empty' })
    @MaxLength(100, { message: 'ShortLink is too long' })
    ShortLink!: string;

    @IsBoolean({ message: 'IsDisabled must be a boolean' })
    @ApiProperty({
        description: 'IsDisabled provided by the user to be updated',
        maxLength: 1000
    })
    @IsNotEmpty({ message: 'IsDisabled field is required.' })
    IsDisabled!: boolean;
}

export class DeleteShortLinkValidator {
    @IsString({ message: 'ShortLink must be a string' })
    @ApiProperty({
        description: 'ShortLink provided by the user to be deleted',
        maxLength: 100
    })
    @MinLength(1, { message: 'ShortLink must not be empty' })
    @MaxLength(100, { message: 'ShortLink is too long' })
    ShortLink!: string;
}
