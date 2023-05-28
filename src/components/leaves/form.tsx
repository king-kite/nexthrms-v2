import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import { FC, useCallback, useEffect, useState } from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useGetEmployeesQuery } from '../../store/queries';
import {
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	LeaveType,
} from '../../types';
import { getDate, getNextDate, getNoOfDays, toCapitalize } from '../../utils';
import { leaveCreateSchema, handleJoiErrors } from '../../validators';

type FormProps = {
	adminView?: boolean;
	initState?: LeaveType;
	errors?: CreateLeaveErrorResponseType & {
		message?: string;
	};
	success?: boolean;
	loading: boolean;
	onSubmit: (form: CreateLeaveQueryType) => void;
};

const Form: FC<FormProps> = ({
	adminView,
	initState,
	errors,
	loading,
	onSubmit,
	success,
}) => {
	const [empLimit, setEmpLimit] = useState(DEFAULT_PAGINATION_SIZE);
	const [form, setForm] = useState<
		CreateLeaveQueryType & {
			noOfDays: number;
		}
	>(
		initState
			? {
					employee: initState.employee.id,
					endDate: getDate(initState.endDate, true) as string,
					startDate: getDate(initState.startDate, true) as string,
					noOfDays: getNoOfDays(
						getDate(undefined, true),
						getNextDate(getDate(), 1)
					),
					reason: initState.reason,
					type: initState.type,
			  }
			: {
					endDate: getNextDate(getDate(), 1, true) as string,
					startDate: getDate(undefined, true) as string,
					noOfDays: getNoOfDays(
						getDate(undefined, true),
						getNextDate(getDate(), 1)
					),
					reason: '',
					type: 'CASUAL',
			  }
	);

	const [formErrors, setErrors] = useState<CreateLeaveErrorResponseType>();

	const employees = useGetEmployeesQuery(
		{ limit: empLimit, offset: 0, search: '' },
		{
			enabled: adminView,
		}
	);

	const employeesError = employees.error ? 'unable to fetch employees' : '';

	useEffect(() => {
		if (success)
			setForm({
				endDate: getNextDate(getDate(), 1, true) as string,
				startDate: getDate(undefined, true) as string,
				noOfDays: getNoOfDays(
					getDate(undefined, true),
					getNextDate(getDate(), 1)
				),
				reason: '',
				type: 'CASUAL',
			});
	}, [success]);

	useEffect(() => {
		if (getDate(form.startDate) < getDate()) {
			setErrors((prevState) => ({
				...prevState,
				startDate: "Start date must not be before today's date",
			}));
		} else if (
			form.endDate &&
			getDate(form.endDate) < getDate(form.startDate)
		) {
			setErrors((prevState) => ({
				...prevState,
				endDate: 'End date must not be before the start date',
			}));
		}
	}, [form]);

	const handleChange = useCallback(
		(name: string, value: string) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));

			if (Object(formErrors)[name])
				setErrors((prevState) => ({
					...prevState,
					[name]: '',
				}));

			if (name === 'noOfDays') {
				const nod = parseInt(value) * 24 * 60 * 60 * 1000; // nod => no_of_days
				const sd = new Date(form.startDate).getTime(); // sd => start_date

				const ed = getDate(new Date(nod + sd), true) as string; // ed => end_date

				setForm((prevState) => ({
					...prevState,
					endDate: ed,
				}));
			} else if (name === 'endDate') {
				const nod = getNoOfDays(form.startDate, value); // ed => no. of days

				setForm((prevState) => ({
					...prevState,
					noOfDays: nod,
				}));
			} else if (name === 'startDate' && form.noOfDays) {
				const nod = form.noOfDays * 24 * 60 * 60 * 1000; // nod => no_of_days
				const sd = new Date(value).getTime(); // sd => start_date

				const ed = getDate(new Date(nod + sd), true) as string; // ed => end_date

				setForm((prevState) => ({
					...prevState,
					endDate: ed,
				}));
			}
		},
		[form, formErrors]
	);

	const handleSubmit = useCallback(
		async (form: CreateLeaveQueryType) => {
			setErrors(undefined);
			try {
				const valid: CreateLeaveQueryType =
					await leaveCreateSchema.validateAsync(form);
				onSubmit(valid);
			} catch (error) {
				const err = handleJoiErrors<CreateLeaveErrorResponseType>(error);
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
			onSubmit={(e) => {
				e.preventDefault();
				const data: CreateLeaveQueryType = {
					startDate: form.startDate,
					endDate: form.endDate,
					reason: form.reason,
					type: form.type,
				};
				if (adminView && form.employee) data.employee = form.employee;
				handleSubmit(data);
			}}
			className="p-4"
		>
			{errors?.message && (
				<div className="pb-4 w-full">
					<Alert type="danger" message={errors.message} />
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				{adminView && (
					<div className="w-full md:col-span-2">
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
							error={employeesError || formErrors?.employee}
							label="Employee"
							name="employee"
							onChange={({ target: { value } }) =>
								handleChange('employee', value)
							}
							placeholder="Select Employee"
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
							value={form?.employee || ''}
						/>
					</div>
				)}
				<div className="w-full md:col-span-2">
					<Select
						disabled={loading}
						error={formErrors?.type || errors?.type}
						label="Type"
						name="type"
						onChange={({ target: { value } }) => handleChange('type', value)}
						options={[
							{ title: 'Annual', value: 'ANNUAL' },
							{ title: 'Casual', value: 'CASUAL' },
							{ title: 'Hospitalization', value: 'HOSPITALIZATION' },
							{ title: 'Loss Of Pay', value: 'LOP' },
							{ title: 'Maternity', value: 'MATERNITY' },
							{ title: 'Paternity', value: 'PATERNITY' },
							{ title: 'Sick', value: 'SICK' },
						]}
						value={form.type}
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Input
						disabled={loading}
						label="Number Of Days (optional)"
						min="1"
						name="noOfDays"
						onChange={({ target: { value } }) =>
							handleChange('noOfDays', value)
						}
						placeholder="Enter Number of Days"
						requirements={[
							{
								value:
									'This will calculate the number of days from the start date and automatically set the end date. Do note that if the end date is altered, the number of days will respond to that alteration.',
							},
						]}
						type="number"
						value={form?.noOfDays}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={formErrors?.startDate || errors?.startDate}
						label="Select Start Date"
						name="startDate"
						onChange={({ target: { value } }) =>
							handleChange('startDate', value)
						}
						placeholder="Enter Date"
						type="date"
						value={form.startDate}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={formErrors?.endDate || errors?.endDate}
						label="Select End Date"
						name="endDate"
						onChange={({ target: { value } }) => handleChange('endDate', value)}
						placeholder="Enter Date"
						type="date"
						value={form.endDate}
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Textarea
						disabled={loading}
						error={formErrors?.reason || errors?.reason}
						label="Reason For Leave"
						name="reason"
						onChange={({ target: { value } }) => handleChange('reason', value)}
						placeholder="Enter your reason for Leave"
						value={form.reason}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={loading ? 'Requesting...' : 'Request Leave'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

Form.defaultProps = {
	adminView: false,
};

export default Form;
