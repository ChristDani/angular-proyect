import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertModal } from './alert-modal';

describe('AlertModal', () => {
  let component: AlertModal;
  let fixture: ComponentFixture<AlertModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
