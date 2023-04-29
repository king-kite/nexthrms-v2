import { AxiosResponse } from 'axios';
import React from 'react';

import { SplashScreen } from '../../components/common';
import { USER_DATA_URL } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { SuccessResponseType, AuthDataType } from '../../types';
import { axiosInstance } from '../../utils/axios';

const CheckAuth = ({
	children,
	authData,
}: {
	children: React.ReactNode;
	authData?: AuthDataType;
}) => {
	const [loading, setLoading] = React.useState(!authData ? true : false);

	const { login, logout } = useAuthContext();

	React.useEffect(() => {
		if (authData) {
			setLoading(false);
			login(authData);
		}
	}, [authData, login]);

	React.useEffect(() => {
		async function checkAuth() {
			if (!authData) setLoading(true);
			await axiosInstance
				.get(USER_DATA_URL)
				.then((response: AxiosResponse<SuccessResponseType<AuthDataType>>) =>
					login(response.data.data)
				)
				.catch(() => {
					logout();
				})
				.finally(() => {
					setLoading(false);
				});
		}
		checkAuth();
	}, [login, logout, authData]);

	return loading ? (
		<SplashScreen />
	) : (
		<React.Fragment>{children}</React.Fragment>
	);
};

export default CheckAuth;

// import { useQuery } from '@tanstack/react-query';
// import axios, { AxiosResponse } from 'axios';
// import React from 'react';

// import { SplashScreen } from '../../components/common';
// import { USER_DATA_URL } from '../../config';
// import { useAuthContext } from '../../store/contexts';
// import { SuccessResponseType, AuthDataType } from '../../types';

// const CheckAuth = ({
// 	children,
// 	authData,
// }: {
// 	children: React.ReactNode;
// 	authData?: AuthDataType;
// }) => {
// 	const { login, logout } = useAuthContext();

// 	const { isLoading } = useQuery(
// 		['auth'],
// 		() =>
// 			axios
// 				.get(USER_DATA_URL)
// 				.then(
// 					(response: AxiosResponse<SuccessResponseType<AuthDataType>>) =>
// 						response.data.data
// 				),
// 		{
// 			onSuccess(data: AuthDataType) {
// 				login(data);
// 			},
// 			initialData() {
// 				return authData;
// 			},
// 			onError() {
// 				logout();
// 			},
// 		}
// 	);

// 	return isLoading ? (
// 		<SplashScreen />
// 	) : (
// 		<React.Fragment>{children}</React.Fragment>
// 	);
// };

// export default CheckAuth;
