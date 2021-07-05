import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateGameVirtualListPage } from './create-game-virtual-list.page';

describe('CreateGameVirtualListPage', () => {
  let component: CreateGameVirtualListPage;
  let fixture: ComponentFixture<CreateGameVirtualListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameVirtualListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGameVirtualListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});