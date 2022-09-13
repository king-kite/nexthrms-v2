import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import { IconContext } from 'react-icons';
import { Provider } from 'react-redux';

import Layout from '../layout';
import {
	Authenticated,
	CheckAuth,
	NotAuthenticated,
} from '../layout/protections';
import GlobalContextProvider, { store } from '../store';
import '../styles/globals.css';

type ComponentWithAuthRequiredProp = AppProps & {
	Component: AppProps['Component'] & {
		authRequired?: boolean;
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
	pageProps: { auth, ...pageProps },
}: ComponentWithAuthRequiredProp) {
	return (
		<Provider store={store}>
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
		</Provider>
	);
}

export default App;
