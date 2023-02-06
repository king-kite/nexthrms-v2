import {
	Alert,
	Button,
	Checkbox,
	Input,
	Select,
	Textarea,
} from 'kite-react-tailwind';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useGetPermissionsQuery, useGetUsersQuery } from '../../store/queries';

import {
	CreateGroupQueryType,
	CreateGroupErrorResponseType,
	GroupType,
} from '../../types';
import { toCapitalize } from '../../utils';
import {
	createGroupSchema,
	handleAxiosErrors,
	handleJoiErrors,
} from '../../validators';

interface ErrorType extends CreateGroupErrorResponseType {
	message?: string;
}

type FormProps = {
	initState?: GroupType;
	editMode?: boolean;
	errors?: ErrorType;
	resetErrors: () => void;
	loading: boolean;
	success?: boolean;
	onSubmit: (form: CreateGroupQueryType) => void;
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
	initState,
	errors,
	resetErrors,
	loading,
	success,
	onSubmit,
}) => {
	const [usrLimit, setUsrLimit] = useState(DEFAULT_PAGINATION_SIZE);

	const formStaleData = useMemo(
		() => ({
			users: initState ? initState.users.map((user) => user.id) : [],
			permissions: initState
				? initState.permissions.map((permission) => permission.codename)
				: [],
		}),
		[initState]
	);

	const [form, setForm] = useState(formStaleData);
	const [formErrors, setErrors] = useState<ErrorType>();

	const formRef = useRef<HTMLFormElement | null>(null);

	const {
		data: permissions = { total: 0, result: [] },
		isLoading: permissionsLoading,
	} = useGetPermissionsQuery({});
	const users = useGetUsersQuery({
		limit: usrLimit,
		offset: 0,
		search: '',
	});

	const usersError = handleDataError(users.error);

	const handleSubmit = useCallback(
		async (input: CreateGroupQueryType) => {
			try {
				const valid: CreateGroupQueryType =
					await createGroupSchema.validateAsync({ ...input });
				onSubmit(valid);
			} catch (err) {
				const error = handleJoiErrors<CreateGroupErrorResponseType>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					return {
						...prevState,
						message: 'Unable to create group. Please try again later.',
					};
				});
			}
		},
		[onSubmit]
	);

	const removeFormErrors = useCallback(
		(name: string) => {
			if (Object(formErrors)[name]) {
				setErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
			}
		},
		[formErrors]
	);

	const handleFormChange = useCallback(
		(name: string, value: string | string[]) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
			removeFormErrors(name);
		},
		[removeFormErrors]
	);

	useEffect(() => {
		if (success && !editMode) {
			setForm(formStaleData);
			if (formRef.current) {
				formRef.current.reset();
			}
		}
	}, [formStaleData, success, editMode]);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					const data: CreateGroupQueryType = {
						name: formRef.current.groupName.value,
						description: formRef.current.description.value,
						active: formRef.current.active.checked,
						users: form.users,
						permissions: form.permissions,
					};

					handleSubmit(data);
				}
			}}
			className="p-4"
		>
			{(formErrors?.message || errors?.message) && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={formErrors?.message || errors?.message}
						onClose={() => {
							if (errors?.message) resetErrors();
							else if (formErrors?.message) removeFormErrors('message');
						}}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:gap-4 md:grid-cols-2 lg:gap-6">
				<div className="w-full md:col-span-2">
					<Input
						defaultValue={initState?.name}
						disabled={loading}
						error={formErrors?.name || errors?.name}
						label="Group Name"
						name="groupName"
						onChange={() => removeFormErrors('name')}
						placeholder="Group Name"
					/>
				</div>
				<div className="w-full md:col-span-2">
					<Textarea
						defaultValue={initState?.description || undefined}
						disabled={loading}
						error={formErrors?.description || errors?.description || ''}
						label="Group Description"
						name="description"
						onChange={() => removeFormErrors('description')}
						placeholder="Group Description"
					/>
				</div>
				<div className="w-full md:col-span-2">
					<div className="max-w-[12rem]">
						<Checkbox
							defaultChecked={initState?.active || !editMode}
							error={formErrors?.active || errors?.active}
							onChange={() => removeFormErrors('active')}
							label="is Active?"
							labelColor="text-gray-500"
							labelSize="text-sm tracking-wider md:text-base"
							name="active"
							between
							reverse
							required={false}
							textSize="text-sm md:text-base"
						/>
					</div>
				</div>
				<div className="w-full md:flex md:flex-col md:justify-end md:col-span-2">
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
						error={usersError || formErrors?.users || errors?.users}
						label="Users"
						onChange={({ target: { selectedOptions } }) => {
							const selectValues = Array.from(
								selectedOptions,
								(option) => option.value
							);
							handleFormChange('users', selectValues);
						}}
						multiple
						name="users"
						placeholder="Select Users"
						options={
							users.data
								? users.data.result.reduce(
										(
											total: {
												title: string;
												value: string;
											}[],
											user
										) => {
											if (user.isActive)
												return [
													...total,
													{
														title: toCapitalize(
															user.firstName + ' ' + user.lastName
														),
														value: user.id,
													},
												];
											return total;
										},
										[]
								  )
								: []
						}
						required={false}
						value={form.users}
					/>
				</div>

				<h4 className="uppercase font-semibold text-primary-500 text-sm w-full md:col-span-2 md:text-base lg:text-lg">
					Permissions
				</h4>
				{errors?.permissions && (
					<p className="mt-1 text-red-500 text-xs md:text-sm">
						{errors.permissions}
					</p>
				)}

				{!permissionsLoading && permissions.result.length > 0 && (
					<div className="w-full md:col-span-2">
						<div className="w-full max-w-[12rem]">
							<Checkbox
								checked={form.permissions.length === permissions.result.length}
								label="Select All"
								labelColor="text-gray-500"
								labelSize="text-sm tracking-wider md:text-base"
								onChange={({ target: { checked } }) => {
									if (checked) {
										handleFormChange(
											'permissions',
											permissions.result.map(
												(permission) => permission.codename
											)
										);
									} else {
										handleFormChange('permissions', []);
									}
								}}
								between
								reverse
								required={false}
								textSize="text-sm md:text-base"
							/>
						</div>
					</div>
				)}

				{permissionsLoading ? (
					<p className="mt-1 text-primary-500 text-xs md:text-sm">
						Loading permissions...
					</p>
				) : permissions.result.length > 0 ? (
					permissions.result.map((permission, index) => (
						<div key={index} className="w-full">
							<div className="w-full">
								<Checkbox
									checked={
										!!form.permissions.find(
											(codename) => codename === permission.codename
										)
									}
									label={permission.name}
									labelColor="text-gray-500"
									labelSize="text-sm tracking-wider md:text-base"
									name={permission.codename}
									onChange={({ target: { checked } }) => {
										if (checked) {
											const exists = form.permissions.find(
												(codename) => codename === permission.codename
											);
											if (!exists) {
												handleFormChange('permissions', [
													...form.permissions,
													permission.codename,
												]);
											}
										} else {
											const newPermissions = form.permissions.filter(
												(codename) => codename !== permission.codename
											);
											handleFormChange('permissions', newPermissions);
										}
									}}
									between
									reverse
									required={false}
									textSize="text-sm md:text-base"
								/>
							</div>
						</div>
					))
				) : (
					<p className="mt-1 text-primary-500 text-xs md:text-sm">
						There are no permissions.
					</p>
				)}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={
							editMode
								? loading
									? 'Updating Group...'
									: 'Update Group'
								: loading
								? 'Creating Group...'
								: 'Create Group'
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
