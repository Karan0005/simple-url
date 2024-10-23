import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateComponent, LandingPageComponent, ManageComponent } from './components';
import { CreateService } from './services';
import { ShortLinkRoutingModule } from './shortlink-routing.module';

@NgModule({
    declarations: [LandingPageComponent, CreateComponent, ManageComponent],
    imports: [CommonModule, FormsModule, ShortLinkRoutingModule],
    providers: [CreateService]
})
export class ShortlinkModule {}
