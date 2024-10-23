import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./shortlink/shortlink.module').then((m) => m.ShortlinkModule)
    },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'top',
            preloadingStrategy: NoPreloading
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
