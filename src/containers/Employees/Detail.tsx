import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
	FaLock,
	FaUser,
	FaUserEdit,
	FaUserCheck,
	FaUserShield,
	FaUserSlash,
	FaTrash,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { ChangePasswordForm, EmployeeForm } from '../../components/Employees';
import {
	permissions,
	DEFAULT_IMAGE,
	EMPLOYEE_OBJECT_PERMISSIONS_PAGE_URL,
	USER_PAGE_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useActivateUserMutation,
	useDeleteEmployeeMutation,
	useGetEmployeeQuery,
	useGetUserObjectPermissionsQuery,
} from '../../store/queries';
import { EmployeeType, UserObjPermType } from '../../types';
import { hasModelPermission, getDate, toCapitalize } from '../../utils';

const Employee = ({
	employee,
	objPerm,
	objUserPerm,
}: {
	employee: EmployeeType;
	objPerm: UserObjPermType;
	objUserPerm: UserObjPermType;
}) => {
	const router = useRouter();
	const id = router.query.id as string;
	const { data, error, isLoading, isFetching, refetch } = useGetEmployeeQuery(
		{
			id,
		},
		{
			initialData() {
				return employee;
			},
		}
	);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [formType, setFormType] = useState<'employee' | 'password'>('employee');
	const [modalVisible, setModalVisible] = useState(false);

	const { data: objPermData, isLoading: permLoading } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'employees',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	const { deleteEmployee, isLoading: delLoading } = useDeleteEmployeeMutation({
		onSuccess() {
			router.back();
			showAlert({
				type: 'success',
				message: 'Employee was deleted successfully!',
			});
		},
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
			setModalVisible(false);
		},
	});

	const { activate, isLoading: actLoading } = useActivateUserMutation({
		label: 'employee',
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
		},
	});

	// check if the user has edit user permission
	const { data: objUserPermData } = useGetUserObjectPermissionsQuery(
		{
			modelName: 'users',
			objectId: data?.user.id || '',
		},
		{
			enabled: data && !!data.user.id,
			initialData() {
				return objUserPerm;
			},
		}
	);

	const [canEditUser, canViewUser] = useMemo(() => {
		let canEdit = false;
		let canView = false;

		// Check model permissions
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canEdit =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.user.EDIT]));
		}
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canView =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.user.VIEW]));
		}

		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canEdit && objUserPermData) canEdit = objUserPermData.edit;
		if (!canView && objUserPermData) canView = objUserPermData.view;

		return [canEdit, canView];
	}, [authData, objUserPermData]);

	const actions: ButtonType[] = useMemo(() => {
		if (!data || !authData) return [];
		const buttons: ButtonType[] = [];
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.employee.EDIT]) ||
			(!permLoading && objPermData && objPermData.edit);
		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.employee.DELETE]) ||
			(!permLoading && objPermData && objPermData.delete);
		const canViewObjectPermissions =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [
					permissions.permissionobject.VIEW,
				]));

		if (canViewUser)
			buttons.push({
				bg: 'bg-green-600 hover:bg-green-500',
				iconLeft: FaUser,
				link: USER_PAGE_URL(data.user.id),
				title: 'User Information',
			});
		if (canEdit)
			buttons.push({
				onClick: () => {
					formType !== 'employee' && setFormType('employee');
					setModalVisible(true);
				},
				disabled: actLoading || delLoading,
				iconLeft: FaUserEdit,
				title: 'Edit Employee',
			});
		if (canEditUser)
			buttons.push(
				{
					bg: 'bg-yellow-600 hover:bg-yellow-500',
					iconLeft: FaLock,
					disabled: actLoading || delLoading,
					onClick: () => {
						formType !== 'password' && setFormType('password');
						setModalVisible(true);
					},
					title: 'Change Password',
				},
				{
					bg: data.user.isActive
						? 'bg-gray-500 hover:bg-gray-600'
						: 'bg-green-500 hover:bg-green-600',
					disabled: actLoading || delLoading,
					onClick: () =>
						data?.user.email && data.user.isActive !== undefined
							? activate(
									[data.user.email],
									data.user.isActive ? 'deactivate' : 'activate'
							  )
							: undefined,
					iconLeft: data.user.isActive ? FaUserSlash : FaUserCheck,
					title: data.user.isActive
						? actLoading
							? 'Deactivating Employee...'
							: 'Deactivate Employee'
						: actLoading
						? 'Activating Employee...'
						: 'Activate Employee',
				}
			);
		if (canDelete)
			buttons.push({
				bg: 'bg-red-600 hover:bg-red-500',
				iconLeft: FaTrash,
				disabled: actLoading || delLoading,
				onClick: () => deleteEmployee(data.id),
				title: delLoading ? 'Deleting Employee...' : 'Delete Employee',
			});
		if (canViewObjectPermissions)
			buttons.push({
				bg: 'bg-gray-600 hover:bg-gray-500',
				iconLeft: FaUserShield,
				link: EMPLOYEE_OBJECT_PERMISSIONS_PAGE_URL(id),
				title: 'View Record Permissions',
			});
		return buttons;
	}, [
		activate,
		authData,
		data,
		deleteEmployee,
		canEditUser,
		canViewUser,
		actLoading,
		delLoading,
		formType,
		permLoading,
		objPermData,
		id,
	]);

	return (
		<Container
			heading="Employee Information"
			error={
				error
					? {
							statusCode: (error as any).status || 500,
							title: (error as any).message,
					  }
					: undefined
			}
			icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
			title={data ? data.user.firstName + ' ' + data.user.lastName : undefined}
		>
			{data && (
				<>
					<InfoTopBar
						email={data?.user.email}
						full_name={toCapitalize(
							data.user.firstName + ' ' + data.user.lastName
						)}
						image={data.user.profile?.image || DEFAULT_IMAGE}
						actions={actions}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: toCapitalize(data.user.firstName || ''),
								},
								{
									title: 'Last Name',
									value: toCapitalize(data.user.lastName || ''),
								},
								{ title: 'E-mail', value: data.user.email || '' },
								{
									title: 'Birthday',
									value: data.user.profile?.dob
										? (getDate(data.user.profile?.dob, true) as string)
										: '---',
								},
								{
									title: 'Gender',
									value: toCapitalize(data.user.profile?.gender || ''),
								},
								{
									title: 'Status',
									value:
										data.leaves.length > 0
											? 'ON LEAVE'
											: data.user.isActive
											? 'ACTIVE'
											: 'INACTIVE',
									type: 'badge',
									options: {
										bg:
											data.leaves.length > 0
												? 'warning'
												: data.user.isActive
												? 'green'
												: 'danger',
									},
								},
							]}
							title="personal information"
						/>

						<InfoComp
							infos={[
								{ title: 'E-mail', value: data.user.email || '' },
								{ title: 'Mobile', value: data.user.profile?.phone || '' },
								{ title: 'Address', value: data.user.profile?.address || '' },
								{
									title: 'State',
									value: toCapitalize(data.user.profile?.state || ''),
								},
								{
									title: 'City',
									value: toCapitalize(data.user.profile?.city || ''),
								},
							]}
							title="contact information"
						/>

						<InfoComp
							infos={[
								{
									title: 'Job Title',
									value: data.job ? toCapitalize(data.job.name) : '------',
								},
								{
									title: 'Department',
									value: data?.department
										? toCapitalize(data.department.name)
										: '-------',
								},
								{
									title: 'Current Leave Date',
									value:
										data.leaves.length > 0
											? `${(
													getDate(
														data.leaves[data.leaves.length - 1].startDate
													) as Date
											  ).toDateString()} --- ${(
													getDate(
														data.leaves[data.leaves.length - 1].endDate
													) as Date
											  ).toDateString()}`
											: '-------',
								},
								{
									title: 'Length Of Leave',
									value:
										data.leaves.length > 0
											? (new Date(
													data.leaves[data.leaves.length - 1].endDate
											  ).getTime() -
													new Date(
														data.leaves[data.leaves.length - 1].startDate
													).getTime()) /
											  (24 * 60 * 60 * 1000)
											: '-------',
								},
								{
									title: 'Date Employed',
									value: data?.dateEmployed
										? (getDate(data.dateEmployed, true) as string)
										: '----',
								},
							]}
							title="Additional information"
						/>

						{data?.supervisor && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src: data.supervisor.user.profile?.image || DEFAULT_IMAGE,
											alt:
												data.supervisor.user.firstName +
												' ' +
												data.supervisor.user.lastName,
										},
									},
									{
										title: 'First Name',
										value: data.supervisor.user.firstName || '-------',
									},
									{
										title: 'Last Name',
										value: data.supervisor.user.lastName || '-------',
									},
									{
										title: 'Email',
										value: data.supervisor.user.email || '-------',
									},
									{
										title: 'Department',
										value: data.supervisor.department?.name || '-------',
									},
								]}
								title="Supervisor Information"
							/>
						)}

						{data?.department?.hod && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src:
												data.department.hod.user.profile?.image ||
												DEFAULT_IMAGE,
											alt:
												data.department.hod.user.firstName +
												' ' +
												data.department.hod.user.lastName,
										},
									},
									{
										title: 'First Name',
										value: data.department.hod.user.firstName,
									},
									{
										title: 'Last Name',
										value: data.department.hod.user.lastName,
									},
									{
										title: 'Email',
										value: data.department.hod.user.email,
									},
								]}
								title="Head of Department Information"
							/>
						)}
					</div>

					<Modal
						close={() => setModalVisible(false)}
						component={
							formType === 'employee' ? (
								<EmployeeForm
									employee={data}
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'Employee updated successfully!',
										});
									}}
								/>
							) : formType === 'password' ? (
								<ChangePasswordForm
									email={data.user?.email}
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'Password change successfully!',
										});
									}}
								/>
							) : (
								<></>
							)
						}
						description={
							formType === 'password'
								? 'Fill the form to change employee password'
								: 'Fill in the form to update employee information'
						}
						keepVisible
						title={
							formType === 'password'
								? 'Change Employee Password'
								: 'Update Employee Information'
						}
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

export default Employee;
