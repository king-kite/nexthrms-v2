import { Alert, Button, Input, Select } from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import {
	useCreateDepartmentMutation,
	useEditDepartmentMutation,
	useGetEmployeesQuery,
} from '../../store/queries';
import {
	createDepartmentSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

type FormProps = {
	form: {
		name: string;
		hod: string | null;
	};
	onChange: (name: string, value: string | null) => void;
	editId?: string;
	onSuccess: () => void;
};

function Form({ form, editId, onChange, onSuccess }: FormProps) {
	const [error, setError] = React.useState<{
		message?: string;
		name?: string;
		hod?: string;
	}>();

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

	const { mutate: createDepartment, isLoading: createLoading } =
		useCreateDepartmentMutation(
			{ onSuccess },
			{
				onError(error) {
					const err = handleAxiosErrors<{
						name?: string;
						hod?: string;
					}>(error);
					setError((prevState) => ({
						...prevState,
						...err?.data,
						message: err?.message,
					}));
				},
			}
		);

	const { mutate: editDepartment, isLoading: editLoading } =
		useEditDepartmentMutation(
			{ onSuccess },
			{
				onError(error) {
					const err = handleAxiosErrors<{
						name?: string;
						hod?: string;
					}>(error);
					setError((prevState) => ({
						...prevState,
						...err?.data,
						message: err?.message,
					}));
				},
			}
		);

	const handleSubmit = React.useCallback(
		async (form: { name: string; hod: string | null }) => {
			try {
				setError(undefined);
				const data: { name: string; hod: string | null } =
					await createDepartmentSchema.validateAsync(form);
				if (editId) {
					editDepartment({ id: editId, data });
				} else {
					createDepartment(data);
				}
			} catch (error) {
				const err = handleJoiErrors<{
					name?: string;
					hod?: string;
				}>(error);
				if (err) setError((prevState) => ({ ...prevState, ...err }));
			}
		},
		[createDepartment, editDepartment, editId]
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
				<div className="mb-2 md:mb-3">
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
							setError((prevState) => ({ ...prevState, name: undefined }));
						}}
						placeholder="Enter Department Name"
						padding="px-3 py-2"
						required
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						value={form.name}
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Select
						bg={error?.hod ? 'bg-red-100' : undefined}
						btn={{
							disabled:
								(employees && employees.total >= employees.result.length) ||
								empFetching ||
								empLoading,
							onClick: () => {
								if (employees && employees.total >= employees.result.length) {
									setLimit((prevState) => prevState + DEFAULT_PAGINATION_SIZE);
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
						error={error?.hod}
						label="Head Of Department"
						name="hod"
						onChange={({ target: { value } }) => {
							if (value && value.trim() !== '') onChange('hod', value);
							else onChange('hod', null);
							setError((prevState) => ({ ...prevState, hod: undefined }));
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
						placeholder="Enter Head Of Department"
						padding="px-3 py-2"
						required={false}
						rounded="rounded-md"
						textSize="text-sm md:text-base"
						value={form.hod || ''}
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
						title={editId ? 'update department' : 'add department'}
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
