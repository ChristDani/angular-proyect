import { TestBed } from '@angular/core/testing';

import { Transactions } from './transactions';

describe('Transactions', () => {
  let service: Transactions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Transactions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
