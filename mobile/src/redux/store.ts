// FitKart Redux Store Configuration

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import stepsReducer from './slices/stepsSlice';
import coinsReducer from './slices/coinsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    steps: stepsReducer,
    coins: coinsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
