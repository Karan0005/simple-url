import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ToastrModule } from 'ngx-toastr';
import { CONFIG } from '../../config/config';
import { LoaderComponent } from './components/loader/loader.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LoaderService, RestApiService } from './services';

@NgModule({
    declarations: [PageNotFoundComponent, LoaderComponent],
    imports: [
        CommonModule,
        ToastrModule.forRoot({
            preventDuplicates: true
        }),
        LoggerModule.forRoot({
            level: CONFIG.logLevel === 'debug' ? NgxLoggerLevel.DEBUG : NgxLoggerLevel.ERROR
        })
    ],
    providers: [provideHttpClient(), RestApiService, LoaderService],
    exports: [LoaderComponent]
})
export class SharedModule {}
