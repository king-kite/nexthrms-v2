import { Button, Input } from '@king-kite/react-kit';
import { FC, useCallback, useRef, useState } from 'react';

import { useChangeUserPasswordMutation } from '../../../store/queries';
import { changeUserPasswordSchema, handleJoiErrors } from '../../../validators';

type FormProps = {
	email: string;
	onSuccess: () => void;
};

const Form: FC<FormProps> = ({ email, onSuccess }) => {
	const formRef = useRef<HTMLFormElement | null>(null);
	const [formErrors, setErrors] = useState<{
		password1?: string;
		password2?: string;
	}>();

	const {
		mutate: changePassword,
		isLoading,
		reset,
	} = useChangeUserPasswordMutation({
		onSuccess() {
			onSuccess();
			if (formRef.current) formRef.current.reset();
		},
		onError(err) {
			if (err.data) setErrors((prevState) => ({ ...prevState, ...err.data }));
			else setErrors((prevState) => ({ ...prevState, password1: err.message }));
		},
	});

	const handleSubmit = useCallback(
		async (form: { password1: string; password2: string }) => {
			reset();
			try {
				setErrors(undefined);
				if (form.password1 !== form.password2) {
					setErrors((prevState) => ({
						...prevState,
						password2: 'Passwords do not match!',
					}));
				} else {
				}
				const data = await changeUserPasswordSchema.validateAsync({
					email,
					...form,
				});
				changePassword(data);
			} catch (err) {
				const error = handleJoiErrors<{
					password1?: string;
					password2?: string;
				}>(err);
				if (error) setErrors((prevState) => ({ ...prevState, ...error }));
			}
		},
		[changePassword, email, reset]
	);

	const removeErrors = useCallback(
		(name: string) => {
			reset();
			setErrors((prevState) => ({
				...prevState,
				[name]: undefined,
			}));
		},
		[reset]
	);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					handleSubmit({
						password1: formRef.current.password1.value,
						password2: formRef.current.password2.value,
					});
				}
			}}
			className="p-4"
		>
			<div className="gap-2 grid grid-cols-1 md:gap-4 lg:gap-6">
				<div className="w-full">
					<Input
						disabled={isLoading}
						error={formErrors?.password1}
						label="Enter New Password"
						name="password1"
						onChange={() =>
							formErrors?.password1 ? removeErrors('password1') : undefined
						}
						placeholder="Enter New Password"
						type="password"
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={isLoading}
						error={formErrors?.password2}
						label="Confirm New Password"
						name="password2"
						onChange={() =>
							formErrors?.password1 ? removeErrors('password2') : undefined
						}
						placeholder="Enter New Password Again"
						type="password"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={isLoading}
						title={isLoading ? 'Changing Password...' : 'Submit'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

export default Form;
