import { createSlice } from '@reduxjs/toolkit';

interface StepsState {
  today: number;
  thisWeek: number;
  thisMonth: number;
  history: any[];
  loading: boolean;
}

const initialState: StepsState = {
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  history: [],
  loading: false,
};

const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    setSteps: (state, action) => {
      state.today = action.payload.today || 0;
      state.thisWeek = action.payload.thisWeek || 0;
      state.thisMonth = action.payload.thisMonth || 0;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addSteps: (state, action) => {
      state.today += action.payload;
    },
  },
});

export const { setSteps, setHistory, setLoading, addSteps } = stepsSlice.actions;
export default stepsSlice.reducer;
