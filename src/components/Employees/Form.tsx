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
import {
	useGetDepartmentsQuery,
	useGetEmployeesQuery,
	useGetJobsQuery,
	useGetUsersQuery,
} from '../../store/queries';

import {
	CreateEmployeeQueryType,
	CreateEmployeeErrorResponseType,
	EmployeeType,
} from '../../types';
import { getStringedDate, toCapitalize } from '../../utils';
import {
	createEmployeeSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

interface ErrorType extends CreateEmployeeErrorResponseType {
	message?: string;
}

type FormProps = {
	initState?: EmployeeType;
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

const Form = ({
	editMode,
	initState,
	errors,
	resetErrors,
	loading,
	success,
	onSubmit,
}: FormProps) => {
	const [selectUser, setSelectUser] = React.useState(false);

	const [depLimit, setDepLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [empLimit, setEmpLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [jobLimit, setJobLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [usrLimit, setUsrLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	// defaultValue doesn't re-render after these department, employees, and jobs
	// are loading. Use state instead
	const [form, setForm] = React.useState({
		department: initState?.department?.id || '',
		image: '',
		job: initState?.job?.id || '',
		supervisors:
			initState?.supervisors.map((supervisor) => supervisor.id) || [],
		userId: initState?.user.id || null,
	});
	const [formErrors, setErrors] = React.useState<ErrorType>();

	const formRef = React.useRef<HTMLFormElement | null>(null);

	const jobs = useGetJobsQuery({ limit: jobLimit, offset: 0, search: '' });
	const employees = useGetEmployeesQuery({
		limit: empLimit,
		offset: 0,
		search: '',
	});
	const departments = useGetDepartmentsQuery({
		limit: depLimit,
		offset: 0,
		search: '',
	});
	const users = useGetUsersQuery({
		limit: usrLimit,
		offset: 0,
		search: '',
	});

	const departmentsError = handleDataError(departments.error);
	const employeesError = handleDataError(employees.error);
	const jobsError = handleDataError(jobs.error);
	const usersError = handleDataError(users.error);

	const handleSubmit = React.useCallback(
		async (input: CreateEmployeeQueryType) => {
			try {
				const valid: CreateEmployeeQueryType =
					await createEmployeeSchema.validateAsync({ ...input });
				const form = new FormData();
				valid.user &&
					valid.user.profile.image &&
					form.append('image', valid.user.profile.image);
				const formJsonData = JSON.stringify(valid);
				form.append('form', formJsonData);
				onSubmit(form);
			} catch (err) {
				const error = handleJoiErrors<CreateEmployeeErrorResponseType>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					return {
						...prevState,
						message: 'Unable to create employee. Please try again later.',
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
			setForm({
				image: '',
				job: '',
				department: '',
				supervisors: [],
				userId: null,
			});
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
					handleSubmit({
						userId: form.userId
							? editMode
								? initState?.user.id !== form.userId
									? form.userId
									: null
								: form.userId
							: null,
						dateEmployed: formRef.current.dateEmployed.value,
						user:
							(!editMode && !form.userId) ||
							(editMode && initState?.user.id === form.userId)
								? {
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
								  }
								: null,
						department: form.department,
						job: form.job,
						supervisors: form.supervisors,
					});
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
				<div className="flex justify-end w-full md:col-span-2">
					<div className="w-full md:w-1/2 lg:w-1/3">
						<Button
							disabled={loading}
							onClick={() =>
								setSelectUser((selected) => {
									if (!editMode && !selected === false) {
										setForm((prevState) => ({
											...prevState,
											userId: null,
										}));
									}
									return !selected;
								})
							}
							title={
								selectUser
									? editMode
										? 'Update user details'
										: 'Create new user'
									: 'Select existing user'
							}
							type="button"
						/>
					</div>
				</div>
				{selectUser ? (
					<React.Fragment>
						<div className="w-full">
							<Select2
								bdrColor={
									usersError || formErrors?.userId || errors?.userId
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
										userId: value,
									}))
								}
								error={usersError || formErrors?.userId || errors?.userId}
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
																	image: user.profile?.image || DEFAULT_IMAGE,
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
								value={form.userId || ''}
								required
								label="User"
								placeholder="Select User"
								shadow="shadow-lg"
							/>
						</div>
						<div className="hidden w-full md:block" />
					</React.Fragment>
				) : (
					<React.Fragment>
						<div className="w-full md:col-span-2">
							<div className="w-full md:w-1/2 lg:w-1/3">
								<File
									disabled={loading}
									error={formErrors?.image || errors?.image}
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
								defaultValue={initState?.user.firstName}
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
								defaultValue={initState?.user.lastName}
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
								defaultValue={initState?.user.email}
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
								defaultValue={initState?.user.profile?.phone || undefined}
								disabled={loading}
								error={formErrors?.phone || errors?.phone}
								label="Phone Number"
								name="phone"
								onChange={() => removeFormErrors('phone')}
								placeholder="Phone Number"
							/>
						</div>
						<div className="w-full">
							<Select
								defaultValue={initState?.user.profile?.gender || 'MALE'}
								disabled={loading}
								error={formErrors?.gender || errors?.gender}
								label="Gender"
								name="gender"
								onChange={() => removeFormErrors('gender')}
								options={[
									{ title: 'Male', value: 'MALE' },
									{ title: 'Female', value: 'FEMALE' },
								]}
							/>
						</div>
						<div className="w-full">
							<Input
								defaultValue={
									initState?.user.profile?.dob
										? getStringedDate(initState.user.profile.dob)
										: undefined
								}
								disabled={loading}
								error={formErrors?.dob || errors?.dob}
								label="Date Of Birth"
								name="dob"
								onChange={() => removeFormErrors('dob')}
								placeholder="Date Of Birth"
								type="date"
							/>
						</div>
						<div className="w-full md:col-span-2">
							<Textarea
								defaultValue={initState?.user.profile?.address || undefined}
								disabled={loading}
								error={formErrors?.address || errors?.address || ''}
								label="Address"
								name="address"
								onChange={() => removeFormErrors('address')}
								placeholder="Address"
							/>
						</div>
						<div className="w-full">
							<Input
								defaultValue={initState?.user.profile?.state || undefined}
								disabled={loading}
								error={formErrors?.state || errors?.state}
								label="State"
								name="state"
								onChange={() => removeFormErrors('state')}
								placeholder="State"
							/>
						</div>
						<div className="w-full">
							<Input
								defaultValue={initState?.user.profile?.city || undefined}
								disabled={loading}
								error={formErrors?.city || errors?.city}
								label="City"
								name="city"
								onChange={() => removeFormErrors('city')}
								placeholder="City"
							/>
						</div>
					</React.Fragment>
				)}
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
							departmentsError || formErrors?.department || errors?.department
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
								if (jobs.data && jobs.data.total > jobs.data.result.length) {
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
						error={jobsError || formErrors?.job || errors?.job}
						label="Job"
						name="job"
						onChange={({ target: { value } }) => handleFormChange('job', value)}
						placeholder="Select Job"
						options={
							jobs.data
								? jobs.data.result.map((job) => ({
										title: toCapitalize(job.name),
										value: job.id,
								  }))
								: []
						}
						value={form.job}
					/>
				</div>
				<div className="w-full">
					<Select2
						bdrColor={
							employeesError || formErrors?.supervisors || errors?.supervisors
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
							const selected = form.supervisors.find((item) => item === value);
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
							employeesError || formErrors?.supervisors || errors?.supervisors
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
																employee.user.profile?.image || DEFAULT_IMAGE,
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
				</div>
				<div className="w-full">
					<Input
						defaultValue={
							initState?.dateEmployed
								? getStringedDate(initState.dateEmployed)
								: getStringedDate()
						}
						disabled={loading}
						error={formErrors?.dateEmployed || errors?.dateEmployed}
						label="Date Employed"
						name="dateEmployed"
						onChange={() => removeFormErrors('dateEmployed')}
						placeholder="Date Employed"
						type="date"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={
							editMode
								? loading
									? 'Updating Employee...'
									: 'Update Employee'
								: loading
								? 'Creating Employee...'
								: 'Create Employee'
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
