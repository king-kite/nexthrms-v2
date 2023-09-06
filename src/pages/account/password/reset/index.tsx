import { useMutation } from '@tanstack/react-query';
import React from 'react';

import { PASSWORD_RESET_URL } from '../../../../config/server';
import PasswordReset from '../../../../containers/account/password/reset';
import useInterval from '../../../../hooks/useInterval';
import type { ResponseType } from '../../../../types';
import axiosInstance from '../../../../utils/axios/authRedirectInstance';
import Title from '../../../../utils/components/title';
import { handleAxiosErrors } from '../../../../validators';

const Page = () => {
	const [successMessage, setSuccessMessage] = React.useState<string>();
	const [errors, setErrors] = React.useState<{
		email?: string;
		message?: string;
	}>();
	const [resendAfter, setResendAfter] = React.useState(0);

	const { toggleInterval } = useInterval(
		() => {
			setResendAfter((prevState) => (prevState < 1 ? 0 : prevState - 1));
		},
		1000,
		{ status: 'pause' }
	);

	const { mutate: sendEmail, isLoading: loading } = useMutation(
		async function (form: { email: string }) {
			const response = await axiosInstance.post(PASSWORD_RESET_URL, form);
			return response.data;
		},
		{
			onSuccess(response: ResponseType) {
				setSuccessMessage(response.message);
				setResendAfter(60);
				toggleInterval('play');
			},
			onError(error) {
				const err = handleAxiosErrors<{
					email?: string;
				}>(error);
				setErrors((prevErrors) => {
					if (err?.data)
						return {
							...prevErrors,
							...err.data,
						};
					return {
						...prevErrors,
						message: err?.message || 'An error occurred. Unable to send password reset email.',
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
			} else if (resendAfter <= 0) {
				sendEmail(form);
			}
		},
		[resendAfter, sendEmail]
	);

	React.useEffect(() => {
		if (resendAfter <= 0) {
			toggleInterval('pause');
		}
	}, [resendAfter, toggleInterval]);

	return (
		<React.Fragment>
			<Title title="Reset your Password" />
			<PasswordReset
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
				resendAfter={resendAfter}
				successMessage={successMessage}
				removeSuccessMessage={() => setSuccessMessage(undefined)}
			/>
		</React.Fragment>
	);
};

Page.authRequired = false;

export default Page;
