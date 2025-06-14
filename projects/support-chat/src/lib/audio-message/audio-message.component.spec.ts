import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioMessageComponent } from './audio-message.component';

describe('AudioMessageComponent', () => {
  let component: AudioMessageComponent;
  let fixture: ComponentFixture<AudioMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
