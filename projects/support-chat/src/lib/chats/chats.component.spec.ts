import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibChatsComponent } from './chats.component';

describe('ChatsComponent', () => {
  let component: LibChatsComponent;
  let fixture: ComponentFixture<LibChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibChatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
