import { useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import { LOGIN_URL } from '../../config';
import Login from '../../containers/account/login';
import { useAuthContext } from '../../store/contexts';
import { AuthDataType, SuccessResponseType } from '../../types';
import { axiosInstance, Title } from '../../utils';
import {
	loginSchema,
	handleJoiErrors,
	handleAxiosErrors,
} from '../../validators';

const Page = () => {
	const [errors, setErrors] = React.useState<{
		email?: string;
		password?: string;
		message?: string;
	}>();

	const { login } = useAuthContext();

	const { mutate: signIn, isLoading: loading } = useMutation(
		(form: { email: string; password: string }) =>
			axiosInstance.post(LOGIN_URL, form, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}),
		{
			onSuccess(response: AxiosResponse<SuccessResponseType<AuthDataType>>) {
				if (response.data && response.data.data) login(response.data.data);
			},
			onError(error) {
				const err = handleAxiosErrors<{
					email?: string;
					password?: string;
				}>(error);
				setErrors((prevErrors) => {
					if (err?.data)
						return {
							...prevErrors,
							message:
								!err.data?.email && !err.data?.password
									? 'An error occurred. Unable to sign in.'
									: undefined,
							...err.data,
						};
					return {
						...prevErrors,
						message: err?.message || 'An error occurred. Unable to sign in.',
					};
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		async (form: { email: string; password: string }) => {
			try {
				setErrors(undefined);
				const valid = await loginSchema.validateAsync(form);
				signIn(valid);
			} catch (error) {
				const err = handleJoiErrors<{
					email?: string;
					password?: string;
				}>(error);
				setErrors((prevErrors) => {
					if (err) {
						return {
							...prevErrors,
							...err,
						};
					}
					return {
						...prevErrors,
						message: 'An error occurred. Unable to sign in.',
					};
				});
			}
		},
		[signIn]
	);

	return (
		<React.Fragment>
			<Title title="Login Into Kite Human Resource Management System" />
			<Login
				loading={loading}
				errors={errors}
				onSubmit={handleSubmit}
				removeError={(name: string) => {
					if (Object(errors)[name])
						setErrors((prevErrors) => ({
							...prevErrors,
							[name]: '',
						}));
				}}
			/>
		</React.Fragment>
	);
};

Page.authRequired = false;

export default Page;
