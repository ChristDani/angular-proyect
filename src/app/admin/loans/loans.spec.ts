import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loans } from './loans';

describe('Loans', () => {
  let component: Loans;
  let fixture: ComponentFixture<Loans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
