import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateGameMenuPage } from './create-game-menu.page';

describe('CreateGameMenuPage', () => {
  let component: CreateGameMenuPage;
  let fixture: ComponentFixture<CreateGameMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameMenuPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGameMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
