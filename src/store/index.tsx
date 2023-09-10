import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { AlertProvider, AlertModalProvider, AuthProvider } from './contexts';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			networkMode: 'always',
			// staleTime: 15 * 60 * 1000, // 15 mins
		},
		mutations: {
			networkMode: 'always',
		},
	},
});

function GlobalProvider({ children }: { children: React.ReactNode }) {
	return (
		<AlertProvider>
			<AlertModalProvider>
				<AuthProvider>
					<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
				</AuthProvider>
			</AlertModalProvider>
		</AlertProvider>
	);
}

export * as tags from './tagTypes';
export default GlobalProvider;
