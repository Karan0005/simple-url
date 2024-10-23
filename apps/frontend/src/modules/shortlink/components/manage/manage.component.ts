import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { IBaseResponse } from '@full-stack-project/shared';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiRoute } from '../../../shared/constants';
import { RestApiService } from '../../../shared/services';
import {
    IDeleteShortLinkRequest,
    IGetShortLinkListRequest,
    IGetShortLinkListResponse,
    IUpdateShortLinkRequest,
    IUpdateShortLinkStatusRequest
} from '../../interfaces';

@Component({
    selector: 'app-shortlink-manage',
    templateUrl: './manage.component.html',
    styleUrl: './manage.component.scss'
})
export class ManageComponent {
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
        private readonly toastr: ToastrService,
        private readonly apiService: RestApiService
    ) {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchText: string) => {
                this.list(searchText);
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
