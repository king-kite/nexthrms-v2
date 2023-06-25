import dynamic from 'next/dynamic';
import React from 'react';

import { useAuthContext } from '../../store/contexts';

const DynamicLoginPage = dynamic<any>(
	() => import('../../containers/account/login'),
	{
		loading: () => (
			<div className="flex items-center justify-center min-h-[100vh] w-full">
				<p className="text-gray-500 text-center text-sm md:text-base">
					Loading Authentication Page...
				</p>
			</div>
		),
		ssr: false,
	}
);

const Authenticated = ({ children }: { children: React.ReactNode }) => {
	const { auth: isAuthenticated, loading: isLoading } = useAuthContext();

	return isLoading === false && isAuthenticated ? (
		<React.Fragment>{children}</React.Fragment>
	) : isLoading === false && isAuthenticated === false ? (
		<DynamicLoginPage />
	) : (
		<></>
	);
};

export default Authenticated;

// import { useRouter } from 'next/router';
// import React from 'react';

// import { LOGIN_PAGE_URL } from '../../config';
// import { useAuthContext } from '../../store/contexts';
// import { Navigate } from '../../utils';

// const Authenticated = ({ children }: { children: React.ReactNode }) => {
// 	const { auth: isAuthenticated, loading: isLoading } = useAuthContext();

// 	const { asPath } = useRouter();

// 	return isLoading === false && isAuthenticated ? (
// 		<React.Fragment>{children}</React.Fragment>
// 	) : isLoading === false && isAuthenticated === false ? (
// 		<Navigate
// 			to={LOGIN_PAGE_URL}
// 			query={{
// 				next: asPath,
// 			}}
// 		/>
// 	) : (
// 		<></>
// 	);
// };

// export default Authenticated;
