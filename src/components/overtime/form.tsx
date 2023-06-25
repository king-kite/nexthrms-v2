import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useGetEmployeesQuery } from '../../store/queries';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	OvertimeType,
} from '../../types';
import { getDate, toCapitalize } from '../../utils';
import { handleYupErrors } from '../../validators';
import { overtimeCreateSchema } from '../../validators/overtime';

type FormProps = {
	adminView?: boolean;
	initState?: OvertimeType;
	errors?: CreateOvertimeErrorResponseType & {
		message?: string;
	};
	success?: boolean;
	loading: boolean;
	onSubmit: (form: CreateOvertimeQueryType) => void;
};

const Form = ({
	adminView,
	initState,
	errors,
	loading,
	onSubmit,
	success,
}: FormProps) => {
	const [empLimit, setEmpLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [formErrors, setErrors] =
		React.useState<CreateOvertimeErrorResponseType>();

	const formRef = React.useRef<HTMLFormElement | null>(null);

	const employees = useGetEmployeesQuery(
		{ limit: empLimit, offset: 0, search: '' },
		{
			enabled: adminView,
		}
	);

	const employeesError = employees.error ? 'unable to fetch employees' : '';

	React.useEffect(() => {
		if (success && formRef.current) formRef.current.reset();
	}, [success]);

	const handleChange = React.useCallback(
		(name: string, value: string) => {
			if (Object(formErrors)[name])
				setErrors((prevState) => ({
					...prevState,
					[name]: '',
				}));
		},
		[formErrors]
	);

	const handleSubmit = React.useCallback(
		async (form: CreateOvertimeQueryType) => {
			setErrors(undefined);
			try {
				const valid = await overtimeCreateSchema.validate(form);
				onSubmit(valid);
			} catch (error) {
				const err = handleYupErrors<CreateOvertimeErrorResponseType>(error);
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
				if (formRef.current) {
					const data: CreateOvertimeQueryType = {
						date: formRef.current.date.value,
						hours: formRef.current.hours.value,
						reason: formRef.current.reason.value,
						type: formRef.current.type.value,
					};
					if (adminView && formRef.current.employee.value)
						data.employee = formRef.current.employee.value;
					handleSubmit(data);
				}
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
							defaultValue={
								(!employees.isLoading && initState?.employee.id) || undefined
							}
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
						/>
					</div>
				)}
				<div className="w-full md:col-span-2">
					<Select
						defaultValue={initState?.type || 'COMPULSORY'}
						disabled={loading}
						error={formErrors?.type || errors?.type}
						label="Type"
						name="type"
						onChange={({ target: { value } }) => handleChange('type', value)}
						options={[
							{ title: 'Compulsory', value: 'COMPULSORY' },
							{ title: 'Holiday', value: 'HOLIDAY' },
							{ title: 'Voluntary', value: 'VOLUNTARY' },
						]}
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={getDate(initState?.date, true) as string}
						disabled={loading}
						error={formErrors?.date || errors?.date}
						label="Select Date"
						name="date"
						onChange={({ target: { value } }) => handleChange('date', value)}
						placeholder="Enter Date"
						type="date"
					/>
				</div>
				<div className="w-full">
					<Input
						defaultValue={initState?.hours || 1}
						disabled={loading}
						error={formErrors?.hours || errors?.hours}
						label="Hours"
						name="hours"
						onChange={({ target: { value } }) => handleChange('hours', value)}
						placeholder="Enter Number Of Hours"
						type="number"
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Textarea
						defaultValue={initState?.reason}
						disabled={loading}
						error={formErrors?.reason || errors?.reason}
						label="Reason For Overtime"
						name="reason"
						onChange={({ target: { value } }) => handleChange('reason', value)}
						placeholder="Enter your reason for Overtime"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={loading ? 'Requesting...' : 'Request Overtime'}
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
