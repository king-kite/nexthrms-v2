import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import Error from 'next/error';
import { IconContext } from 'react-icons';

import Layout from '../layout';
import {
	Authenticated,
	CheckAuth,
	NotAuthenticated,
} from '../layout/protections';
import GlobalContextProvider from '../store';
import '../styles/globals.css';

type ComponentWithAuthRequiredProp = AppProps & {
	Component: AppProps['Component'] & {
		authRequired?: boolean;
		noWrapper?: boolean; // do not add check auth wrapper. Mainly for documentation and error pages.
	};
};

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			// staleTime: 15 * 60 * 1000, // 15 mins
		},
	},
});

function App({
	Component,
	pageProps: { auth, errorPage, ...pageProps },
}: ComponentWithAuthRequiredProp) {
	return errorPage ? (
		<Error
			statusCode={errorPage?.statusCode || 500}
			title={errorPage?.title || 'A server error occurred'}
		/>
	) : Component.noWrapper ? (
		<Component {...pageProps} />
	) : (
		<GlobalContextProvider>
			<QueryClientProvider client={queryClient}>
				<CheckAuth authData={auth}>
					<IconContext.Provider value={{ className: 'text-xs' }}>
						{Component.authRequired === false ? (
							<NotAuthenticated>
								<Component {...pageProps} />
							</NotAuthenticated>
						) : (
							<Authenticated>
								<Layout>
									<Component {...pageProps} />
								</Layout>
							</Authenticated>
						)}
					</IconContext.Provider>
				</CheckAuth>
				<ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
			</QueryClientProvider>
		</GlobalContextProvider>
	);
}

export default App;
