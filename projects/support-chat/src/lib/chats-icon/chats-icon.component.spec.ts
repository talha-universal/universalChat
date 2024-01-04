import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsIconComponent } from './chats-icon.component';

describe('ChatsIconComponent', () => {
  let component: ChatsIconComponent;
  let fixture: ComponentFixture<ChatsIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
