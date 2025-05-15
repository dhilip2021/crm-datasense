// app/store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  statuscode: 0,
  message: '',
  payloadJson: {},
  error: '',
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    loginData: (state, action) => {
      const { appStatusCode, message, payloadJson, error } = action.payload;

      state.statuscode = appStatusCode;
      state.message = message;
      state.payloadJson = payloadJson;
      state.error = error;
    },
  },
});

export const { loginData } = loginSlice.actions;
export default loginSlice.reducer;
