import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { ManageComponent } from './manage.component';

describe('ManageComponent', () => {
    let component: ManageComponent;
    let fixture: ComponentFixture<ManageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SharedModule],
            declarations: [ManageComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('It should success, create component', () => {
        expect(component).toBeTruthy();
    });
});
