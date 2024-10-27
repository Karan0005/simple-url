import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IBaseResponse } from '@full-stack-project/shared';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiRoute } from '../../../shared/constants';
import { LoaderService, RestApiService } from '../../../shared/services';
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
export class ManageComponent implements OnInit {
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
    searchText = '';
    isListLoading = false;

    private readonly searchSubject: Subject<string> = new Subject();

    constructor(
        private readonly toastr: ToastrService,
        private readonly apiService: RestApiService,
        private readonly loaderService: LoaderService
    ) {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((searchText: string) => {
                this.resetPage();
                this.searchText = searchText;
                this.list(this.searchText);
            });
    }

    async onSearchChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const searchText = inputElement.value;
        this.searchSubject.next(searchText);
    }

    async ngOnInit(): Promise<void> {
        this.list('');
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll(): void {
        // Get the total height of the document
        const documentHeight = document.documentElement.scrollHeight;

        // Get the height of the viewport
        const windowHeight = window.innerHeight;

        // Calculate the distance from the bottom
        const scrollPosition = window.scrollY;

        // Set the threshold, e.g., 100 pixels from the bottom
        const threshold = 100;

        // Check if the user has scrolled to the bottom within the threshold
        if (scrollPosition + windowHeight >= documentHeight - threshold) {
            this.list(this.searchText);
        }
    }

    resetPage() {
        this.shortLinkList = {
            TotalItems: 0,
            CurrentPage: 1,
            TotalPages: 0,
            LinkBaseURL: '',
            ShortLinks: []
        };
        this.editingShortLink = '';
        this.page = 1;
        this.limit = 10;
    }

    async list(searchText: string) {
        if (this.isListLoading) {
            return;
        }

        if (this.shortLinkList.CurrentPage === this.shortLinkList.TotalPages) {
            return;
        }

        this.isListLoading = true;
        this.loaderService.showLoader();

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
                this.shortLinkList.TotalItems = response.Data.TotalItems;
                this.shortLinkList.CurrentPage = response.Data.CurrentPage;
                this.shortLinkList.TotalPages = response.Data.TotalPages;
                this.shortLinkList.LinkBaseURL = response.Data.LinkBaseURL;
                this.shortLinkList.ShortLinks = [
                    ...this.shortLinkList.ShortLinks,
                    ...response.Data.ShortLinks
                ];
                this.page++;
            } else {
                this.toastr.error(response.Message);
            }
        } catch (error) {
            this.toastr.error(((error as HttpErrorResponse).error as IBaseResponse<null>).Message);
        } finally {
            this.isListLoading = false;
            this.loaderService.hideLoader();
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

    copyToClipboard(value: string) {
        navigator.clipboard.writeText(value).then(() => {
            this.toastr.info('Copied to clipboard');
        });
    }
}
