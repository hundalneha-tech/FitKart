import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  profilePicture: string | null;
  totalSteps: number;
  totalCoins: number;
  loading: boolean;
}

const initialState: UserState = {
  id: null,
  email: null,
  fullName: null,
  phone: null,
  profilePicture: null,
  totalSteps: 0,
  totalCoins: 0,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateCoins: (state, action) => {
      state.totalCoins = action.payload;
    },
    updateSteps: (state, action) => {
      state.totalSteps = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetUser: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, updateCoins, updateSteps, setLoading, resetUser } = userSlice.actions;
export default userSlice.reducer;
