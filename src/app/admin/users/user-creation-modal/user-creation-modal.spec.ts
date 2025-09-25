import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreationModal } from './user-creation-modal';

describe('UserCreationModal', () => {
  let component: UserCreationModal;
  let fixture: ComponentFixture<UserCreationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCreationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
