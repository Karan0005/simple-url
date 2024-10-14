import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { IBaseResponse } from '@full-stack-project/shared';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';
import { ApiRoute } from '../../constants';
import { IShortLinkRequest, IShortLinkResponse } from '../../interfaces';
import { RestApiService } from '../../services';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
    shortLink = '';
    isQRCodeEnabled = false;
    downloadableQRImage = '';
    linkExpiry: { value: number; label: string }[] = [
        { value: 1, label: '1 Day' },
        { value: 7, label: '7 Days' },
        { value: 0, label: 'Lifetime' }
    ];
    shortLinkRequest: IShortLinkRequest = {
        OriginalLink: '',
        ExpireTime: this.linkExpiry[0].value
    };

    constructor(
        private readonly loggerService: NGXLogger,
        private readonly toastr: ToastrService,
        private readonly apiService: RestApiService
    ) {}

    onQrCodeSwitchChange(event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.isQRCodeEnabled = isChecked;
        this.downloadableQRImage = '';
        this.shortLink = '';
    }

    async convert() {
        if (
            this.isQRCodeEnabled &&
            this.shortLinkRequest.OriginalLink &&
            !this.downloadableQRImage
        ) {
            this.generateQRCode();
            return;
        }

        if (!this.isQRCodeEnabled && this.shortLinkRequest.OriginalLink) {
            try {
                this.shortLinkRequest.ExpireTime = +this.shortLinkRequest.ExpireTime;
                const response: IBaseResponse<IShortLinkResponse> = await this.apiService.post<
                    IShortLinkRequest,
                    IBaseResponse<IShortLinkResponse>
                >(ApiRoute.ShortLink.V1.Create, this.shortLinkRequest);

                if (response.IsSuccess) {
                    this.shortLink = response.Data.ShortLink;
                } else {
                    this.toastr.error(response.Message);
                }
            } catch (error) {
                this.toastr.error(
                    ((error as HttpErrorResponse).error as IBaseResponse<null>).Message
                );
            }
        }
    }

    generateQRCode() {
        const canvas = document.querySelector('canvas');
        const url = this.shortLinkRequest.OriginalLink;

        QRCode.toCanvas(canvas, url, (error) => {
            if (error) {
                this.loggerService.error('Error generating QR code', error);
                return;
            }

            const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/jpg');
            this.downloadableQRImage = dataUrl;
        });
    }
}
