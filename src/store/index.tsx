import React from 'react';

import { AlertProvider, AlertModalProvider, AuthProvider } from './contexts';

function GlobalProvider({ children }: { children: React.ReactNode }) {
	return (
		<AlertProvider>
			<AlertModalProvider>
				<AuthProvider>{children}</AuthProvider>
			</AlertModalProvider>
		</AlertProvider>
	);
}

export * as tags from './tagTypes';
export default GlobalProvider;

import { configureStore } from '@reduxjs/toolkit';
import { NODE_ENV } from '../config';
import { baseApi } from './features/base';
import alertModalReducer from './features/alert-modal-slice';
import alertReducer from './features/alert-slice';
import authReducer from './features/auth-slice';
import modalReducer from './features/modal-slice';

export const store = configureStore({
	devTools: NODE_ENV === 'development',
	reducer: {
		alert: alertReducer,
		alertModal: alertModalReducer,
		auth: authReducer,
		modal: modalReducer,
		[baseApi.reducerPath]: baseApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			// serializableCheck: {
			//   ignoredActions: ["alertModal/open", "alertModal/close"],
			// },
			serializableCheck: false,
		}).concat(baseApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export * from './utils';
