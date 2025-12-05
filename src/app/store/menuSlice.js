// app/store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  statuscode: 0,
  message: '',
  payloadJson: [],
  error: '',
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    menuData: (state, action) => {
      const { appStatusCode, message, payloadJson, error } = action.payload;
      state.statuscode = appStatusCode;
      state.message = message;
      state.payloadJson = payloadJson;
      state.error = error;
    },
  },
});

export const { menuData } = menuSlice.actions;
export default menuSlice.reducer;
