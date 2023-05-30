import React from 'react';

import LoginPage from '../../containers/account/login';
import { useAuthContext } from '../../store/contexts';

const Authenticated = ({ children }: { children: React.ReactNode }) => {
	const { auth: isAuthenticated, loading: isLoading } = useAuthContext();

	return isLoading === false && isAuthenticated ? (
		<React.Fragment>{children}</React.Fragment>
	) : isLoading === false && isAuthenticated === false ? (
		<LoginPage />
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
