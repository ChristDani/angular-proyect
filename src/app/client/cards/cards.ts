import { Component } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../models/interfaces/card.interface';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../models/interfaces/account.interface';

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

  constructor(
    private auth: AuthService,
    private cardService: CardService,
    private accountService: AccountService,
  ) {}

  ngOnInit(): void {
    const id = this.auth.getLoggedInUser()?.id;
    this.getAccountsByUserId(Number(id));
  }

  getAccountsByUserId(user: number | undefined): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe((accounts: Account[]) => {
      if (user !== undefined) {
        const cuentas = accounts.filter((account: Account) => account.userId === user);
        this.isLoading = false;
        this.getCards();

      }
    });
  }
  getCards(): void {
    this.cardService.getCards().subscribe((cards: Card[]) => {
     this.cards = cards;
    });
  }
}
