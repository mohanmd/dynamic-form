import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import formsReducer from '../features/forms/formsSlice';
import builderReducer from '../features/builder/builderSlice';
import publicFormReducer from '../features/publicForm/publicFormSlice';
import submissionsReducer from '../features/submissions/submissionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formsReducer,
    builder: builderReducer,
    publicForm: publicFormReducer,
    submissions: submissionsReducer,
  },
});
