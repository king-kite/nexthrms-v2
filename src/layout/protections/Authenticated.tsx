import { useRouter } from 'next/router';
import React from 'react';

import { LOGIN_PAGE_URL } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { Navigate } from '../../utils';

const Authenticated = ({ children }: { children: React.ReactNode }) => {
	const { auth: isAuthenticated, loading: isLoading } = useAuthContext();

	const { pathname } = useRouter();

	return isLoading === false && isAuthenticated ? (
		<React.Fragment>{children}</React.Fragment>
	) : isLoading === false && isAuthenticated === false ? (
		<Navigate
			to={LOGIN_PAGE_URL}
			query={{
				next: pathname,
			}}
		/>
	) : (
		<></>
	);
};

export default Authenticated;
