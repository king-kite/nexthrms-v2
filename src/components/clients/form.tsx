import {
	Alert,
	Button,
	File,
	Input,
	Select,
	Select2,
	Textarea,
} from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, DEFAULT_IMAGE } from '../../config';
import { useGetUsersQuery } from '../../store/queries';
import {
	ClientType,
	ClientCreateQueryType,
	CreateClientErrorResponseType,
} from '../../types';
import { getStringedDate, toCapitalize } from '../../utils';
import {
	createClientSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

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
	onSubmit: (form: FormData) => void;
};

function handleDataError(err: unknown): string | undefined {
	if (err) {
		const error = handleAxiosErrors(err);
		if (error) return error?.message;
	}
	return undefined;
}

const Form = ({
	editMode,
	errors,
	initState,
	removeErrors,
	loading,
	onSubmit,
	success,
}: FormProps) => {
	const [selectUser, setSelectUser] = React.useState(false);

	const [form, setForm] = React.useState({
		image: '',
		contactId: initState?.contact.id || null,
	});
	const [formErrors, setErrors] = React.useState<
		CreateClientErrorResponseType & {
			message?: string;
		}
	>();
	const [usrLimit, setUsrLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const formRef = React.useRef<HTMLFormElement>(null);

	const users = useGetUsersQuery({
		limit: usrLimit,
		offset: 0,
		search: '',
	});

	const usersError = handleDataError(users.error);

	React.useEffect(() => {
		if (!editMode && success) {
			setForm({ image: '', contactId: null });
			setErrors(undefined);
			if (formRef.current) {
				formRef.current.reset();
			}
		}
	}, [success, editMode]);

	const handleSubmit = React.useCallback(
		async (input: ClientCreateQueryType) => {
			setErrors(undefined);
			if (removeErrors) removeErrors();
			try {
				const valid: ClientCreateQueryType =
					await createClientSchema.validateAsync(
						{ ...input },
						{
							abortEarly: false,
						}
					);
				const form = new FormData();
				valid.contact &&
					valid.contact.profile.image &&
					form.append('image', valid.contact.profile.image);
				const formJsonData = JSON.stringify(valid);
				form.append('form', formJsonData);
				onSubmit(form);
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

	const removeError = React.useCallback(
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
						contactId: form.contactId
							? editMode
								? initState?.contact.id !== form.contactId
									? form.contactId
									: null
								: form.contactId
							: null,
						contact:
							(!editMode && !form.contactId) ||
							(editMode && initState?.contact.id === form.contactId)
								? {
										firstName: formRef.current?.firstName.value,
										lastName: formRef.current?.lastName.value,
										email: formRef.current?.email.value,
										profile: {
											image: formRef.current?.image.files[0] || undefined,
											address: formRef.current?.address.value,
											dob: formRef.current?.dob.value || undefined,
											gender: formRef.current?.gender.value,
											phone: formRef.current?.phone.value,
											state: formRef.current?.state.value,
											city: formRef.current?.city.value,
										},
								  }
								: null,
						company: formRef.current?.company.value,
						position: formRef.current?.position.value,
					});
				}
			}}
			className="p-4 pb-0"
		>
			{(formErrors?.message || errors?.message) && (
				<div className="pb-4 w-full">
					<Alert
						message={formErrors?.message || errors?.message}
						onClose={() => {
							if (errors?.message && removeErrors) removeErrors();
							else if (formErrors?.message) removeError('message');
						}}
						type="danger"
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 items-end md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="flex justify-end w-full md:col-span-2">
					<div className="w-full md:w-1/2 lg:w-1/3">
						<Button
							disabled={loading}
							onClick={() =>
								setSelectUser((selected) => {
									if (!editMode && !selected === false) {
										setForm((prevState) => ({
											...prevState,
											contactId: null,
										}));
									}
									return !selected;
								})
							}
							title={
								selectUser
									? editMode
										? 'Update contact details'
										: 'Create new contact'
									: 'Select existing contact'
							}
							type="button"
						/>
					</div>
				</div>
				{!selectUser && (
					<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
						<div className="w-full md:w-1/2 lg:w-1/3">
							<File
								disabled={loading}
								error={formErrors?.image || errors?.image}
								label="Image"
								name="image"
								onChange={({ target: { files } }) => {
									if (files && files[0]) {
										setForm((prevState) => ({
											...prevState,
											image: files[0].name,
										}));
									}
									removeError('image');
								}}
								placeholder="Upload Image"
								required={editMode ? false : true}
								value={form.image}
							/>
						</div>
					</div>
				)}
				{selectUser && (
					<React.Fragment>
						<div className="w-full">
							<Select2
								bdrColor={
									usersError || formErrors?.contactId || errors?.contactId
										? 'border-red-600'
										: 'border-gray-300'
								}
								btn={{
									caps: true,
									disabled:
										users.isFetching ||
										(users.data &&
											users.data.result.length >= users.data.total),
									onClick: () => {
										if (
											users.data &&
											users.data.total > users.data.result.length
										) {
											setUsrLimit(
												(prevState) => prevState + DEFAULT_PAGINATION_SIZE
											);
										}
									},
									title: users.isFetching
										? 'loading...'
										: users.data && users.data.result.length >= users.data.total
										? 'loaded all'
										: 'load more',
								}}
								disabled={users.isLoading || loading}
								onSelect={({ value }) =>
									setForm((prevState) => ({
										...prevState,
										contactId: value,
									}))
								}
								error={usersError || formErrors?.contactId || errors?.contactId}
								options={
									users.data
										? users.data.result
												.reduce(
													(
														total: {
															title: string;
															value: string;
														}[],
														user
													) => {
														if (user.isActive)
															return [
																...total,
																{
																	image:
																		user.profile?.image?.url || DEFAULT_IMAGE,
																	title: user.firstName + ' ' + user.lastName,
																	value: user.id,
																},
															];
														return total;
													},
													[]
												)
												.sort((a, b) => {
													const aName = a.title.toLowerCase();
													const bName = b.title.toLowerCase();
													return aName < bName ? -1 : aName > bName ? 1 : 0;
												})
										: []
								}
								value={form.contactId || ''}
								required
								label="Contact"
								placeholder="Select Contact"
								shadow="shadow-lg"
							/>
						</div>
						<div className="hidden w-full md:block" />
					</React.Fragment>
				)}
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
				{!selectUser && (
					<React.Fragment>
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
										? getStringedDate(initState.contact.profile.dob)
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
					</React.Fragment>
				)}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={
							editMode
								? loading
									? 'Updating Client...'
									: 'Update Client'
								: loading
								? 'Creating Client...'
								: 'Create Client'
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
