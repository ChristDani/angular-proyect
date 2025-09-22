import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cabecera } from './cabecera';

describe('Cabecera', () => {
  let component: Cabecera;
  let fixture: ComponentFixture<Cabecera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cabecera]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cabecera);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
