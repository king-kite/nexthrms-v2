import { Alert, Button, Input, Select, Textarea } from '@king-kite/react-kit';
import {
	FC,
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useGetClientsQuery, useGetEmployeesQuery } from '../../store/queries';
import {
	CreateProjectErrorResponseType,
	CreateProjectQueryType,
	ProjectType,
} from '../../types';
import { toCapitalize } from '../../utils';
import { handleJoiErrors, projectCreateSchema } from '../../validators';

interface ErrorType extends CreateProjectErrorResponseType {
	message?: string;
}

export type FormProps = {
	editMode?: boolean;
	errors?: ErrorType;
	resetErrors?: Dispatch<
		SetStateAction<CreateProjectErrorResponseType | undefined>
	>;
	initState?: ProjectType;
	loading: boolean;
	success?: boolean;
	onSubmit: (form: CreateProjectQueryType) => void;
};

const Form: FC<FormProps> = ({
	editMode,
	errors,
	resetErrors,
	initState,
	loading,
	onSubmit,
	success,
}) => {
	// Use this to manage 'Select' Component state
	const [form, setForm] = useState<{
		client: string;
		team: string[];
		leaders: string[];
	}>({
		client: initState?.client?.id || '',
		team:
			initState?.team
				.filter((member) => !member.isLeader && member)
				.map((member) => member.employee.id) || [],
		leaders:
			initState?.team
				.filter((member) => member.isLeader && member)
				.map((member) => member.employee.id) || [],
	});
	const [formErrors, setErrors] = useState<CreateProjectErrorResponseType>();

	const [clientLimit, setClientLimit] = useState(DEFAULT_PAGINATION_SIZE);
	const [empLimit, setEmpLimit] = useState(DEFAULT_PAGINATION_SIZE);

	const formRef = useRef<HTMLFormElement | null>(null);

	const clients = useGetClientsQuery({
		limit: clientLimit,
		offset: 0,
		search: '',
	});
	const employees = useGetEmployeesQuery({
		limit: empLimit,
		offset: 0,
		search: '',
	});

	const employeesError = employees.error ? 'unable to fetch employees' : '';
	const clientsError = clients.error ? 'unable to fetch clients' : '';

	const removeErrors = useCallback(
		(name: string) => {
			if (Object(formErrors)[name]) {
				setErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
			}
			if (resetErrors && Object(resetErrors)[name])
				resetErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
		},
		[formErrors, resetErrors]
	);

	const handleFormChange = useCallback(
		(name: 'client' | 'team' | 'leaders', value: string | string[]) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
			removeErrors(name);
		},
		[removeErrors]
	);

	useEffect(() => {
		if (success) {
			if (formRef.current) formRef.current.reset();
			setForm({ client: '', team: [], leaders: [] });
		}
	}, [success]);

	const handleSubmit = useCallback(
		async (form: CreateProjectQueryType) => {
			try {
				setErrors(undefined);
				const valid = await projectCreateSchema.validateAsync(form);
				if (valid) onSubmit(form);
			} catch (error) {
				const err = handleJoiErrors<CreateProjectErrorResponseType>(error);
				if (err) {
					setErrors((prevState) => ({
						...prevState,
						...err,
					}));
				}
			}
		},
		[onSubmit]
	);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current)
					handleSubmit({
						name: formRef.current.projectName.value,
						client: form.client || '',
						priority: formRef.current.priority.value,
						initialCost: formRef.current.initialCost.value,
						rate: formRef.current.rate.value,
						startDate: formRef.current.startDate.value,
						endDate: formRef.current.endDate.value,
						description: formRef.current.description.value,
						team: form.team
							.map((member) => ({
								employeeId: member,
								isLeader: false,
							}))
							.concat(
								form.leaders.map((leader) => ({
									employeeId: leader,
									isLeader: true,
								}))
							),
					});
			}}
			className="p-4"
		>
			{errors?.message && (
				<div className="pb-4 w-full">
					<Alert
						message={errors.message}
						type="danger"
						onClose={() => {
							if (resetErrors)
								resetErrors((prevState) => ({
									...prevState,
									message: undefined,
								}));
						}}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.name}
						disabled={loading}
						error={formErrors?.name || errors?.name}
						label="Project Name"
						name="projectName"
						onChange={() => removeErrors('name')}
						placeholder="Enter the name of the Project"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Select
						btn={{
							caps: true,
							disabled:
								clients.isFetching ||
								(clients.data &&
									clients.data.result.length >= clients.data.total),
							onClick: () => {
								if (
									clients.data &&
									clients.data.total > clients.data.result.length
								) {
									setClientLimit(
										(prevState) => prevState + DEFAULT_PAGINATION_SIZE
									);
								}
							},
							title: clients.isFetching
								? 'loading...'
								: clients.data &&
								  clients.data.result.length >= clients.data.total
								? 'loaded all'
								: 'load more',
						}}
						disabled={clients.isLoading || loading}
						error={clientsError || formErrors?.client || errors?.client}
						label="Client"
						onChange={({ target: { value } }) =>
							handleFormChange('client', value)
						}
						required={false}
						placeholder="Select Client"
						options={
							clients.data
								? clients.data.result.reduce(
										(
											total: {
												title: string;
												value: string;
											}[],
											client
										) => {
											if (client.contact.isActive)
												return [
													...total,
													{
														title: toCapitalize(
															client.contact.firstName +
																' ' +
																client.contact.lastName
														),
														value: client.id,
													},
												];
											return total;
										},
										[]
								  )
								: []
						}
						value={form.client}
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={
							initState?.startDate
								? new Date(initState.startDate).toLocaleDateString('en-CA')
								: undefined
						}
						disabled={loading}
						error={formErrors?.startDate || errors?.startDate}
						label="Start Date"
						name="startDate"
						onChange={() => removeErrors('startDate')}
						placeholder="Enter the Start date for the project"
						type="date"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={
							initState?.endDate
								? new Date(initState.endDate).toLocaleDateString('en-CA')
								: undefined
						}
						disabled={loading}
						error={formErrors?.endDate || errors?.endDate}
						label="Deadline"
						name="endDate"
						onChange={() => removeErrors('endDate')}
						placeholder="Enter the Project Deadline"
						type="date"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.initialCost}
						disabled={loading}
						error={formErrors?.initialCost || errors?.initialCost}
						label="Initial Cost"
						name="initialCost"
						onChange={() => removeErrors('initialCost')}
						placeholder="Enter the initial cost to start this project"
						type="number"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={initState?.rate}
						disabled={loading}
						error={formErrors?.rate || errors?.rate}
						label="Rate"
						name="rate"
						onChange={() => removeErrors('initialCost')}
						placeholder="Enter the rate per hour e.g. 20"
						type="number"
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Select
						defaultValue={initState?.priority || 'HIGH'}
						disabled={loading}
						error={formErrors?.priority || errors?.priority}
						label="Priority"
						name="priority"
						onChange={() => removeErrors('initialCost')}
						options={[
							{ title: 'HIGH', value: 'HIGH' },
							{ title: 'MEDIUM', value: 'MEDIUM' },
							{ title: 'LOW', value: 'LOW' },
						]}
					/>
				</div>

				<div className="hidden md:flex md:flex-col md:justify-end" />

				<div className="w-full md:flex md:flex-col md:justify-end">
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
						error={employeesError || formErrors?.team || errors?.team}
						label="Team Leaders"
						onChange={({ target: { selectedOptions } }) => {
							const selectValues = Array.from(
								selectedOptions,
								(option) => option.value
							);
							handleFormChange('leaders', selectValues);
						}}
						multiple
						name="leaders"
						placeholder="Select Team Leaders"
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
						value={form.leaders}
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
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
						error={employeesError || formErrors?.team || errors?.team}
						label="Team Members"
						onChange={({ target: { selectedOptions } }) => {
							const selectValues = Array.from(
								selectedOptions,
								(option) => option.value
							);
							handleFormChange('team', selectValues);
						}}
						multiple
						name="team"
						placeholder="Select Team Members"
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
						value={form.team}
					/>
				</div>

				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Textarea
						defaultValue={initState?.description}
						disabled={loading}
						error={formErrors?.description || errors?.description}
						label="Project Description"
						name="description"
						onChange={() => removeErrors('description')}
						placeholder="Describe this project"
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
									? 'Updating Project...'
									: 'Update Project'
								: loading
								? 'Creating Project...'
								: 'Create Project'
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
