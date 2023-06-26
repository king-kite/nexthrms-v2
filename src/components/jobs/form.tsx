import { Button, Input } from 'kite-react-tailwind';
import React from 'react';

import {
	useCreateJobMutation,
	useEditJobMutation,
} from '../../store/queries/jobs';
import { handleAxiosErrors, handleYupErrors } from '../../validators';
import { createJobSchema } from '../../validators/jobs';

type FormProps = {
	form: {
		name: string;
	};
	onChange: (name: string, value: string) => void;
	editId?: string;
	onSuccess: () => void;
};

function Form({ form, editId, onChange, onSuccess }: FormProps) {
	const [error, setError] = React.useState<string>();

	const { mutate: createJob, isLoading: createLoading } = useCreateJobMutation(
		{ onSuccess },
		{
			onError(error) {
				const err = handleAxiosErrors<{
					name: string;
				}>(error);
				if (err) {
					setError(
						err.data?.name ||
							err.message ||
							'An error occurred. Unable to create job.'
					);
				}
			},
		}
	);

	const { mutate: editJob, isLoading: editLoading } = useEditJobMutation(
		{ onSuccess },
		{
			onError(error) {
				const err = handleAxiosErrors<{
					name: string;
				}>(error);
				if (err) {
					setError(
						err.data?.name ||
							err.message ||
							'An error occurred. Unable to create job.'
					);
				}
			},
		}
	);

	const handleSubmit = React.useCallback(
		async (form: { name: string }) => {
			try {
				const data: { name: string } = await createJobSchema.validate(form, {
					abortEarly: false,
				});
				if (editId) {
					editJob({ id: editId, data });
				} else {
					createJob(data);
				}
			} catch (error) {
				const err = handleYupErrors<{
					name?: string;
				}>(error);
				if (err?.name) setError(err.name);
			}
		},
		[createJob, editJob, editId]
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit(form);
			}}
			className="p-4"
		>
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:col-span-2">
					<Input
						bg={error ? 'bg-red-100' : undefined}
						color="text-gray-800"
						disabled={createLoading || editLoading}
						error={error}
						label="Name"
						name="name"
						onChange={(e) => {
							onChange('name', e.target.value);
							setError(undefined);
						}}
						placeholder="Enter Name Of Job"
						padding="px-3 py-2"
						required
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						value={form.name}
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
						title={editId ? 'update job' : 'add job'}
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
