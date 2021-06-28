import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateGameVirtualPage } from './create-game-virtual.page';

describe('CreateGameVirtualPage', () => {
  let component: CreateGameVirtualPage;
  let fixture: ComponentFixture<CreateGameVirtualPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameVirtualPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGameVirtualPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});