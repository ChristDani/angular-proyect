import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransferBetweenAccounts } from './modal-transfer-between-accounts';

describe('ModalTransferBetweenAccounts', () => {
  let component: ModalTransferBetweenAccounts;
  let fixture: ComponentFixture<ModalTransferBetweenAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTransferBetweenAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTransferBetweenAccounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
