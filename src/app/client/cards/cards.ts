import { Component } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../models/interfaces/card.interface';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../models/interfaces/account.interface';
import { ToastService } from '../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ManageLimitModal } from './manage-limit-modal/manage-limit-modal';

@Component({
  selector: 'app-cards',
  imports: [...MATERIAL_IMPORTS, CommonModule, FormsModule],
  templateUrl: './cards.html',
  styleUrl: './cards.css',
})
export class Cards {
  isDebitActive: boolean = false;
  isCreditActive: boolean = true;
  isLoading: boolean = false;
  cards: Card[] = [];
  cardsAccounts: string[] = [];

  constructor(
    private auth: AuthService,
    private cardService: CardService,
    private accountService: AccountService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.auth.getLoggedInUser()?.id;
    this.getAccountsByUserId(id);
  }

  getAccountsByUserId(user: string | undefined): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe((accounts: Account[]) => {
      if (user !== undefined) {
        this.cardsAccounts = accounts
          .filter((account: Account) => account.userId === user)
          .map((account: Account) => account.id);
        this.getCardsByAccounts(this.cardsAccounts);
      }
    });
  }

  getCardsByAccounts(accountsIds: string[]): void {
    this.cardService.getCards().subscribe((cards: Card[]) => {
      this.cards = cards.filter((card) => accountsIds.includes(card.accountId));
      this.isLoading = false;
    });
  }

  toggleCardStatus(card: Card) {
    card.status = card.status === 'activa' ? 'inactiva' : 'activa';
    this.cardService.updateCard(card).subscribe({
      next: (updatedCard) => {
        this.toastService.show(`Tarjeta de ${card.type} ${card.status}da exitosamente`, 'success');
      },
      error: (error) => {
        this.toastService.show(`No se pudo ${card.status}r la tarjeta de ${card.type} `, 'error');
        card.status = card.status === 'activa' ? 'inactiva' : 'activa';
      },
    });
  }

  showModalLimits(card: Card) {
    const ref = this.dialog.open(ManageLimitModal, {
      width: '500px',
      data: {
        card,
      },
    });

    ref.afterClosed().subscribe((updated) => {
      if (updated) {
        this.getCardsByAccounts(this.cardsAccounts);
      }
    });
  }
}
