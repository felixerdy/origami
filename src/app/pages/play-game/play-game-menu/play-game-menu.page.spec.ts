import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlayGameMenuPage } from './play-game-menu.page';

describe('PlayGameMenuPage', () => {
  let component: PlayGameMenuPage;
  let fixture: ComponentFixture<PlayGameMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayGameMenuPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayGameMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});