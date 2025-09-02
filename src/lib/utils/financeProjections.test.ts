import { describe, it, expect } from 'vitest';
import { calculateProjections, type Account, type Transaction } from './financeProjections';

describe('calculateProjections', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc1',
      name: 'Checking',
      type: 'CHECKING',
      initial_balance: 1000,
      current_balance: 1000, // Current balance for testing
      credit_limit: null,
      due_day: null,
    },
    {
      id: 'cc1',
      name: 'Credit Card',
      type: 'CREDIT_CARD',
      initial_balance: 0,
      current_balance: -500, // Current balance for testing
      credit_limit: 1000,
      due_day: 15,
    },
  ];

  // Calculate initial total balance from mockAccounts
  const initialTotalBalance = mockAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  it('should calculate projections correctly with no special transactions', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx1',
        description: 'Initial Expense',
        amount: -100,
        date: new Date().toISOString().split('T')[0],
        account_id: 'acc1',
        category_id: 'cat1',
        is_recurrent: false,
        recurrence_interval: null,
        installments_total: null,
        installments_paid: null,
        installment_start_date: null,
      },
    ];

    const projections = calculateProjections(mockAccounts, transactions, 1);
    expect(projections.length).toBe(1);
    // Initial total balance (500) + transaction (-100) = 400
    expect(projections[0].projected_balance).toBeCloseTo(initialTotalBalance + transactions[0].amount);
    expect(projections[0].transactions.length).toBe(1);
  });

  it('should handle recurrent transactions correctly', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx2',
        description: 'Monthly Salary',
        amount: 2000,
        date: new Date().toISOString().split('T')[0],
        account_id: 'acc1',
        category_id: 'cat2',
        is_recurrent: true,
        recurrence_interval: 'MONTHLY',
        installments_total: null,
        installments_paid: null,
        installment_start_date: null,
      },
    ];

    const projections = calculateProjections(mockAccounts, transactions, 3);
    expect(projections.length).toBe(3);
    // Initial total balance (500) + 3 months of salary (2000 * 3) = 6500
    expect(projections[2].projected_balance).toBeCloseTo(initialTotalBalance + (2000 * 3));
    expect(projections[0].transactions.length).toBe(1);
    expect(projections[1].transactions.length).toBe(1);
    expect(projections[2].transactions.length).toBe(1);
  });

  it('should handle installment transactions correctly', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx3',
        description: 'Laptop Installment',
        amount: -300,
        date: new Date().toISOString().split('T')[0],
        account_id: 'cc1',
        category_id: 'cat3',
        is_recurrent: false,
        recurrence_interval: null,
        installments_total: 3,
        installments_paid: 0,
        installment_start_date: new Date().toISOString().split('T')[0],
      },
    ];

    const projections = calculateProjections(mockAccounts, transactions, 3);
    expect(projections.length).toBe(3);
    // Initial total balance (500) - 3 months of installment (-100 * 3) = 200
    expect(projections[2].projected_balance).toBeCloseTo(initialTotalBalance + ((-300 / 3) * 3));
    expect(projections[0].transactions.length).toBe(1);
    expect(projections[0].transactions[0].amount).toBeCloseTo(-100);
    expect(projections[0].transactions[0].installment_number).toBe(1);
    expect(projections[1].transactions.length).toBe(1);
    expect(projections[1].transactions[0].amount).toBeCloseTo(-100);
    expect(projections[1].transactions[0].installment_number).toBe(2);
    expect(projections[2].transactions.length).toBe(1);
    expect(projections[2].transactions[0].amount).toBeCloseTo(-100);
    expect(projections[2].transactions[0].installment_number).toBe(3);
  });

  it('should handle a mix of recurrent and installment transactions', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx4',
        description: 'Monthly Salary',
        amount: 2000,
        date: new Date().toISOString().split('T')[0],
        account_id: 'acc1',
        category_id: 'cat2',
        is_recurrent: true,
        recurrence_interval: 'MONTHLY',
        installments_total: null,
        installments_paid: null,
        installment_start_date: null,
      },
      {
        id: 'tx5',
        description: 'Rent',
        amount: -1000,
        date: new Date().toISOString().split('T')[0],
        account_id: 'acc1',
        category_id: 'cat3',
        is_recurrent: true,
        recurrence_interval: 'MONTHLY',
        installments_total: null,
        installments_paid: null,
        installment_start_date: null,
      },
      {
        id: 'tx6',
        description: 'Car Payment',
        amount: -600,
        date: new Date().toISOString().split('T')[0],
        account_id: 'acc1',
        category_id: 'cat4',
        is_recurrent: false,
        recurrence_interval: null,
        installments_total: 6,
        installments_paid: 0,
        installment_start_date: new Date().toISOString().split('T')[0],
      },
    ];

    const projections = calculateProjections(mockAccounts, transactions, 2);
    expect(projections.length).toBe(2);

    // Initial total balance (500)
    // Month 1: 500 + Salary (2000) - Rent (1000) - Car (100) = 1400
    expect(projections[0].projected_balance).toBeCloseTo(initialTotalBalance + 2000 - 1000 - (600 / 6));
    expect(projections[0].transactions.length).toBe(3);

    // Month 2: Previous (1400) + Salary (2000) - Rent (1000) - Car (100) = 2300
    expect(projections[1].projected_balance).toBeCloseTo(initialTotalBalance + (2000 - 1000 - (600 / 6)) * 2);;
    expect(projections[1].transactions.length).toBe(3);
  });
});
