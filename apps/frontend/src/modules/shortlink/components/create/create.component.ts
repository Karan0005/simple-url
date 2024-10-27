import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { IBaseResponse } from '@full-stack-project/shared';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';
import { ApiRoute } from '../../../shared/constants';
import { LoaderService, RestApiService } from '../../../shared/services';
import { ICreateShortLinkRequest, ICreateShortLinkResponse } from '../../interfaces';

@Component({
    selector: 'app-shortlink-create',
    templateUrl: './create.component.html',
    styleUrl: './create.component.scss'
})
export class CreateComponent implements OnDestroy {
    shortLink = '';
    downloadableQRImage = '';
    shortLinkRequest: ICreateShortLinkRequest = {
        OriginalLink: '',
        ExpireTime: 1
    };
    selectedLinkType = 'shortlink';
    formSubmitted = false;

    constructor(
        private readonly loggerService: NGXLogger,
        private readonly toastr: ToastrService,
        private readonly apiService: RestApiService,
        private readonly loaderService: LoaderService
    ) {}

    onLinkTypeChange(linkType?: string): void {
        if (linkType) {
            if (this.selectedLinkType === linkType) {
                return;
            }

            this.selectedLinkType = linkType;
        }

        this.shortLinkRequest = {
            OriginalLink: '',
            ExpireTime: 1
        };
        this.downloadableQRImage = '';
        this.shortLink = '';
        this.formSubmitted = false;
    }

    async convert() {
        this.formSubmitted = true;
        if (
            this.shortLinkRequest.OriginalLink &&
            this.validateOriginalLink(this.shortLinkRequest.OriginalLink)
        ) {
            return;
        }
        this.loaderService.showLoader();

        try {
            if (
                this.selectedLinkType === 'qrcode' &&
                this.shortLinkRequest.OriginalLink &&
                !this.downloadableQRImage
            ) {
                this.generateQRCode();
            }

            if (
                this.selectedLinkType === 'shortlink' &&
                this.shortLinkRequest.OriginalLink &&
                !this.shortLink
            ) {
                try {
                    const response: IBaseResponse<ICreateShortLinkResponse> =
                        await this.apiService.post<
                            ICreateShortLinkRequest,
                            IBaseResponse<ICreateShortLinkResponse>
                        >(ApiRoute.ShortLink.V1.Create, this.shortLinkRequest);

                    if (response.IsSuccess) {
                        this.shortLink = response.Data.ShortLink;
                        this.toastr.info('Short link created successfully.');
                    } else {
                        this.toastr.error(response.Message);
                    }
                } catch (error) {
                    this.toastr.error(
                        ((error as HttpErrorResponse).error as IBaseResponse<null>).Message
                    );
                }
            }
        } finally {
            this.loaderService.hideLoader();
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
            this.toastr.info('QR code created successfully.');
        });
    }

    downloadQRCode() {
        const link = document.createElement('a');
        link.href = this.downloadableQRImage;
        link.download = 'qrcode.jpg';
        link.click();
    }

    copyToClipboard(value: string) {
        navigator.clipboard.writeText(value).then(() => {
            this.toastr.info('Copied to clipboard');
        });
    }

    printQRCode() {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                  <head>
                    <title>Print QR Code</title>
                    <style>
                      body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                      img { max-width: 100%; max-height: 100%; }
                    </style>
                  </head>
                  <body>
                    <img id="qrCodeImage" src="${this.downloadableQRImage}" alt="QR Code" />
                  </body>
                </html>
            `);

            printWindow.document.close();
            const qrCodeImage = printWindow.document.getElementById(
                'qrCodeImage'
            ) as HTMLImageElement;
            qrCodeImage.onload = () => {
                printWindow.focus();
                printWindow.print();

                printWindow.onafterprint = () => {
                    printWindow.close();
                };
            };
        }
    }

    validateOriginalLink(link: string): boolean {
        // Check if the link is less than 20 characters
        const isTooShort = link.length < 30;

        if (isTooShort) {
            this.toastr.error('Original link is too short to convert.');
            return true;
        }

        // Check if the link does not start with 'https'
        const doesNotStartWithHttps = !link.startsWith('https://');

        if (doesNotStartWithHttps) {
            this.toastr.error('Original link must start with https.');
            return true;
        }

        return false;
    }

    ngOnDestroy(): void {
        if (this.loaderService.isLoading) {
            this.loaderService.hideLoader();
        }
    }
}
