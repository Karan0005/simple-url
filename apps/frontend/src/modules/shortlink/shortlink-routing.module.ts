import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent, LandingPageComponent, ManageComponent } from './components';

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        children: [
            {
                path: '',
                redirectTo: 'create',
                pathMatch: 'full'
            },
            {
                path: 'create',
                component: CreateComponent
            },
            {
                path: 'manage',
                component: ManageComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ShortLinkRoutingModule {}
