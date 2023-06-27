import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Error from 'next/error';

import Layout from '../layout';
import Authenticated from '../layout/protections/authenticated';
import CheckAuth from '../layout/protections/check-auth';
import NotAuthenticated from '../layout/protections/not-authenticated';
import GlobalContextProvider from '../store';
import '../styles/globals.css';

type ComponentWithAuthRequiredProp = AppProps & {
	Component: AppProps['Component'] & {
		authRequired?: boolean;
		noWrapper?: boolean; // do not add check auth wrapper. Mainly for documentation and error pages.
	};
};

// const ReactQueryDevtools = dynamic(
// 	() =>
// 		import('@tanstack/react-query-devtools').then(
// 			(mod) => mod.ReactQueryDevtools
// 		),
// 	{
// 		ssr: false,
// 	}
// );

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
	// Not returning error page so the authenticated wrapper can show login page instead
	return errorPage && errorPage.statusCode !== 401 ? (
		<Error
			statusCode={errorPage?.statusCode || 500}
			title={
				errorPage?.title || errorPage?.statusCode === 403
					? 'You are not authorized to view this page!'
					: 'A server error occurred'
			}
		/>
	) : Component.noWrapper ? (
		<GlobalContextProvider>
			<Component {...pageProps} />
		</GlobalContextProvider>
	) : (
		<GlobalContextProvider>
			<QueryClientProvider client={queryClient}>
				<CheckAuth authData={auth}>
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
				</CheckAuth>
				{/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
			</QueryClientProvider>
		</GlobalContextProvider>
	);
}

export default App;
