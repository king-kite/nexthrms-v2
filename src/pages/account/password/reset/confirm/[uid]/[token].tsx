import { useMutation } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import Router from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';

import {
	LOGIN_PAGE_URL,
	RESET_PASSWORD_PAGE_URL,
	PASSWORD_RESET_CONFIRM_URL,
} from '../../../../../../config';
import PasswordConfirm from '../../../../../../containers/account/password/confirm';
import prisma from '../../../../../../db/client';
import { PasswordResetType } from '../../../../../../types';
import axiosInstance from '../../../../../../utils/axios/authRedirectInstance';
import Title from '../../../../../../utils/components/title';
import {
	handleAxiosErrors,
	handleYupErrors,
} from '../../../../../../validators';
import {
	passwordResetSchema,
	verifyUidTokenSchema,
} from '../../../../../../validators/auth';

const Page = ({ uid, token }: { uid: number | string; token: string }) => {
	const [errors, setErrors] = React.useState<{
		email?: string;
		message?: string;
	}>();

	const { mutate: resetEmail, isLoading: loading } = useMutation(
		(form: PasswordResetType) =>
			axiosInstance.post(PASSWORD_RESET_CONFIRM_URL, form, {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}),
		{
			onSuccess() {
				Router.push(LOGIN_PAGE_URL);
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
							err?.message || 'An error occurred. Unable to set new password.',
					};
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		async (form: { password1: string; password2: string }) => {
			try {
				setErrors(undefined);
				const valid = await passwordResetSchema.validate({
					...form,
					uid,
					token,
				});
				if (form.password1 !== form.password2) {
					setErrors((prevState) => ({
						...prevState,
						password1: 'Passwords do not match',
						password2: 'Passwords do not match',
					}));
				} else {
					resetEmail(valid);
				}
			} catch (error) {
				const err = handleYupErrors<{
					password1?: string;
					password2?: string;
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
						message: 'An error occurred. Unable to set new password.',
					};
				});
			}
		},
		[resetEmail, uid, token]
	);

	return (
		<React.Fragment>
			<Title title="Confirm Your New Password" />
			<PasswordConfirm
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

interface IParams extends ParsedUrlQuery {
	uid: string;
	token: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	try {
		const { uid, token } = params as IParams;

		// validate the request params
		const valid = await verifyUidTokenSchema.validate({ uid, token });

		// Get the token provided in the request body
		const savedToken = await prisma.token.findUnique({
			where: {
				token: valid.token,
			},
			select: {
				expires: true,
				type: true,
				uid: true,
				token: true,
			},
		});

		if (
			!savedToken ||
			savedToken.type !== 'PASSWORD_RESET' ||
			savedToken.expires.getTime() <= Date.now() ||
			savedToken.uid !== valid.uid
		) {
			return {
				redirect: {
					destination: RESET_PASSWORD_PAGE_URL,
					permanent: false,
				},
			};
		}

		return {
			props: {
				key: uid,
				uid,
				token,
			},
		};
	} catch (error) {
		return {
			redirect: {
				destination: RESET_PASSWORD_PAGE_URL,
				permanent: false,
			},
		};
	}
};

Page.authRequired = false;

export default Page;
