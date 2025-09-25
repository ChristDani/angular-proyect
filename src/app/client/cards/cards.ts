import { Component } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cards',
  imports: [...MATERIAL_IMPORTS, CommonModule, FormsModule],
  templateUrl: './cards.html',
  styleUrl: './cards.css'
})
export class Cards {
isDebitActive: boolean = false;
isCreditActive: boolean = true;}
