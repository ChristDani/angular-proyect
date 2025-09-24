import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOp } from './modal-op';

describe('ModalOp', () => {
  let component: ModalOp;
  let fixture: ComponentFixture<ModalOp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
