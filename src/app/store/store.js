// app/store/store.js
import { configureStore } from '@reduxjs/toolkit';

import counterReducer from './counterSlice';
import LoginReducer from './loginSlice';
import OrganizationReducer from './organizationSlice';
import menuReducer from './menuSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    login: LoginReducer,
    organization: OrganizationReducer,
    menu: menuReducer,    
  },
});
