import {
	Alert,
	Button,
	Checkbox,
	File,
	Input,
	Select,
	Textarea,
} from 'kite-react-tailwind';
import {
	FC,
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
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
import {
	createUserSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

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

const Form: FC<FormProps> = ({
	editMode,
	initState,
	errors,
	resetErrors,
	loading,
	success,
	onSubmit,
}) => {
	const [depLimit, setDepLimit] = useState(DEFAULT_PAGINATION_SIZE);
	const [empLimit, setEmpLimit] = useState(DEFAULT_PAGINATION_SIZE);
	const [jobLimit, setJobLimit] = useState(DEFAULT_PAGINATION_SIZE);

	const formStaleData = useMemo(
		() => ({
			isEmployee: initState?.employee ? true : false,
			isClient: initState?.client ? true : false,
			image: '',
			department: initState?.employee?.department?.id,
			job: initState?.employee?.job?.id,
			supervisor: initState?.employee?.supervisor?.id,
		}),
		[initState]
	);

	const [form, setForm] = useState(formStaleData);
	const [formErrors, setErrors] = useState<ErrorType>();

	const formRef = useRef<HTMLFormElement | null>(null);

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

	const handleSubmit = useCallback(
		async (input: CreateUserQueryType) => {
			try {
				const valid: CreateUserQueryType = await createUserSchema.validateAsync(
					{ ...input }
				);
				const form = new FormData();
				valid.profile.image && form.append('image', valid.profile.image);
				const formJsonData = JSON.stringify(valid);
				form.append('form', formJsonData);
				onSubmit(form);
			} catch (err) {
				const error = handleJoiErrors<CreateUserErrorResponseType>(err);
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

	const removeFormErrors = useCallback(
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

	const handleFormChange = useCallback(
		(name: string, value: string) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
			removeFormErrors(name);
		},
		[removeFormErrors]
	);

	useEffect(() => {
		if (success && !editMode) {
			setForm(formStaleData);
			if (formRef.current) {
				formRef.current.reset();
			}
		}
	}, [formStaleData, success, editMode]);

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
						isSuperUser: formRef.current.isSuperUser.checked,
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
							supervisor:
								form.supervisor || initState?.employee?.supervisor?.id || '',
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
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
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
						error={formErrors?.phone || errors?.phone}
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
				<div className="w-full md:col-span-2">
					<Textarea
						defaultValue={initState?.profile?.address || undefined}
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
						defaultValue={initState?.profile?.state || undefined}
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
						defaultValue={initState?.profile?.city || undefined}
						disabled={loading}
						error={formErrors?.city || errors?.city}
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
						error={formErrors?.dob || errors?.dob}
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
						error={formErrors?.dob || errors?.dob}
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
					<Fragment>
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
									formErrors?.department ||
									errors?.department
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
								error={jobsError || formErrors?.job || errors?.job}
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
							<Select
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
								error={
									employeesError || formErrors?.supervisor || errors?.supervisor
								}
								label="Supervisor"
								name="supervisor"
								onChange={({ target: { value } }) =>
									handleFormChange('supervisor', value)
								}
								value={form.supervisor}
								placeholder="Select Supervisor"
								options={
									employees.data
										? employees.data.result.reduce(
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
																title: toCapitalize(
																	employee.user.firstName +
																		' ' +
																		employee.user.lastName
																),
																value: employee.id,
															},
														];
													return total;
												},
												[]
										  )
										: []
								}
								required={false}
							/>
						</div>
						<div className="w-full">
							<Input
								defaultValue={getStringedDate()}
								disabled={loading}
								error={formErrors?.dateEmployed || errors?.dateEmployed}
								label="Date Employed"
								name="dateEmployed"
								onChange={() => removeFormErrors('dateEmployed')}
								placeholder="Date Employed"
								type="date"
							/>
						</div>
					</Fragment>
				)}
				{/* Employee Info Stop */}

				{/* Client Info Start */}
				{form.isClient && (
					<Fragment>
						<div className="w-full">
							<Input
								defaultValue={initState?.client?.company}
								disabled={loading}
								error={formErrors?.company || errors?.company}
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
								error={formErrors?.position || errors?.position}
								label="Client Position"
								name="position"
								onChange={() => removeFormErrors('position')}
								placeholder="Position in Company"
							/>
						</div>
					</Fragment>
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
