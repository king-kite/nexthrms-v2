import { Alert, Button, Input, Select, Textarea } from 'kite-react-tailwind';
import {
	ChangeEventHandler,
	Dispatch,
	FC,
	SetStateAction,
	useCallback,
	useState,
} from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useGetUsersQuery } from '../../store/queries';

import {
	AssetCreateQueryType,
	CreateAssetErrorResponseType,
} from '../../types';
import { getStringedDate, toCapitalize } from '../../utils';
import {
	createAssetSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

type ErrorType = CreateAssetErrorResponseType & {
	message?: string;
};

type FormProps = {
	editMode: boolean;
	errors?: ErrorType;
	form: AssetCreateQueryType;
	loading: boolean;
	onChange: ChangeEventHandler<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>;
	onSubmit: (form: AssetCreateQueryType) => void;
	setErrors: Dispatch<SetStateAction<ErrorType | undefined>>;
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
	errors,
	form,
	loading,
	onChange,
	onSubmit,
	setErrors,
}) => {
	const [usrLimit, setUsrLimit] = useState(DEFAULT_PAGINATION_SIZE);

	const users = useGetUsersQuery({ limit: usrLimit, offset: 0, search: '' });

	const usersError = handleDataError(users.error);

	const handleSubmit = useCallback(
		async (input: AssetCreateQueryType) => {
			try {
				const valid: AssetCreateQueryType =
					await createAssetSchema.validateAsync({ ...input });
				onSubmit(valid);
			} catch (err) {
				const error = handleJoiErrors<CreateAssetErrorResponseType>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					return {
						...prevState,
						message: `Unable to ${
							editMode ? 'update' : 'add'
						} asset. Please try again later.`,
					};
				});
			}
		},
		[onSubmit, setErrors, editMode]
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (form) handleSubmit(form);
			}}
			className="p-4"
		>
			{errors?.message && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={errors?.message}
						onClose={() =>
							setErrors((prevState) => ({ ...prevState, message: undefined }))
						}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 items-end md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.name}
						label="Asset Name"
						name="name"
						onChange={onChange}
						placeholder="Asset Name"
						value={form?.name}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.assetId}
						label="Asset ID"
						name="assetId"
						onChange={onChange}
						placeholder="Asset ID"
						value={form?.assetId}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.purchaseDate}
						label="Purchase Date"
						name="purchaseDate"
						onChange={onChange}
						placeholder="Purchase Date"
						type="date"
						value={getStringedDate(form?.purchaseDate)}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.purchaseFrom}
						label="Purchase From"
						name="purchaseFrom"
						onChange={onChange}
						placeholder="Purchase From"
						value={form?.purchaseFrom}
					/>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end">
					<Input
						disabled={loading}
						error={errors?.manufacturer}
						label="Manufacturer"
						name="manufacturer"
						onChange={onChange}
						placeholder="Manufacturer"
						value={form?.manufacturer}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.model}
						label="Model"
						name="model"
						onChange={onChange}
						placeholder="Model"
						required={false}
						value={form?.model}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.serialNo}
						label="Serial Number"
						name="serialNo"
						onChange={onChange}
						placeholder="Serial Number"
						value={form?.serialNo}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.supplier}
						label="Supplier"
						name="supplier"
						onChange={onChange}
						placeholder="Supplier"
						value={form?.supplier}
					/>
				</div>
				<div className="w-full">
					<Select
						disabled={loading}
						error={errors?.condition}
						label="Condition"
						name="condition"
						placeholder="Select Condition"
						onChange={onChange}
						options={[
							{ title: 'Bad', value: 'BAD' },
							{ title: 'Good', value: 'GOOD' },
							{ title: 'Excellent', value: 'EXCELLENT' },
						]}
						value={form?.condition}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.warranty}
						label="Warranty"
						name="warranty"
						onChange={onChange}
						placeholder="Warranty"
						type="number"
						value={form?.warranty}
					/>
				</div>
				<div className="w-full">
					<Input
						disabled={loading}
						error={errors?.value}
						label="Asset Value"
						name="value"
						onChange={onChange}
						placeholder="Value"
						type="number"
						value={form?.value}
					/>
				</div>
				<div className="w-full">
					<Select
						btn={{
							caps: true,
							disabled:
								users.isFetching ||
								(users.data && users.data.result.length >= users.data.total),
							onClick: () => {
								if (users.data && users.data.total > users.data.result.length) {
									setUsrLimit(
										(prevState) => prevState + DEFAULT_PAGINATION_SIZE
									);
								}
							},
							title: users.isFetching
								? 'loading...'
								: users.data && users.data.result.length >= users.data.total
								? 'loaded all'
								: 'load more',
						}}
						disabled={users.isLoading || loading}
						error={usersError || errors?.userId}
						label="Asset User"
						name="userId"
						onChange={onChange}
						placeholder="Select Asset User"
						options={
							users.data
								? users.data.result.map((user) => ({
										title: toCapitalize(user.firstName + ' ' + user.lastName),
										value: user.id,
								  }))
								: []
						}
						value={form?.userId}
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Textarea
						disabled={loading}
						error={errors?.description}
						label="Description"
						name="description"
						onChange={onChange}
						placeholder="Description"
						required={false}
						value={form?.description}
					/>
				</div>
				<div className="w-full">
					<Select
						disabled={loading}
						error={errors?.status}
						label="Status"
						name="status"
						placeholder="Select Status"
						onChange={onChange}
						options={[
							{ title: 'Approved', value: 'APPROVED' },
							{ title: 'Denied', value: 'DENIED' },
							{ title: 'Pending', value: 'PENDING' },
							{ title: 'Returned', value: 'RETURNED' },
						]}
						value={form?.status}
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
									? 'Updating Asset...'
									: 'Update Asset'
								: loading
								? 'Creating Asset...'
								: 'Create Asset'
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
