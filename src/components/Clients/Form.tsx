import {
	Alert,
	Button,
	File,
	Input,
	Select,
	Textarea,
} from '@king-kite/react-kit';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
	ClientType,
	ClientCreateQueryType,
	CreateClientErrorResponseType,
} from '../../types';
import { createClientSchema, handleJoiErrors } from '../../validators';

interface ErrorType extends CreateClientErrorResponseType {
	message?: string;
}

export type FormProps = {
	editMode?: boolean;
	errors?: ErrorType;
	removeErrors?: () => void;
	initState?: ClientType;
	loading: boolean;
	success?: boolean;
	onSubmit: (form: ClientCreateQueryType) => void;
};

const Form: FC<FormProps> = ({
	editMode,
	errors,
	initState,
	removeErrors,
	loading,
	onSubmit,
	success,
}) => {
	const [formErrors, setErrors] = useState<CreateClientErrorResponseType>();

	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!editMode && success) {
			setErrors(undefined);
			if (formRef.current) {
				formRef.current.reset();
			}
		}
	}, [success, editMode]);

	const handleSubmit = useCallback(
		async (form: ClientCreateQueryType) => {
			setErrors(undefined);
			if (removeErrors) removeErrors();
			try {
				const valid = await createClientSchema.validateAsync(
					{ ...form },
					{
						abortEarly: false,
					}
				);
				onSubmit(valid);
			} catch (error) {
				const err = handleJoiErrors<CreateClientErrorResponseType>(error);
				if (err) {
					setErrors((prevState) => ({
						...prevState,
						...err,
					}));
				}
			}
		},
		[onSubmit, removeErrors]
	);

	const removeError = useCallback(
		(name: string) => {
			if (Object(formErrors)[name])
				setErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
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
						contactId: null,
						contact: {
							firstName: formRef.current?.firstName.value,
							lastName: formRef.current?.lastName.value,
							email: formRef.current?.email.value,
							profile: {
								image: formRef.current?.image.value || initState?.contact.profile?.image,
								address: formRef.current?.address.value,
								dob: formRef.current?.dob.value,
								gender: formRef.current?.gender.value,
								phone: formRef.current?.phone.value,
								state: formRef.current?.state.value,
								city: formRef.current?.city.value,
							},
						},
						company: formRef.current?.company.value,
						position: formRef.current?.position.value,
					});
				}
			}}
			className="p-4 pb-0"
		>
			{errors?.message && (
				<div className="pb-4 w-full">
					<Alert
						message={errors.message}
						onClose={removeErrors}
						type="danger"
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<div className="w-full md:w-1/2 lg:w-1/3">
						<File
							disabled={loading}
							error={formErrors?.image || errors?.image}
							label="Image"
							name="image"
							onChange={() => removeError('image')}
							placeholder="Upload Image"
							required={editMode ? false : true}
						/>
					</div>
				</div>
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.company}
						disabled={loading}
						error={formErrors?.company || errors?.company}
						label="Company"
						name="company"
						onChange={() => removeError('company')}
						placeholder="Enter company name"
					/>
				</div>
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.position}
						disabled={loading}
						error={formErrors?.position || errors?.position}
						label="Position"
						name="position"
						onChange={() => removeError('position')}
						placeholder="Enter client position in the company"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.contact.firstName}
						disabled={loading}
						error={formErrors?.firstName || errors?.firstName}
						label="First Name"
						name="firstName"
						onChange={() => removeError('firstName')}
						placeholder="First Name"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.contact.lastName}
						disabled={loading}
						error={formErrors?.lastName || errors?.lastName}
						label="Last Name"
						name="lastName"
						onChange={() => removeError('lastName')}
						placeholder="Last Name"
					/>
				</div>
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.contact.email}
						disabled={loading}
						error={formErrors?.email || errors?.email}
						label="Email"
						name="email"
						onChange={() => removeError('email')}
						placeholder="Email"
						type="email"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.contact.profile?.phone || undefined}
						disabled={loading}
						error={formErrors?.phone || errors?.phone}
						label="Phone Number"
						name="phone"
						onChange={() => removeError('phone')}
						placeholder="Phone Number"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Select
						defaultValue={initState?.contact.profile?.gender || undefined}
						disabled={loading}
						error={formErrors?.gender || errors?.gender}
						label="Gender"
						name="gender"
						onChange={() => removeError('gender')}
						options={[
							{ title: 'Male', value: 'MALE' },
							{ title: 'Female', value: 'FEMALE' },
						]}
						placeholderColor="placeholder-gray-700 text-gray-700"
						color="text-gray-700"
					/>
				</div>
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Textarea
						defaultValue={initState?.contact.profile?.address || undefined}
						disabled={loading}
						error={formErrors?.address || errors?.address}
						label="Address"
						name="address"
						onChange={() => removeError('address')}
						placeholder="Address"
						required={false}
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.contact.profile?.state || undefined}
						disabled={loading}
						error={formErrors?.state || errors?.state}
						label="State"
						name="state"
						onChange={() => removeError('state')}
						placeholder="State"
						required={false}
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.contact.profile?.city || undefined}
						disabled={loading}
						error={formErrors?.city || errors?.city}
						label="City"
						name="city"
						onChange={() => removeError('city')}
						placeholder="City"
						required={false}
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={
							initState?.contact.profile?.dob
								? new Date(initState.contact.profile.dob).toLocaleDateString(
										'en-CA'
								  )
								: undefined
						}
						disabled={loading}
						error={formErrors?.dob || errors?.dob}
						label="Date Of Birth"
						name="dob"
						onChange={() => removeError('dob')}
						placeholder="Date Of Birth"
						placeholderColor="placeholder-gray-700 text-gray-700"
						color="text-gray-700"
						required={false}
						type="date"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={
							loading
								? editMode
									? 'Updating Client...'
									: 'Creating Client...'
								: 'Submit'
						}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

Form.defaultProps = {
	editMode: false,
};

export default Form;
