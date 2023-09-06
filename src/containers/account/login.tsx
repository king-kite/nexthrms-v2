import { useMutation } from '@tanstack/react-query';
import React from 'react';

import { LOGIN_URL } from '../../config';
import { Login as LoginComponent } from '../../components/account';
import { useAuthContext } from '../../store/contexts';
import { AuthDataType, SuccessResponseType } from '../../types';
import axiosInstance from '../../utils/axios/authRedirectInstance';
import { handleYupErrors, handleAxiosErrors } from '../../validators';
import { loginSchema } from '../../validators/auth';

const Login = () => {
	const [errors, setErrors] = React.useState<{
		email?: string;
		password?: string;
		message?: string;
	}>();

	const { login } = useAuthContext();

	const { mutate: signIn, isLoading: loading } = useMutation({
		mutationKey: ['auth'],
		async mutationFn(form: { email: string; password: string }) {
			const response = await axiosInstance.post(LOGIN_URL, form);
			return response.data;
		},
		onSuccess(response: SuccessResponseType<{ user: AuthDataType }>) {
			login(response.data.user);
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
	});

	const handleSubmit = React.useCallback(
		async (form: { email: string; password: string }) => {
			try {
				setErrors(undefined);
				const valid = await loginSchema.validate(form, { abortEarly: false });
				signIn(valid);
			} catch (error) {
				const err = handleYupErrors<{
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
		<LoginComponent
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
	);
};

export default Login;
