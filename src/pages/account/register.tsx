import { useMutation } from '@tanstack/react-query';
import Router from 'next/router';
import React from 'react';

import { REQUEST_EMAIL_VERIFY_PAGE_URL, REGISTER_URL } from '../../config';
import Register from '../../containers/account/register';
import { axiosInstance, Title } from '../../utils';
import { handleYupErrors, handleAxiosErrors } from '../../validators';
import { registerSchema } from '../../validators/auth';

const Page = () => {
	const [errors, setErrors] = React.useState<{
		email?: string;
		password?: string;
		message?: string;
	}>();

	const { mutate: signUp, isLoading: loading } = useMutation(
		(form: { email: string; password: string }) =>
			axiosInstance.post(REGISTER_URL, form, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}),
		{
			onSuccess() {
				Router.push(REQUEST_EMAIL_VERIFY_PAGE_URL);
			},
			onError(error) {
				const err = handleAxiosErrors(error);
				setErrors((prevErrors) => {
					if (err?.data)
						return {
							...prevErrors,
							...err.data,
						};
					return {
						...prevErrors,
						message: err?.message || 'An error occurred. Unable to sign up.',
					};
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		async (form: { email: string; password: string }) => {
			try {
				setErrors(undefined);
				const valid = await registerSchema.validate(form);
				signUp(valid);
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
						message: 'An error occurred. Unable to sign up.',
					};
				});
			}
		},
		[signUp]
	);

	return (
		<React.Fragment>
			<Title title="Sign Up Into Kite Human Resource Management System" />
			<Register
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
