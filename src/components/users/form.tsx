import {
	Alert,
	Button,
	Checkbox,
	File,
	Input,
	Select,
	Select2,
	Textarea,
} from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_IMAGE, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAuthContext } from '../../store/contexts';
import {
	useGetDepartmentsQuery,
	useGetEmployeesQuery,
	useGetJobsQuery,
} from '../../store/queries';
import {
	CreateUserQueryType,
	CreateUserErrorResponseType,
	UserType,
} from '../../types';
import { getStringedDate, toCapitalize } from '../../utils';
import { handleAxiosErrors, handleYupErrors } from '../../validators';
import { createUserSchema } from '../../validators/users';

interface ErrorType extends CreateUserErrorResponseType {
	message?: string;
}

type FormProps = {
	initState?: UserType;
	editMode?: boolean;
	errors?: ErrorType;
	resetErrors: () => void;
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

const formStaleData: {
	isEmployee: boolean;
	isClient: boolean;
	image: string;
	department: string | undefined;
	job: string | undefined;
	supervisors: string[];
} = {
	isEmployee: false,
	isClient: false,
	image: '',
	department: undefined,
	job: undefined,
	supervisors: [],
};

const Form = ({
	editMode,
	initState,
	errors,
	resetErrors,
	loading,
	success,
	onSubmit,
}: FormProps) => {
	const [depLimit, setDepLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [empLimit, setEmpLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [jobLimit, setJobLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const [form, setForm] = React.useState(formStaleData);
	const [formErrors, setErrors] = React.useState<ErrorType>();

	const formRef = React.useRef<HTMLFormElement | null>(null);

	React.useEffect(() => {
		if (initState) {
			setForm({
				...formStaleData,
				isEmployee: initState.employee ? true : false,
				isClient: initState.client ? true : false,
				image: '',
				department: initState.employee?.department?.id,
				job: initState.employee?.job?.id,
				supervisors:
					initState.employee?.supervisors.map((item) => item.id) || [],
			});
		} else setForm(formStaleData);
	}, [initState]);

	const { data: authData } = useAuthContext();

	const jobs = useGetJobsQuery(
		{ limit: jobLimit, offset: 0, search: '' },
		{
			enabled: form.isEmployee,
		}
	);
	const employees = useGetEmployeesQuery(
		{
			limit: empLimit,
			offset: 0,
			search: '',
		},
		{
			enabled: form.isEmployee,
		}
	);
	const departments = useGetDepartmentsQuery(
		{
			limit: depLimit,
			offset: 0,
			search: '',
		},
		{
			enabled: form.isEmployee,
		}
	);

	const departmentsError = handleDataError(departments.error);
	const employeesError = handleDataError(employees.error);
	const jobsError = handleDataError(jobs.error);

	const handleSubmit = React.useCallback(
		async (input: CreateUserQueryType) => {
			try {
				const valid: CreateUserQueryType = await createUserSchema.validate(
					{ ...input },
					{ abortEarly: false }
				);
				const form = new FormData();
				valid.profile.image && form.append('image', valid.profile.image as any);
				const formJsonData = JSON.stringify(valid);
				form.append('form', formJsonData);
				onSubmit(form);
			} catch (err) {
				const error = handleYupErrors<CreateUserErrorResponseType>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					return {
						...prevState,
						message: 'Unable to create user. Please try again later.',
					};
				});
			}
		},
		[onSubmit]
	);

	const removeFormErrors = React.useCallback(
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

	const handleFormChange = React.useCallback(
		(name: string, value: string | string[]) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
			removeFormErrors(name);
		},
		[removeFormErrors]
	);

	React.useEffect(() => {
		if (success && !editMode) {
			setForm(formStaleData);
			if (formRef.current) {
				formRef.current.reset();
			}
		}
	}, [success, editMode]);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					const data: CreateUserQueryType = {
						firstName: formRef.current.firstName.value,
						lastName: formRef.current.lastName.value,
						email: formRef.current.email.value,
						profile: {
							image: formRef.current.image.files[0] || undefined,
							address: formRef.current?.address.value,
							dob: formRef.current?.dob.value,
							gender: formRef.current?.gender.value,
							phone: formRef.current?.phone.value,
							state: formRef.current?.state.value,
							city: formRef.current?.city.value,
						},
						createdAt: formRef.current?.createdAt.value,
						isAdmin: formRef.current.isAdmin.checked,
						isActive: formRef.current.isActive.checked,
						isSuperUser: formRef.current.isSuperUser?.checked || false,
						isEmailVerified: formRef.current.isEmailVerified.checked,
					};

					if (form.isClient) {
						data.client = {
							company: formRef.current?.company.value,
							position: formRef.current?.position.value,
						};
					}
					if (form.isEmployee) {
						data.employee = {
							dateEmployed: formRef.current?.dateEmployed.value,
							department:
								form.department || initState?.employee?.department?.id || '',
							job: form.job || initState?.employee?.job?.id || '',
							supervisors:
								form.supervisors ||
								initState?.employee?.supervisors.map((item) => item.id) ||
								[],
						};
					}
					handleSubmit(data);
				}
			}}
			className="p-4"
		>
			{(formErrors?.message || errors?.message) && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={formErrors?.message || errors?.message}
						onClose={() => {
							if (errors?.message) resetErrors();
							else if (formErrors?.message) removeFormErrors('message');
						}}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 items-end md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:col-span-2">
					<div className="w-full md:w-1/2 lg:w-1/3">
						<File
							disabled={loading}
							error={formErrors?.profile?.image || errors?.profile?.image}
							label="Image"
							onChange={({ target: { files } }) => {
								if (files && files[0]) {
									setForm((prevState) => ({
										...prevState,
										image: files[0].name,
									}));
								}
								removeFormErrors('image');
							}}
							name="image"
							placeholder="Upload Image"
							required={editMode ? false : true}
							value={form.image}
						/>
					</div>
				</div>
				<div className="w-full">
					<Input
						defaultValue={initState?.firstName}
						disabled={loading}
						error={formErrors?.firstName || errors?.firstName}
						label="First Name"
						name="firstName"
						onChange={() => removeFormErrors('firstName')}
						placeholder="First Name"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={initState?.lastName}
						disabled={loading}
						error={formErrors?.lastName || errors?.lastName}
						label="Last Name"
						name="lastName"
						onChange={() => removeFormErrors('lastName')}
						placeholder="Last Name"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.email}
						disabled={loading}
						error={formErrors?.email || errors?.email}
						label="Email Address"
						name="email"
						onChange={() => removeFormErrors('email')}
						placeholder="Email Address"
						type="email"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={initState?.profile?.phone || undefined}
						disabled={loading}
						error={formErrors?.profile?.phone || errors?.profile?.phone}
						label="Phone Number"
						name="phone"
						onChange={() => removeFormErrors('phone')}
						placeholder="Phone Number"
					/>
				</div>
				<div className="w-full">
					<Select
						defaultValue={initState?.profile?.gender || 'MALE'}
						disabled={loading}
						error={formErrors?.profile?.gender || errors?.profile?.gender}
						label="Gender"
						name="gender"
						onChange={() => removeFormErrors('gender')}
						options={[
							{ title: 'Male', value: 'MALE' },
							{ title: 'Female', value: 'FEMALE' },
						]}
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Textarea
						defaultValue={initState?.profile?.address || undefined}
						disabled={loading}
						error={
							formErrors?.profile?.address || errors?.profile?.address || ''
						}
						label="Address"
						name="address"
						onChange={() => removeFormErrors('address')}
						placeholder="Address"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={initState?.profile?.state || undefined}
						disabled={loading}
						error={formErrors?.profile?.state || errors?.profile?.state}
						label="State"
						name="state"
						onChange={() => removeFormErrors('state')}
						placeholder="State"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={initState?.profile?.city || undefined}
						disabled={loading}
						error={formErrors?.profile?.city || errors?.profile?.city}
						label="City"
						name="city"
						onChange={() => removeFormErrors('city')}
						placeholder="City"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={
							initState?.profile?.dob
								? getStringedDate(initState.profile.dob)
								: undefined
						}
						disabled={loading}
						error={formErrors?.profile?.dob || errors?.profile?.dob}
						label="Date Of Birth"
						name="dob"
						onChange={() => removeFormErrors('dob')}
						placeholder="Date Of Birth"
						type="date"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={getStringedDate(initState?.createdAt)}
						disabled={loading}
						error={formErrors?.createdAt || errors?.createdAt}
						label="Date Joined"
						name="createdAt"
						onChange={() => removeFormErrors('createdAt')}
						placeholder="Date Joined"
						type="date"
					/>
				</div>
				<div className="w-full">
					<Checkbox
						defaultChecked={initState?.isActive || !editMode}
						error={formErrors?.isActive || errors?.isActive}
						onChange={() => removeFormErrors('isActive')}
						label="Is Active"
						labelColor="text-gray-500"
						name="isActive"
						labelSize="text-sm tracking-wider md:text-base"
						between
						reverse
						required={false}
						textSize="text-sm md:text-base"
					/>
				</div>
				<div className="w-full">
					<Checkbox
						defaultChecked={initState?.isEmailVerified || !editMode}
						error={formErrors?.isEmailVerified || errors?.isEmailVerified}
						onChange={() => removeFormErrors('isEmailVerified')}
						label="is Email Verified"
						labelColor="text-gray-500"
						labelSize="text-sm tracking-wider md:text-base"
						name="isEmailVerified"
						between
						reverse
						required={false}
						textSize="text-sm md:text-base"
					/>
				</div>

				{(authData?.isAdmin || authData?.isSuperUser) && (
					<div className="w-full">
						<Checkbox
							defaultChecked={initState?.isAdmin || false}
							error={formErrors?.isAdmin || errors?.isAdmin}
							onChange={() => removeFormErrors('isAdmin')}
							label="Is Admin"
							labelColor="text-gray-500"
							labelSize="text-sm tracking-wider md:text-base"
							name="isAdmin"
							between
							reverse
							required={false}
							textSize="text-sm md:text-base"
						/>
					</div>
				)}

				{authData?.isSuperUser && (
					<div className="w-full">
						<Checkbox
							defaultChecked={initState?.isSuperUser || false}
							error={formErrors?.isSuperUser || errors?.isSuperUser}
							onChange={() => removeFormErrors('isSuperUser')}
							label="Is Super User"
							labelColor="text-gray-500"
							labelSize="text-sm tracking-wider md:text-base"
							name="isSuperUser"
							between
							reverse
							required={false}
							textSize="text-sm md:text-base"
						/>
					</div>
				)}

				<div className="gap-2 grid grid-cols-1 w-full md:col-span-2 md:grid-cols-2 md:gap-4 lg:gap-6">
					{!initState?.employee && (
						<div className="w-full">
							<Checkbox
								label="Is Employee"
								labelColor="text-gray-500"
								labelSize="text-sm tracking-wider md:text-base"
								between
								reverse
								required={false}
								textSize="text-sm md:text-base"
								onChange={({ target: { checked } }) => {
									setForm((prevState) => ({
										...prevState,
										isEmployee: checked,
									}));
								}}
								checked={form.isEmployee}
							/>
						</div>
					)}

					{!initState?.client && (
						<div className="w-full">
							<Checkbox
								label="Is Client"
								labelColor="text-gray-500"
								labelSize="text-sm tracking-wider md:text-base"
								between
								reverse
								required={false}
								textSize="text-sm md:text-base"
								onChange={({ target: { checked } }) => {
									setForm((prevState) => ({
										...prevState,
										isClient: checked,
									}));
								}}
								checked={form.isClient}
							/>
						</div>
					)}
				</div>

				{/* Employee Info Start */}
				{form.isEmployee && (
					<React.Fragment>
						<div className="w-full">
							<Select
								btn={{
									caps: true,
									disabled:
										departments.isFetching ||
										(departments.data &&
											departments.data.result.length >= departments.data.total),
									onClick: () => {
										if (
											departments.data &&
											departments.data.total > departments.data.result.length
										) {
											setDepLimit(
												(prevState) => prevState + DEFAULT_PAGINATION_SIZE
											);
										}
									},
									title: departments.isFetching
										? 'loading...'
										: departments.data &&
										  departments.data.result.length >= departments.data.total
										? 'loaded all'
										: 'load more',
								}}
								disabled={departments.isLoading || loading}
								error={
									departmentsError ||
									formErrors?.employee?.department ||
									errors?.employee?.department
								}
								label="Department"
								name="department"
								onChange={({ target: { value } }) =>
									handleFormChange('department', value)
								}
								placeholder="Select Department"
								options={
									departments.data
										? departments.data.result.map((department) => ({
												title: toCapitalize(department.name),
												value: department.id,
										  }))
										: []
								}
								value={form.department}
							/>
						</div>
						<div className="w-full">
							<Select
								btn={{
									caps: true,
									disabled:
										jobs.isFetching ||
										(jobs.data && jobs.data.result.length >= jobs.data.total),
									onClick: () => {
										if (
											jobs.data &&
											jobs.data.total > jobs.data.result.length
										) {
											setJobLimit(
												(prevState) => prevState + DEFAULT_PAGINATION_SIZE
											);
										}
									},
									title: jobs.isFetching
										? 'loading...'
										: jobs.data && jobs.data.result.length >= jobs.data.total
										? 'loaded all'
										: 'load more',
								}}
								disabled={jobs.isLoading || loading}
								error={
									jobsError ||
									formErrors?.employee?.job ||
									errors?.employee?.job
								}
								label="Job"
								name="job"
								onChange={({ target: { value } }) =>
									handleFormChange('job', value)
								}
								value={form.job}
								placeholder="Select Job"
								options={
									jobs.data
										? jobs.data.result.map((job) => ({
												title: toCapitalize(job.name),
												value: job.id,
										  }))
										: []
								}
							/>
						</div>
						<div className="w-full">
							<Select2
								bdrColor={
									employeesError ||
									formErrors?.employee?.supervisors ||
									errors?.employee?.supervisors
										? 'border-red-600'
										: 'border-gray-300'
								}
								btn={{
									caps: true,
									disabled:
										employees.isFetching ||
										(employees.data &&
											employees.data.result.length >= employees.data.total),
									onClick: () => {
										if (
											employees.data &&
											employees.data.total > employees.data.result.length
										) {
											setEmpLimit(
												(prevState) => prevState + DEFAULT_PAGINATION_SIZE
											);
										}
									},
									title: employees.isFetching
										? 'loading...'
										: employees.data &&
										  employees.data.result.length >= employees.data.total
										? 'loaded all'
										: 'load more',
								}}
								disabled={employees.isLoading || loading}
								onSelect={({ value }) => {
									// Check if the employee with this value as id is selected
									const selected = form.supervisors.find(
										(item) => item === value
									);
									if (selected) {
										// Remove from selection
										setForm((prevState) => ({
											...prevState,
											supervisors: prevState.supervisors.filter(
												(item) => item !== value
											),
										}));
									} else {
										// Add to selection
										setForm((prevState) => ({
											...prevState,
											supervisors: [...prevState.supervisors, value],
										}));
									}
								}}
								error={
									employeesError ||
									formErrors?.employee?.supervisors ||
									errors?.employee?.supervisors
								}
								options={
									employees.data
										? employees.data.result
												.reduce(
													(
														total: {
															title: string;
															value: string;
														}[],
														employee
													) => {
														if (employee.user.isActive)
															return [
																...total,
																{
																	image:
																		employee.user.profile?.image?.url ||
																		DEFAULT_IMAGE,
																	title:
																		employee.user.firstName +
																		' ' +
																		employee.user.lastName,
																	value: employee.id,
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
								multiple
								value={form.supervisors}
								required={false}
								label="Supervisors"
								placeholder="Select Supervisors"
								shadow="shadow-lg"
							/>
							{/* <Select
								
								
								onChange={({ target: { selectedOptions } }) => {
									const selectValues = Array.from(
										selectedOptions,
										(option) => option.value
									);
									handleFormChange('supervisors', selectValues);
								}}
								
							/> */}
						</div>
						<div className="w-full">
							<Input
								defaultValue={getStringedDate()}
								disabled={loading}
								error={
									formErrors?.employee?.dateEmployed ||
									errors?.employee?.dateEmployed
								}
								label="Date Employed"
								name="dateEmployed"
								onChange={() => removeFormErrors('dateEmployed')}
								placeholder="Date Employed"
								type="date"
							/>
						</div>
					</React.Fragment>
				)}
				{/* Employee Info Stop */}

				{/* Client Info Start */}
				{form.isClient && (
					<React.Fragment>
						<div className="w-full">
							<Input
								defaultValue={initState?.client?.company}
								disabled={loading}
								error={formErrors?.client?.company || errors?.client?.company}
								label="Client Company"
								name="company"
								onChange={() => removeFormErrors('company')}
								placeholder="Company Name"
							/>
						</div>
						<div className="w-full">
							<Input
								defaultValue={initState?.client?.position}
								disabled={loading}
								error={formErrors?.client?.position || errors?.client?.position}
								label="Client Position"
								name="position"
								onChange={() => removeFormErrors('position')}
								placeholder="Position in Company"
							/>
						</div>
					</React.Fragment>
				)}
				{/* Client Info Stop */}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={
							editMode
								? loading
									? 'Updating User...'
									: 'Update User'
								: loading
								? 'Creating User...'
								: 'Create User'
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
