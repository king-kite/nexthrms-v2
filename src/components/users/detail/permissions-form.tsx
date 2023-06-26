import { Alert, Button, Checkbox } from 'kite-react-tailwind';
import React from 'react';

import { useGetPermissionsQuery } from '../../../store/queries';
import { PermissionType } from '../../../types';
import { handleYupErrors } from '../../../validators';
import { updateUserPermissionsSchema } from '../../../validators/users';

type ErrorType = {
	message?: string;
	permissions?: string;
};

type FormProps = {
	initState?: PermissionType[];
	errors?: ErrorType;
	resetErrors: () => void;
	loading: boolean;
	onSubmit: (form: { permissions: string[] }) => void;
};

const Form = ({
	initState,
	errors,
	resetErrors,
	loading,
	onSubmit,
}: FormProps) => {
	const [form, setForm] = React.useState<{
		permissions: string[];
	}>({
		permissions: [],
	});
	const [formErrors, setErrors] = React.useState<ErrorType>();

	const formRef = React.useRef<HTMLFormElement | null>(null);

	const {
		data: permissions = { total: 0, result: [] },
		isLoading: permissionsLoading,
	} = useGetPermissionsQuery({});

	React.useEffect(() => {
		setForm({
			permissions: initState
				? initState.map((permission) => permission.codename)
				: [],
		});
	}, [initState]);

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

	const handleSubmit = React.useCallback(
		async (input: { permissions: string[] }) => {
			try {
				const valid = await updateUserPermissionsSchema.validate(
					{ ...input },
					{ abortEarly: false }
				);
				onSubmit(valid);
			} catch (err) {
				const error = handleYupErrors<{
					permissions?: string;
				}>(err);
				setErrors((prevState) => {
					if (error)
						return {
							...prevState,
							...error,
						};
					return {
						...prevState,
						message: 'Unable to update permissions. Please try again later.',
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

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					handleSubmit({
						permissions: form.permissions,
					});
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
					<p className="mt-1 text-primary-500 text-xs md:text-sm">
						There are no permissions.
					</p>
				)}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={loading}
						title={loading ? 'Updating Permission...' : 'Update Permission'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

export default Form;
