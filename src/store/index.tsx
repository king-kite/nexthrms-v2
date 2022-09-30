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
