import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IBaseResponse } from '@full-stack-project/shared';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
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
export class ManageComponent implements OnInit, OnDestroy {
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
    editingOriginalLink = '';
    searchText = '';
    isListLoading = false;

    private readonly searchSubject: Subject<string> = new Subject();

    constructor(
        private readonly toastr: ToastrService,
        private readonly apiService: RestApiService,
        private readonly loaderService: LoaderService
    ) {
        this.searchSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(async (searchText: string) => {
                    this.resetPage();
                    this.searchText = searchText;
                    return await this.getList(this.searchText);
                })
            )
            .subscribe((response) => {
                this.setGetListResponse(response);
            });
    }

    async onSearchChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const searchText = inputElement.value;
        this.searchSubject.next(searchText);
    }

    async ngOnInit(): Promise<void> {
        const response: IBaseResponse<IGetShortLinkListResponse> | undefined = await this.getList(
            this.searchText
        );
        this.setGetListResponse(response);
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    async onScroll(): Promise<void> {
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
            const response: IBaseResponse<IGetShortLinkListResponse> | undefined =
                await this.getList(this.searchText);
            this.setGetListResponse(response);
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
        this.isListLoading = false;
    }

    async getList(
        searchText: string
    ): Promise<IBaseResponse<IGetShortLinkListResponse> | undefined> {
        if (this.isListLoading) {
            return;
        }

        if (this.shortLinkList.CurrentPage === this.shortLinkList.TotalPages) {
            return;
        }

        this.isListLoading = true;
        this.loaderService.showLoader();

        try {
            return await this.apiService.getWithPayload<
                IGetShortLinkListRequest,
                IBaseResponse<IGetShortLinkListResponse>
            >(ApiRoute.ShortLink.V1.List, {
                ShortLink: searchText,
                Page: this.page,
                Limit: this.limit
            });
        } catch (error) {
            this.toastr.error(((error as HttpErrorResponse).error as IBaseResponse<null>).Message);
            return;
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
                const target = this.shortLinkList.ShortLinks.find(
                    (sl) => sl.ShortLink === shortLink
                );

                if (target) {
                    target.OriginalLink = originalLink;
                }

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

    editOriginalLink(shortLink: string, originalLink: string) {
        this.editingShortLink = shortLink;
        this.editingOriginalLink = originalLink;
    }

    async saveOriginalLink() {
        await this.update(this.editingShortLink, this.editingOriginalLink);
        this.editingShortLink = '';
        this.editingOriginalLink = '';
    }

    copyToClipboard(value: string) {
        navigator.clipboard.writeText(value).then(() => {
            this.toastr.info('Copied to clipboard');
        });
    }

    setGetListResponse(response: IBaseResponse<IGetShortLinkListResponse> | undefined) {
        if (!response) {
            return;
        }

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
    }

    ngOnDestroy(): void {
        if (this.loaderService.isLoading) {
            this.loaderService.hideLoader();
        }
    }
}
