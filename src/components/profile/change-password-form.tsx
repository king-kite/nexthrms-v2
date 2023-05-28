import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Input } from 'kite-react-tailwind';
import { useCallback, useRef, useState } from 'react';

import { PASSWORD_CHANGE_URL } from '../../config';
import { axiosInstance } from '../../utils/axios';
import {
	handleAxiosErrors,
	handleJoiErrors,
	passwordChangeSchema,
} from '../../validators';

type ErrorType = {
	message?: string;
	oldPassword?: string;
	newPassword1?: string;
	newPassword2?: string;
};

const Form = ({ onSuccess }: { onSuccess: () => void }) => {
	const [formErrors, setErrors] = useState<ErrorType>();

	const formRef = useRef<HTMLFormElement | null>(null);

	const { mutate: changePassword, isLoading } = useMutation(
		(data: {
			oldPassword: string;
			newPassword1: string;
			newPassword2: string;
		}) =>
			axiosInstance
				.post(PASSWORD_CHANGE_URL, data)
				.then((response) => response.data),
		{
			onSuccess() {
				onSuccess();
				if (formRef.current) formRef.current.reset();
			},
			onError(err) {
				const error = handleAxiosErrors<ErrorType>(err);
				setErrors((prevState) => {
					if (error?.data) return { ...prevState, ...error.data };
					else
						return {
							...prevState,
							message: error?.message || 'An error occurred. Please try again!',
						};
				});
			},
		}
	);

	const handleSubmit = useCallback(
		async (data: {
			oldPassword: string;
			newPassword1: string;
			newPassword2: string;
		}) => {
			try {
				setErrors(undefined);
				const valid = await passwordChangeSchema.validateAsync(data);
				if (valid.newPassword1 !== valid.newPassword2) {
					setErrors((prevState) => ({
						...prevState,
						message: 'Passwords do not match',
					}));
				} else changePassword(valid);
			} catch (err) {
				const error = handleJoiErrors<ErrorType>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					else
						return {
							...prevState,
							message: 'An error occurred. Please try again.',
						};
				});
			}
		},
		[changePassword]
	);

	const removeErrors = useCallback(
		(name: string) => {
			if (Object(formErrors)[name]) {
				setErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
			}
		},
		[formErrors]
	);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					handleSubmit({
						oldPassword: formRef.current.oldPassword.value,
						newPassword1: formRef.current.newPassword1.value,
						newPassword2: formRef.current.newPassword2.value,
					});
				}
			}}
			className="p-4"
		>
			{formErrors?.message && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={formErrors.message}
						onClose={() => removeErrors('message')}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:gap-4 lg:gap-6">
				<div className="w-full">
					<Input
						disabled={isLoading}
						error={formErrors?.oldPassword}
						label="Enter Old Password"
						name="oldPassword"
						onChange={() => removeErrors('oldPassword')}
						placeholder="Enter Old Password"
						type="password"
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={isLoading}
						error={formErrors?.newPassword1}
						label="Enter New Password"
						name="newPassword1"
						onChange={() => removeErrors('newPassword1')}
						placeholder="Enter New Password"
						type="password"
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={isLoading}
						error={formErrors?.newPassword2}
						label="Confirm New Password"
						name="newPassword2"
						onChange={() => removeErrors('newPassword2')}
						placeholder="Enter New Password Again"
						type="password"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={isLoading}
						title={isLoading ? 'Updating...' : 'Update'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

export default Form;
