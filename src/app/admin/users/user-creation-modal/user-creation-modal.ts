import { Component, Inject, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../models/interfaces/user.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { MATERIAL_IMPORTS } from '../../../shared/components/material.imports';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-user-creation-modal',
  imports: [MATERIAL_IMPORTS, ReactiveFormsModule],
  templateUrl: './user-creation-modal.html',
  styleUrl: './user-creation-modal.css',
})
export class UserCreationModal {
  @Input() user?: User;
  isEdit: boolean = false;

  userForm!: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  roles = [
    { value: 'client', label: 'Cliente' },
    { value: 'admin', label: 'Administrador' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserCreationModal, User | null>,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) public data?: User
  ) {}

  ngOnInit(): void {
    const userData = this.user ?? this.data;

    this.isEdit = !!userData;
    // Si es edición, la contraseña no debe ser obligatoria.
    const passwordValidators = this.isEdit ? [] : [Validators.required];

    this.userForm = this.fb.group({
      username: [userData?.username ?? '', [Validators.required, Validators.minLength(3)]],
      password: [userData?.username ?? '', passwordValidators],
      role: [userData?.role ?? '', Validators.required],
      name: [userData?.name ?? '', Validators.required],
    });
  }

  submit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const userData = this.user ?? this.data;
    const passwordValue = this.userForm.get('password')!.value;
    const basePayload: Partial<User> = {
      id: userData?.id ?? String(this.generateId()),
      username: this.userForm.get('username')!.value,
      role: this.userForm.get('role')!.value,
      name: this.userForm.get('name')!.value,
      password: this.userForm.get('password')!.value,
    };
    if (passwordValue) {
      (basePayload as any).password = passwordValue;
    }

    const request$ = userData
      ? this.userService.updateUser(basePayload as User)
      : this.userService.createUser(basePayload as User);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.userForm.reset();
        this.isSubmitting = false;
        this.dialogRef.close(result);
        if (this.isEdit) {
          this.toastService.show(`Usuario actualizado exitosamente`, 'success');
        } else {
          this.toastService.show(`Usuario creado exitosamente`, 'success');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
      },
    });
  }

  // Generador simple de id string (timestamp + aleatorio pequeño)
  private generateId(): string {
    const stringId = `${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;
    return stringId;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
