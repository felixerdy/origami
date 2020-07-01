import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IbeaconPage } from './ibeacon.page';

describe('IbeaconPage', () => {
  let component: IbeaconPage;
  let fixture: ComponentFixture<IbeaconPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbeaconPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IbeaconPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
