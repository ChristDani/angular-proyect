import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCreationModal } from './product-creation-modal';

describe('ProductCreationModal', () => {
  let component: ProductCreationModal;
  let fixture: ComponentFixture<ProductCreationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCreationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
