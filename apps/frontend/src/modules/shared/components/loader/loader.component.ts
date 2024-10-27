import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
    public isLoading = false;

    constructor(
        private readonly loaderService: LoaderService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loaderService.isLoading.subscribe((status) => {
            this.isLoading = status;
            this.changeDetectorRef.detectChanges();
        });
    }
}
