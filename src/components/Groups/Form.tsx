import {
	Alert,
	Button,
	Checkbox,
	Input,
	Select,
	Select2,
	Textarea,
} from 'kite-react-tailwind';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, DEFAULT_IMAGE } from '../../config';
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

const Form = ({
	editMode,
	initState,
	errors,
	resetErrors,
	loading,
	success,
	onSubmit,
}: FormProps) => {
	const [usrLimit, setUsrLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const formStaleData = React.useMemo(
		() => ({
			users: initState ? initState.users.map((user) => user.id) : [],
			permissions: initState
				? initState.permissions.map((permission) => permission.codename)
				: [],
		}),
		[initState]
	);

	const [form, setForm] = React.useState(formStaleData);
	const [formErrors, setErrors] = React.useState<ErrorType>();

	const formRef = React.useRef<HTMLFormElement | null>(null);

	const {
		data: permissions = { total: 0, result: [] },
		isLoading: permissionsLoading,
	} = useGetPermissionsQuery({});
	const users = useGetUsersQuery({
		limit: usrLimit,
		offset: 0,
		search: '',
	});

	const sortedPermissions = React.useMemo(() => {
		if (permissions.result.length <= 0) return [];
		// Get the names of all permission categories and sort it;
		let categoryNames: string[] = [];
		permissions.result.forEach((permission) => {
			const categoryName = permission.category
				? permission.category.name.toLowerCase()
				: 'anonymous';
			if (!categoryNames.includes(categoryName.toLowerCase())) {
				categoryNames.push(categoryName.toLowerCase());
			}
		});
		categoryNames = categoryNames.sort();

		// Sort permissions according to their category if they have one!
		const sortedPermissions = categoryNames.map((category) => {
			const categoryPermissions = permissions.result.filter((permission) => {
				if (!permission.category && category === 'anonymous') return permission;
				return (
					permission.category &&
					permission.category.name.toLowerCase() === category
				);
			});
			return { category, permissions: categoryPermissions };
		}, []);

		return sortedPermissions;
	}, [permissions]);

	const usersError = handleDataError(users.error);

	const handleSubmit = React.useCallback(
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

	const removeFormErrors = React.useCallback(
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

	const handleFormChange = React.useCallback(
		(name: string, value: string | string[]) => {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
			removeFormErrors(name);
		},
		[removeFormErrors]
	);

	React.useEffect(() => {
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
					<Select2
						bdrColor={
							usersError || formErrors?.users || errors?.users
								? 'border-red-600'
								: 'border-gray-300'
						}
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
						onSelect={({ value }) => {
							let users: string[] = [];
							// Check if the employee with this value as id is selected
							const selected = form.users.find((item) => item === value);
							if (selected) {
								users = form.users.filter((item) => item !== value);
							} else {
								users = [...form.users, value];
							}
							handleFormChange('users', users);
						}}
						error={usersError || formErrors?.users || errors?.users}
						options={
							users.data
								? users.data.result
										.reduce(
											(
												total: {
													image: string;
													title: string;
													value: string;
												}[],
												user
											) => {
												return [
													...total,
													{
														image: user.profile?.image || DEFAULT_IMAGE,
														title: toCapitalize(
															user.firstName + ' ' + user.lastName
														),
														value: user.id,
													},
												];
											},
											[]
										)
										.sort((a, b) => {
											const aName = a.title.toLowerCase();
											const bName = b.title.toLowerCase();
											return aName < bName ? -1 : aName > bName ? 1 : 0;
										})
								: []
						}
						multiple
						value={form.users}
						required={false}
						label="Users"
						placeholder="Select Users"
						shadow="shadow-lg"
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
				) : sortedPermissions.length > 0 ? (
					sortedPermissions.map(({ category, permissions }, index) => (
						<div key={index} className="w-full md:col-span-2">
							<h4 className="capitalize font-bold mb-3 text-base text-primary-600 w-full md:text-lg">
								{category}
							</h4>
							<div className="gap-4 grid grid-cols-1 md:grid-cols-2">
								{permissions.map((permission, index) => (
									<div key={index} className="w-full">
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
											required={false}
											textSize="text-sm md:text-base"
										/>
									</div>
								))}
							</div>
							{index + 1 !== sortedPermissions.length && (
								<hr className="mt-5" />
							)}
						</div>
					))
				) : (
					// permissions.result.map((permission, index) => (
					// 	<div key={index} className="w-full">
					// 		<div className="w-full">
					// 			<Checkbox
					// 				checked={
					// 					!!form.permissions.find(
					// 						(codename) => codename === permission.codename
					// 					)
					// 				}
					// 				label={permission.name}
					// 				labelColor="text-gray-500"
					// 				labelSize="text-sm tracking-wider md:text-base"
					// 				name={permission.codename}
					// 				onChange={({ target: { checked } }) => {
					// 					if (checked) {
					// 						const exists = form.permissions.find(
					// 							(codename) => codename === permission.codename
					// 						);
					// 						if (!exists) {
					// 							handleFormChange('permissions', [
					// 								...form.permissions,
					// 								permission.codename,
					// 							]);
					// 						}
					// 					} else {
					// 						const newPermissions = form.permissions.filter(
					// 							(codename) => codename !== permission.codename
					// 						);
					// 						handleFormChange('permissions', newPermissions);
					// 					}
					// 				}}
					// 				between
					// 				reverse
					// 				required={false}
					// 				textSize="text-sm md:text-base"
					// 			/>
					// 		</div>
					// 	</div>
					// ))
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
