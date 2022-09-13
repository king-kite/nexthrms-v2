import { useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import { EMAIL_RESEND_URL } from '../../../config';
import VerifyEmail from '../../../containers/account/Email/Verify';
import { BaseResponseType } from '../../../types';
import { axiosInstance, Title } from '../../../utils';
import { handleAxiosErrors } from '../../../validators';

const Page = () => {
	const [successMessage, setSuccessMessage] = React.useState<string>();
	const [errors, setErrors] = React.useState<{
		email?: string;
		message?: string;
	}>();

	const { mutate: sendEmail, isLoading: loading } = useMutation(
		(form: { email: string }) =>
			axiosInstance.post(EMAIL_RESEND_URL, form, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}),
		{
			onSuccess(response: AxiosResponse<BaseResponseType>) {
				setSuccessMessage(response.data.message);
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
						message:
							err?.message ||
							'An error occurred. Unable to send verification email.',
					};
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		(form: { email: string }) => {
			setErrors(undefined);
			setSuccessMessage(undefined);
			if (!form.email || form.email === '') {
				setErrors((prevErrors) => ({
					...prevErrors,
					email: 'Email address is required',
				}));
			} else {
				sendEmail(form);
			}
		},
		[sendEmail]
	);

	return (
		<React.Fragment>
			<Title title="Verify Email Address" />
			<VerifyEmail
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
				successMessage={successMessage}
				removeSuccessMessage={() => setSuccessMessage(undefined)}
			/>
		</React.Fragment>
	);
};

Page.authRequired = false;

export default Page;
