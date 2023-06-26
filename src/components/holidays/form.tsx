import { Alert, Button, Input } from 'kite-react-tailwind';
import React from 'react';

import {
	useCreateHolidayMutation,
	useEditHolidayMutation,
} from '../../store/queries/holidays';
import { handleAxiosErrors, handleYupErrors } from '../../validators';
import { createHolidaySchema } from '../../validators/holidays';

type FormProps = {
	form: {
		name: string;
		date: string;
	};
	onChange: (name: string, value: string) => void;
	editId?: string;
	onSuccess: () => void;
};

function Form({ form, editId, onChange, onSuccess }: FormProps) {
	const [error, setError] = React.useState<{
		message?: string;
		name?: string;
		date?: string;
	}>();

	const { mutate: createHoliday, isLoading: createLoading } =
		useCreateHolidayMutation(
			{ onSuccess },
			{
				onError(error) {
					const err = handleAxiosErrors<{
						name?: string;
						date?: string;
					}>(error);
					if (err) {
						setError((prevState) => ({
							...prevState,
							...err?.data,
							message:
								err?.message || 'An error occurred. Unable to create holiday.',
						}));
					}
				},
			}
		);

	const { mutate: editHoliday, isLoading: editLoading } =
		useEditHolidayMutation(
			{ onSuccess },
			{
				onError(error) {
					const err = handleAxiosErrors<{
						name?: string;
						date?: string;
					}>(error);
					setError((prevState) => ({
						...prevState,
						...err?.data,
						message:
							err?.message || 'An error occurred. Unable to create holiday.',
					}));
				},
			}
		);

	const handleSubmit = React.useCallback(
		async (form: { name: string }) => {
			try {
				const data = await createHolidaySchema.validate(form, {
					abortEarly: false,
				});
				if (editId) {
					editHoliday({ id: editId, data });
				} else {
					createHoliday(data);
				}
			} catch (error) {
				const err = handleYupErrors<{
					name?: string;
					date?: string;
				}>(error);
				if (err) setError((prevState) => ({ ...prevState, ...err }));
			}
		},
		[createHoliday, editHoliday, editId]
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit(form);
			}}
			className="p-4"
		>
			{error?.message && (
				<div className="w-full pb-4">
					<Alert
						type="danger"
						message={error.message}
						onClose={() =>
							setError((prevState) => ({
								...prevState,
								message: undefined,
							}))
						}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:col-span-2">
					<Input
						bg={error?.name ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.name}
						label="Name"
						name="name"
						onChange={(e) => {
							onChange('name', e.target.value);
							setError(undefined);
						}}
						placeholder="Enter Name Of Holiday"
						padding="px-3 py-2"
						required
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						value={form.name}
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Input
						bg={error?.date ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error?.date}
						label="Date"
						name="date"
						onChange={(e) => {
							onChange('date', e.target.value);
							setError(undefined);
						}}
						placeholder="Enter Date Of Holiday"
						padding="px-3 py-2"
						required
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						type="date"
						value={form.date}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						caps
						disabled={createLoading || editLoading}
						title={
							createLoading
								? 'Creating Holiday...'
								: editLoading
								? 'Updating Holiday...'
								: editId
								? 'Update Holiday'
								: 'Create Holiday'
						}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
}

Form.defaultProps = {
	editMode: false,
};

export default Form;
