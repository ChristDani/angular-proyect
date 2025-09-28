import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalThirdTransfer } from './modal-third-transfer';

describe('ModalThirdTransfer', () => {
  let component: ModalThirdTransfer;
  let fixture: ComponentFixture<ModalThirdTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalThirdTransfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalThirdTransfer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
