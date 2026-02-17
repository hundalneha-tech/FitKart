import { createSlice } from '@reduxjs/toolkit';

interface CoinsState {
  balance: number;
  earned: number;
  spent: number;
  history: any[];
  loading: boolean;
}

const initialState: CoinsState = {
  balance: 0,
  earned: 0,
  spent: 0,
  history: [],
  loading: false,
};

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    addCoins: (state, action) => {
      state.balance += action.payload;
      state.earned += action.payload;
    },
    spendCoins: (state, action) => {
      state.balance -= action.payload;
      state.spent += action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setBalance, addCoins, spendCoins, setHistory, setLoading } = coinsSlice.actions;
export default coinsSlice.reducer;
