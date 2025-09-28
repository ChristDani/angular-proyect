import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmOp } from './modal-confirm-op';

describe('ModalConfirmOp', () => {
  let component: ModalConfirmOp;
  let fixture: ComponentFixture<ModalConfirmOp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfirmOp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfirmOp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
