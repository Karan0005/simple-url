import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { IBaseResponse } from '@full-stack-project/shared';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiRoute } from '../../constants';
import {
    ICreateShortLinkRequest,
    ICreateShortLinkResponse,
    IDeleteShortLinkRequest,
    IGetShortLinkListRequest,
    IGetShortLinkListResponse,
    IUpdateShortLinkRequest,
    IUpdateShortLinkStatusRequest
} from '../../interfaces';
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
    shortLinkRequest: ICreateShortLinkRequest = {
        OriginalLink: '',
        ExpireTime: this.linkExpiry[0].value
    };
    page = 1;
    limit = 10;
    shortLinkList: IGetShortLinkListResponse = {
        TotalItems: 0,
        CurrentPage: 1,
        TotalPages: 0,
        LinkBaseURL: '',
        ShortLinks: []
    };
    editingShortLink = '';
    private readonly searchSubject: Subject<string> = new Subject();

    constructor(
        private readonly loggerService: NGXLogger,
        private readonly toastr: ToastrService,
        private readonly apiService: RestApiService
    ) {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchText: string) => {
                this.list(searchText);
            });
    }

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
                const response: IBaseResponse<ICreateShortLinkResponse> =
                    await this.apiService.post<
                        ICreateShortLinkRequest,
                        IBaseResponse<ICreateShortLinkResponse>
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

    async onSearchChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const searchText = inputElement.value;
        this.searchSubject.next(searchText);
    }

    async list(searchText: string) {
        try {
            const response: IBaseResponse<IGetShortLinkListResponse> =
                await this.apiService.getWithPayload<
                    IGetShortLinkListRequest,
                    IBaseResponse<IGetShortLinkListResponse>
                >(ApiRoute.ShortLink.V1.List, {
                    ShortLink: searchText,
                    Page: this.page,
                    Limit: this.limit
                });

            if (response.IsSuccess) {
                this.shortLinkList = response.Data;
            } else {
                this.toastr.error(response.Message);
            }
        } catch (error) {
            this.toastr.error(((error as HttpErrorResponse).error as IBaseResponse<null>).Message);
        }
    }

    async update(shortLink: string, originalLink: string) {
        try {
            const response: IBaseResponse<void> = await this.apiService.patch<
                IUpdateShortLinkRequest,
                IBaseResponse<void>
            >(ApiRoute.ShortLink.V1.Update, { ShortLink: shortLink, OriginalLink: originalLink });

            if (response.IsSuccess) {
                this.toastr.info(response.Message);
            } else {
                this.toastr.error(response.Message);
            }
        } catch (error) {
            this.toastr.error(((error as HttpErrorResponse).error as IBaseResponse<null>).Message);
        }
    }

    async updateStatus(shortLink: string, isDisabled: boolean) {
        try {
            const response: IBaseResponse<void> = await this.apiService.patch<
                IUpdateShortLinkStatusRequest,
                IBaseResponse<void>
            >(ApiRoute.ShortLink.V1.UpdateStatus, { ShortLink: shortLink, IsDisabled: isDisabled });

            if (response.IsSuccess) {
                this.toastr.info(response.Message);
                const index = this.shortLinkList.ShortLinks.findIndex(
                    (obj) => obj.ShortLink === shortLink
                );
                this.shortLinkList.ShortLinks[index].IsDisabled = isDisabled;
            } else {
                this.toastr.error(response.Message);
            }
        } catch (error) {
            this.toastr.error(((error as HttpErrorResponse).error as IBaseResponse<null>).Message);
        }
    }

    async delete(shortLink: string) {
        try {
            const response: IBaseResponse<void> = await this.apiService.delete<
                IDeleteShortLinkRequest,
                IBaseResponse<void>
            >(ApiRoute.ShortLink.V1.Delete, { ShortLink: shortLink });

            if (response.IsSuccess) {
                this.toastr.info(response.Message);
                const index = this.shortLinkList.ShortLinks.findIndex(
                    (obj) => obj.ShortLink === shortLink
                );
                this.shortLinkList.ShortLinks.splice(index, 1);
            } else {
                this.toastr.error(response.Message);
            }
        } catch (error) {
            this.toastr.error(((error as HttpErrorResponse).error as IBaseResponse<null>).Message);
        }
    }

    editOriginalLink(shortLink: string) {
        this.editingShortLink = shortLink;
    }

    async saveOriginalLink(originalLink: string) {
        await this.update(this.editingShortLink, originalLink);
        this.editingShortLink = '';
    }
}
