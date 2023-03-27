import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import {
	FC,
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetProjectTeamQuery } from '../../../store/queries';
import {
	CreateProjectTaskErrorResponseType,
	CreateProjectTaskQueryType,
	ProjectTaskType,
} from '../../../types';
import { getStringedDate, toCapitalize } from '../../../utils';
import { handleJoiErrors, taskCreateSchema } from '../../../validators';

type ErrorType = CreateProjectTaskErrorResponseType;

export type FormProps = {
	editMode?: boolean;
	errors?: ErrorType;
	resetErrors?: Dispatch<
		SetStateAction<CreateProjectTaskErrorResponseType | undefined>
	>;
	initState?: ProjectTaskType;
	loading: boolean;
	success?: boolean;
	onSubmit: (form: CreateProjectTaskQueryType) => void;
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
		followers: string[];
		leaders: string[];
	}>({
		followers:
			initState?.followers
				.filter((follower) => !follower.isLeader && follower)
				.map((follower) => follower.member.id) || [],
		leaders:
			initState?.followers
				.filter((follower) => follower.isLeader && follower)
				.map((follower) => follower.member.id) || [],
	});
	const [formErrors, setErrors] =
		useState<CreateProjectTaskErrorResponseType>();

	const [empLimit, setEmpLimit] = useState(DEFAULT_PAGINATION_SIZE);

	const formRef = useRef<HTMLFormElement | null>(null);

	const router = useRouter();
	const id = router.query.id as string;

	const employees = useGetProjectTeamQuery({
		id,
		limit: empLimit,
		offset: 0,
		search: '',
	});

	const employeesError = employees.error ? 'unable to fetch employees' : '';

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
		(name: 'followers' | 'leaders', value: string | string[]) => {
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
			setForm({ followers: [], leaders: [] });
		}
	}, [success]);

	const handleSubmit = useCallback(
		async (form: CreateProjectTaskQueryType) => {
			try {
				setErrors(undefined);
				const valid = await taskCreateSchema.validateAsync(form);
				if (valid) onSubmit(form);
			} catch (error) {
				const err = handleJoiErrors<CreateProjectTaskErrorResponseType>(error);
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
						name: formRef.current.taskName.value,
						priority: formRef.current.priority.value,
						dueDate: formRef.current.dueDate.value,
						description: formRef.current.description.value,
						completed: formRef.current.status.value === 'completed',
						followers: form.followers
							.map((member) => ({
								memberId: member,
								isLeader: false,
							}))
							.concat(
								form.leaders.map((leader) => ({
									memberId: leader,
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
						label="Task Name"
						name="taskName"
						onChange={() => removeErrors('name')}
						placeholder="Enter the name of the Task"
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
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						defaultValue={
							initState?.dueDate
								? getStringedDate(initState.dueDate)
								: undefined
						}
						disabled={loading}
						error={formErrors?.dueDate || errors?.dueDate}
						label="Due Date"
						name="dueDate"
						onChange={() => removeErrors('dueDate')}
						placeholder="Enter the Task Deadline"
						type="date"
					/>
				</div>

				<div className="w-full md:flex md:flex-col md:justify-end">
					<Select
						defaultValue={initState?.completed ? 'completed' : 'ongoing'}
						disabled={loading}
						error={formErrors?.completed || errors?.completed}
						label="Status"
						name="status"
						onChange={() => removeErrors('status')}
						options={[
							{ title: 'Ongoing', value: 'Ongoing' },
							{ title: 'Completed', value: 'completed' },
						]}
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
						error={employeesError || formErrors?.followers}
						label="Task Leaders"
						onChange={({ target: { selectedOptions } }) => {
							const selectValues = Array.from(
								selectedOptions,
								(option) => option.value
							);
							handleFormChange('leaders', selectValues);
						}}
						multiple
						name="leaders"
						placeholder="Select Task Leaders"
						options={
							employees.data
								? employees.data.result.reduce(
										(
											total: {
												title: string;
												value: string;
											}[],
											member
										) => {
											return [
												...total,
												{
													title: toCapitalize(
														member.employee.user.firstName +
															' ' +
															member.employee.user.lastName
													),
													value: member.id,
												},
											];
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
						error={employeesError || formErrors?.followers || errors?.followers}
						label="Task Followers"
						onChange={({ target: { selectedOptions } }) => {
							const selectValues = Array.from(
								selectedOptions,
								(option) => option.value
							);
							handleFormChange('followers', selectValues);
						}}
						multiple
						name="team"
						placeholder="Select Task Followers"
						options={
							employees.data
								? employees.data.result.reduce(
										(
											total: {
												title: string;
												value: string;
											}[],
											member
										) => {
											return [
												...total,
												{
													title: toCapitalize(
														member.employee.user.firstName +
															' ' +
															member.employee.user.lastName
													),
													value: member.id,
												},
											];
										},
										[]
								  )
								: []
						}
						required={false}
						value={form.followers}
					/>
				</div>

				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Textarea
						defaultValue={initState?.description}
						disabled={loading}
						error={formErrors?.description || errors?.description}
						label="Task Description"
						name="description"
						onChange={() => removeErrors('description')}
						placeholder="Describe this task"
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
									? 'Updating Task...'
									: 'Update Task'
								: loading
								? 'Creating Task...'
								: 'Create Task'
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
