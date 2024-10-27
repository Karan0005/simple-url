import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CreateComponent, LandingPageComponent, ManageComponent } from './components';
import { CreateService } from './services';
import { ShortLinkRoutingModule } from './shortlink-routing.module';

@NgModule({
    declarations: [LandingPageComponent, CreateComponent, ManageComponent],
    imports: [CommonModule, FormsModule, SharedModule, ShortLinkRoutingModule],
    providers: [CreateService]
})
export class ShortlinkModule {}
