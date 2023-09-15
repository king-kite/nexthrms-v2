import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, File, Input, Select, Textarea } from 'kite-react-tailwind';
import { AxiosResponse } from 'axios';
import React from 'react';

import { DEFAULT_IMAGE, PROFILE_URL } from '../../config';
import { useAuthContext } from '../../store/contexts';
import * as tags from '../../store/tagTypes';
import {
	ProfileType,
	ProfileUpdateType,
	ProfileUpdateErrorResponseType,
	SuccessResponseType,
} from '../../types';
import { getStringedDate, getDate } from '../../utils/dates';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors, handleYupErrors } from '../../validators';
import { profileUpdateSchema } from '../../validators/auth';

interface ErrorType extends ProfileUpdateErrorResponseType {
	message?: string;
}

const Form = ({ profile, onSuccess }: { profile: ProfileType; onSuccess: () => void }) => {
	const [formErrors, setErrors] = React.useState<ErrorType>();
	const formRef = React.useRef<HTMLFormElement | null>(null);
	const [form, setForm] = React.useState({ image: '' });

	const queryClient = useQueryClient();

	const { data: previousData, login } = useAuthContext();

	const { mutate: updateProfile, isLoading: loading } = useMutation(
		(data: FormData) =>
			axiosInstance
				.put(PROFILE_URL, data)
				.then((response: AxiosResponse<SuccessResponseType<ProfileType>>) => response.data.data),
		{
			onSuccess(data) {
				queryClient.invalidateQueries([tags.PROFILE]);
				login({
					objPermissions: previousData?.objPermissions || [],
					...previousData,
					id: previousData?.id || '',
					permissions: previousData ? previousData.permissions : [],
					firstName: data.firstName,
					lastName: data.lastName,
					email: data.email,
					fullName: data.firstName + ' ' + data.lastName,
					profile: {
						image: {
							id: data.profile?.image?.id || '',
							location: data.profile?.image?.location || DEFAULT_IMAGE,
							url: data.profile?.image?.url || null,
						},
					},
					employee: data.employee
						? {
								id: data.employee.id,
								job: data.employee.job
									? {
											name: data.employee.job.name,
									  }
									: null,
						  }
						: null,
				});
				onSuccess();
			},
			onError(err) {
				const error = handleAxiosErrors<ProfileUpdateErrorResponseType>(err);
				setErrors((prevState) => {
					if (error?.data)
						return {
							...prevState,
							...error.data,
						};
					else
						return {
							...prevState,
							message: error?.message || 'An error occurred. Unable to update profile.',
						};
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		async (form: ProfileUpdateType) => {
			try {
				setErrors(undefined);
				const data = await profileUpdateSchema.validate(form, {
					abortEarly: false,
				});
				const valid = {
					...data,
					profile: {
						...data.profile,
						dob: data.profile.dob ? (getDate(data.profile.dob, true) as string) : undefined,
					},
				};
				if (valid) {
					const form = new FormData();
					valid.profile.image && form.append('image', valid.profile.image as string);
					const formJsonData = JSON.stringify(valid);
					form.append('form', formJsonData);
					updateProfile(form);
				}
			} catch (err) {
				const error = handleYupErrors<ProfileUpdateErrorResponseType>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					else
						return {
							...prevState,
							message: 'An error occurred. Unable to update profile.',
						};
				});
			}
		},
		[updateProfile]
	);

	const removeError = React.useCallback(
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
						firstName: formRef.current.firstName.value,
						lastName: formRef.current.lastName.value,
						email: formRef.current.email.value,
						profile: {
							phone: formRef.current.phone.value,
							image: formRef.current.image.files[0] || undefined,
							gender: formRef.current.gender.value,
							address: formRef.current.address.value,
							state: formRef.current.state.value,
							city: formRef.current.city.value,
							dob: formRef.current.dob.value,
						},
					});
				}
			}}
			className="p-4"
		>
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:col-span-2">
					<div className="w-full md:w-1/2 lg:w-1/3">
						<File
							disabled={loading}
							error={formErrors?.profile?.image}
							label="Image"
							name="image"
							onChange={({ target: { files } }) => {
								if (files && files[0]) {
									setForm({ image: files[0].name });
								}
								removeError('image');
							}}
							placeholder="Upload Image"
							required={false}
							value={form.image}
						/>
					</div>
				</div>
				<div className="w-full">
					<Input
						defaultValue={profile.firstName}
						disabled={loading}
						error={formErrors?.firstName}
						label="First Name"
						name="firstName"
						onChange={() => removeError('firstName')}
						placeholder="First Name"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={profile.lastName}
						disabled={loading}
						error={formErrors?.lastName}
						label="Last Name"
						name="lastName"
						onChange={() => removeError('lastName')}
						placeholder="Last Name"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={profile.email}
						disabled={loading}
						error={formErrors?.email}
						label="Email"
						name="email"
						onChange={() => removeError('email')}
						placeholder="Email"
						type="email"
					/>
				</div>
				<div className="w-full">
					<Select
						defaultValue={profile.profile?.gender}
						disabled={loading}
						error={formErrors?.profile?.gender}
						label="Gender"
						name="gender"
						onChange={() => removeError('gender')}
						options={[
							{ title: 'Male', value: 'MALE' },
							{ title: 'Female', value: 'FEMALE' },
						]}
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={profile.profile?.phone || undefined}
						disabled={loading}
						error={formErrors?.profile?.phone}
						label="Phone Number"
						name="phone"
						onChange={() => removeError('phone')}
						placeholder="Phone Number"
					/>
				</div>

				<div className="w-full">
					<Input
						defaultValue={profile.profile?.state || undefined}
						disabled={loading}
						error={formErrors?.profile?.state}
						label="State"
						name="state"
						onChange={() => removeError('state')}
						placeholder="State"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={profile.profile?.city || undefined}
						disabled={loading}
						error={formErrors?.profile?.city}
						label="City"
						name="city"
						onChange={() => removeError('city')}
						placeholder="City"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={profile.profile?.dob ? getStringedDate(profile.profile.dob) : undefined}
						disabled={loading}
						error={formErrors?.profile?.dob}
						label="Date Of Birth"
						name="dob"
						onChange={() => removeError('dob')}
						placeholder="Date Of Birth"
						type="date"
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Textarea
						defaultValue={profile.profile?.address || undefined}
						disabled={loading}
						error={formErrors?.profile?.address}
						label="Address"
						name="address"
						onChange={() => removeError('address')}
						placeholder="Address"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button disabled={loading} title={loading ? 'Updating...' : 'Update'} type="submit" />
				</div>
			</div>
		</form>
	);
};

export default Form;
