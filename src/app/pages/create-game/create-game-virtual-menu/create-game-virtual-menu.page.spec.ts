import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateGameVirtualMenuPage } from './create-game-virtual-menu.page';

describe('CreateGameVirtualMenuPage', () => {
  let component: CreateGameVirtualMenuPage;
  let fixture: ComponentFixture<CreateGameVirtualMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameVirtualMenuPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGameVirtualMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
