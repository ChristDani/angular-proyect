import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalServicePayment } from './modal-service-payment';

describe('ModalServicePayment', () => {
  let component: ModalServicePayment;
  let fixture: ComponentFixture<ModalServicePayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalServicePayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalServicePayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
