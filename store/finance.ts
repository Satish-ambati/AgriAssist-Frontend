import { create } from "zustand";

type Note = { id: number; title: string; amount: number; date: string };
type Debt = {
  id: number;
  lender: string;
  borrowedAmount: number;
  interestAccumulated: number;
  totalPayable: number;
  borrowedDate: string;
  interestRate: number;
};
type HistoryItem = { id: number; text: string };

type FinanceState = {
  notes: Note[];
  debts: Debt[];
  history: HistoryItem[];
  addNote: (note: Note) => void;
  removeNote: (id: number) => void;
  addDebt: (debt: Debt) => void;
  markDebtPaid: (id: number) => void;
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  notes: [],
  debts: [],
  history: [],
  
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  removeNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),
  
  addDebt: (debt) => set((state) => ({ debts: [...state.debts, debt] })),
  markDebtPaid: (id) => {
    const debt = get().debts.find(d => d.id === id);
    if (!debt) return;
    set((state) => ({
      debts: state.debts.filter(d => d.id !== id),
      history: [
        ...state.history,
        {
          id: Date.now(),
          text: `[PAID] Loan from ${debt.lender} → ₹${debt.borrowedAmount} + Interest ₹${debt.interestAccumulated}`,
        },
      ],
    }));
  },
}));
