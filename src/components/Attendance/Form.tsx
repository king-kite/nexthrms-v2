import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import {
	useCreateAttendanceMutation,
	useEditAttendanceMutation,
	useGetEmployeesQuery,
} from '../../store/queries';
import { AttendanceCreateType, AttendanceCreateErrorType } from '../../types';
import {
	attendanceCreateSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

type FormProps = {
	form: AttendanceCreateType;
	onChange: (name: string, value: string) => void;
	editId?: string;
	onSuccess: () => void;
};

function Form({ form, editId, onChange, onSuccess }: FormProps) {
	const [error, setError] = React.useState<
		AttendanceCreateErrorType & {
			message?: string;
		}
	>();

	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const {
		data: employees,
		isLoading: empLoading,
		isFetching: empFetching,
	} = useGetEmployeesQuery({
		limit,
		onError({ message }) {
			setError((prevState) => ({ ...prevState, hod: message }));
		},
	});

	const { mutate: createAttendance, isLoading: createLoading } =
		useCreateAttendanceMutation(
			{ onSuccess },
			{
				onError(error) {
					const err = handleAxiosErrors<
						AttendanceCreateErrorType & {
							message?: string;
						}
					>(error);
					setError((prevState) => ({
						...prevState,
						...err?.data,
						message: err?.message,
					}));
				},
			}
		);

	const { mutate: editAttendance, isLoading: editLoading } =
		useEditAttendanceMutation(
			{ onSuccess },
			{
				onError(error) {
					const err = handleAxiosErrors<
						AttendanceCreateErrorType & {
							message?: string;
						}
					>(error);
					setError((prevState) => ({
						...prevState,
						...err?.data,
						message: err?.message,
					}));
				},
			}
		);

	const handleSubmit = React.useCallback(
		async (form: AttendanceCreateType) => {
			try {
				setError(undefined);
				const data: AttendanceCreateType =
					await attendanceCreateSchema.validateAsync(form);
				if (editId) {
					editAttendance({ id: editId, data });
				} else {
					createAttendance(data);
				}
			} catch (error) {
				const err = handleJoiErrors<{
					name?: string;
					hod?: string;
				}>(error);
				if (err) setError((prevState) => ({ ...prevState, ...err }));
			}
		},
		[createAttendance, editAttendance, editId]
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				setError(undefined);

				const punchIn = new Date(1970, 0, 1);
				punchIn.setHours(parseInt(form.punchIn.split(':')[0]));
				punchIn.setMinutes(parseInt(form.punchIn.split(':')[1]));
				punchIn.setSeconds(0);

				const data: AttendanceCreateType = {
					employee: form.employee,
					date: form.date,
					punchIn: punchIn.toString(),
				};
				if (form.punchOut) {
					const punchOut = new Date(1970, 0, 1);
					punchOut.setHours(parseInt(form.punchOut.split(':')[0]));
					punchOut.setMinutes(parseInt(form.punchOut.split(':')[1]));
					punchOut.setSeconds(0);
					data.punchOut = punchOut.toString();
				}
				if (form.overtime?.reason && form.overtime?.hours)
					data.overtime = form.overtime;
				handleSubmit(data);
			}}
			className="p-4"
		>
			{error?.message && (
				<div className="mb-2 md:mb-3 lg:mb-4">
					<Alert
						onClose={() => {
							setError((prevState) => ({ ...prevState, message: '' }));
						}}
						message={error.message}
						type="danger"
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="flex flex-col items-start justify-end w-full">
					<div className="w-full">
						<Select
							bg={error?.employee ? 'bg-red-100' : undefined}
							btn={{
								disabled:
									(employees && employees.total >= employees.result.length) ||
									empFetching ||
									empLoading,
								onClick: () => {
									if (employees && employees.total >= employees.result.length) {
										setLimit(
											(prevState) => prevState + DEFAULT_PAGINATION_SIZE
										);
									}
								},
								title: empFetching
									? 'loading...'
									: employees && employees.total >= employees.result.length
									? 'loaded all'
									: 'load more',
							}}
							color="text-gray-800"
							disabled={empLoading || createLoading || editLoading}
							error={error?.employee}
							label="Employee"
							name="employee"
							onChange={({ target: { value } }) => {
								onChange('employee', value);
								if (error?.employee)
									setError((prevState) => ({
										...prevState,
										employee: undefined,
									}));
							}}
							options={
								employees?.result
									? employees.result.map((employee) => ({
											title:
												employee.user.firstName + ' ' + employee.user.lastName,
											value: employee.id,
									  }))
									: []
							}
							placeholder="Select Employee"
							padding="px-3 py-2"
							rounded="rounded-md"
							textSize="text-sm md:text-base"
							value={form.employee}
						/>
					</div>
				</div>
				<div className="flex flex-col items-start justify-end w-full">
					<Input
						bg={error?.date ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.date}
						label="Date"
						name="date"
						onChange={({ target: { value } }) => {
							onChange('date', value);
							if (error?.date)
								setError((prevState) => ({
									...prevState,
									date: undefined,
								}));
						}}
						placeholder="Enter Date"
						padding="px-3 py-2"
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						type="date"
						value={form.date}
					/>
				</div>
				<div className="flex flex-col items-start justify-end w-full">
					<Input
						bg={error?.punchIn ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.punchIn}
						label="Punch In"
						name="punchIn"
						onChange={({ target: { value } }) => {
							onChange('punchIn', value);
							if (error?.punchIn)
								setError((prevState) => ({
									...prevState,
									punchIn: undefined,
								}));
						}}
						placeholder="Enter Punch In Time"
						padding="px-3 py-2"
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						type="time"
						value={form.punchIn}
					/>
				</div>
				<div className="flex flex-col items-start justify-end w-full">
					<Input
						bg={error?.punchOut ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.punchOut}
						label="Punch Out"
						name="punchOut"
						onChange={({ target: { value } }) => {
							onChange('punchOut', value);
							if (error?.punchOut)
								setError((prevState) => ({
									...prevState,
									punchOut: undefined,
								}));
						}}
						placeholder="Enter Punch Out Time"
						padding="px-3 py-2"
						required={false}
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						type="time"
						value={form.punchOut}
					/>
				</div>
				<div className="flex flex-col items-start justify-end w-full md:col-span-2">
					<Input
						bg={error?.hours ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.hours}
						label="Overtime Hours (if overtime is available)"
						min="1"
						max="4"
						name="hours"
						onChange={({ target: { value } }) => {
							onChange('hours', value);
							if (error?.hours)
								setError((prevState) => ({
									...prevState,
									hours: undefined,
								}));
						}}
						placeholder="Enter hours spent on overtime"
						padding="px-3 py-2"
						required={false}
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						type="number"
						value={form.overtime?.hours}
					/>
				</div>
				<div className="flex flex-col items-start justify-end w-full md:col-span-2">
					<Textarea
						bg={error?.reason ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.reason}
						label="Reason for overtime (if overtime is available)"
						onChange={({ target: { value } }) => {
							onChange('reason', value);
							if (error?.reason)
								setError((prevState) => ({
									...prevState,
									reason: undefined,
								}));
						}}
						name="reason"
						required={false}
						placeholder="Enter the reason for overtime."
						value={form.overtime?.reason}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						caps
						disabled={createLoading || editLoading}
						loader
						loading={createLoading || editLoading}
						title={editId ? 'update record' : 'add record'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
}

export default Form;
