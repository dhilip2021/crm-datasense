// app/store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  statuscode: 0,
  message: '',
  payloadJson: {},
  error: '',
};

const organizationSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    organizationData: (state, action) => {
      const { appStatusCode, message, payloadJson, error } = action.payload;

      state.statuscode = appStatusCode;
      state.message = message;
      state.payloadJson = payloadJson;
      state.error = error;
    },
  },
});

export const { organizationData } = organizationSlice.actions;
export default organizationSlice.reducer;
