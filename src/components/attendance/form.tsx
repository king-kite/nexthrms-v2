import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import {
	useCreateAttendanceMutation,
	useEditAttendanceMutation,
} from '../../store/queries/attendance';
import { useGetEmployeesQuery } from '../../store/queries/employees';
import { AttendanceCreateType, AttendanceCreateErrorType } from '../../types';
import { getDate } from '../../utils';
import { handleAxiosErrors, handleYupErrors } from '../../validators';
import { attendanceCreateSchema } from '../../validators/attendance';

type FormProps = {
	form: AttendanceCreateType;
	onChange: (name: string, value: string) => void;
	editId?: string;
	onSuccess: () => void;
};

function Form({ form, editId, onChange, onSuccess }: FormProps) {
	const formRef = React.useRef<HTMLFormElement | null>(null);
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
			{
				onSuccess() {
					onSuccess();
					if (formRef.current) formRef.current.reset();
				},
			},
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
			{
				onSuccess() {
					onSuccess();
					if (formRef.current) formRef.current.reset();
				},
			},
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
				const newForm: AttendanceCreateType = {
					employee: form.employee,
					date: form.date,
					punchIn: form.punchIn,
					punchOut: form.punchOut,
					overtime: null,
				};
				if (form.overtime?.reason.trim() && form.overtime?.hours > 0)
					newForm.overtime = form.overtime;
				const data = await attendanceCreateSchema.validate(newForm, {
					abortEarly: false,
				});
				if (editId) {
					editAttendance({ id: editId, data });
				} else {
					createAttendance(data);
				}
			} catch (error) {
				const err = handleYupErrors<{
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
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				setError(undefined);

				const punchIn = new Date(1970, 0, 1);
				punchIn.setHours(
					typeof form.punchIn === 'string'
						? parseInt(form.punchIn.split(':')[0])
						: form.punchIn.getHours()
				);
				punchIn.setMinutes(
					typeof form.punchIn === 'string'
						? parseInt(form.punchIn.split(':')[1])
						: form.punchIn.getMinutes()
				);
				punchIn.setSeconds(0);

				const data: AttendanceCreateType = {
					employee: form.employee,
					date: form.date,
					punchIn: punchIn.toString(),
				};
				if (form.punchOut) {
					const punchOut = new Date(1970, 0, 1);
					punchOut.setHours(
						typeof form.punchOut === 'string'
							? parseInt(form.punchOut.split(':')[0])
							: form.punchOut.getHours()
					);
					punchOut.setMinutes(
						typeof form.punchOut === 'string'
							? parseInt(form.punchOut.split(':')[1])
							: form.punchOut.getMinutes()
					);
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
						value={getDate(form.date, true) as string}
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
						value={typeof form.punchIn !== 'object' ? form.punchIn : ''}
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
						value={typeof form.punchOut !== 'object' ? form.punchOut : ''}
					/>
				</div>
				<div className="flex flex-col items-start justify-end w-full md:col-span-2">
					<Input
						bg={error?.overtime?.hours ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.overtime?.hours}
						label="Overtime Hours (if overtime is available)"
						min="0"
						max="4"
						name="hours"
						onChange={({ target: { value } }) => {
							onChange('hours', value);
							if (error?.overtime?.hours)
								setError((prevState) => ({
									...prevState,
									overtime: {
										...prevState?.overtime,
										hours: undefined,
									},
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
						bg={error?.overtime?.reason ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.overtime?.reason}
						label="Reason for overtime (if overtime is available)"
						onChange={({ target: { value } }) => {
							onChange('reason', value);
							if (error?.overtime?.reason)
								setError((prevState) => ({
									...prevState,
									overtime: {
										...prevState?.overtime,
										reason: undefined,
									},
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
