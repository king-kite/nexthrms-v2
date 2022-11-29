import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
	FaEye,
	FaLock,
	FaUserEdit,
	FaUserCheck,
	FaUserSlash,
	FaTrash,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { ChangePasswordForm } from '../../components/Employees';
import { UserForm } from '../../components/Users';
import {
	CLIENT_PAGE_URL,
	DEFAULT_IMAGE,
	EMPLOYEE_PAGE_URL,
} from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useGetUserQuery,
	useActivateUserMutation,
	useDeleteUserMutation,
} from '../../store/queries';
import { UserType } from '../../types';
import { getDate, toCapitalize } from '../../utils';

const User = ({ user }: { user: UserType }) => {
	const router = useRouter();
	const id = router.query.id as string;
	const { data, isLoading, isFetching, refetch } = useGetUserQuery(
		{
			id,
		},
		{
			initialData() {
				return user;
			},
		}
	);

	const { open: showAlert } = useAlertContext();

	const [formType, setFormType] = useState<'user' | 'password'>('user');
	const [modalVisible, setModalVisible] = useState(false);

	const { deleteUser, isLoading: delLoading } = useDeleteUserMutation({
		onSuccess() {
			router.back();
			showAlert({
				type: 'success',
				message: 'User was deleted successfully!',
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
		label: 'user',
		onError(err) {
			showAlert({
				type: 'danger',
				message: err.message,
			});
		},
	});

	const actions = useMemo(() => {
		let action: ButtonType[] = [
			{
				onClick: () => {
					formType !== 'user' && setFormType('user');
					setModalVisible(true);
				},
				disabled: actLoading || delLoading,
				iconLeft: FaUserEdit,
				title: 'Edit User',
			},
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
				bg: data?.isActive
					? 'bg-gray-500 hover:bg-gray-600'
					: 'bg-green-500 hover:bg-green-600',
				disabled: actLoading || delLoading,
				onClick: () =>
					data?.email && data?.isActive !== undefined
						? activate([data.email], data.isActive ? 'deactivate' : 'activate')
						: undefined,
				iconLeft: data?.isActive ? FaUserSlash : FaUserCheck,
				title: data?.isActive
					? actLoading
						? 'Deactivating User...'
						: 'Deactivate User'
					: actLoading
					? 'Activating User...'
					: 'Activate User',
			},
			{
				bg: 'bg-red-600 hover:bg-red-500',
				iconLeft: FaTrash,
				disabled: actLoading || delLoading,
				onClick: data?.id ? () => deleteUser(data.id) : undefined,
				title: delLoading ? 'Deleting User...' : 'Delete User',
			},
		];
		if (data?.client) {
			action = [
				{
					bg: 'bg-green-600 hover:bg-green-500',
					iconLeft: FaEye,
					link: CLIENT_PAGE_URL(data.client.id),
					title: 'View Client Data',
				},
				...action,
			];
		}
		if (data?.employee) {
			action = [
				{
					bg: 'bg-purple-600 hover:bg-purple-500',
					iconLeft: FaEye,
					link: EMPLOYEE_PAGE_URL(data.employee.id),
					title: 'View Employee Data',
				},
				...action,
			];
		}
		return action;
	}, [actLoading, activate, data, delLoading, deleteUser, formType]);

	return (
		<Container
			heading="User Information"
			icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
			title={data ? data.firstName + ' ' + data.lastName : undefined}
		>
			{data && (
				<>
					<InfoTopBar
						email={data.email}
						full_name={toCapitalize(data.firstName + ' ' + data.lastName)}
						image={data.profile?.image || DEFAULT_IMAGE}
						actions={actions}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: toCapitalize(data.firstName || ''),
								},
								{
									title: 'Last Name',
									value: toCapitalize(data.lastName || ''),
								},
								{ title: 'E-mail', value: data.email || '' },
								{
									title: 'Birthday',
									value: data.profile?.dob
										? (getDate(data.profile?.dob, true) as string)
										: '---',
								},
								{
									title: 'Gender',
									value: toCapitalize(data.profile?.gender || ''),
								},
								{
									title: 'Status',
									value:
										data.employee?.leaves.length &&
										data.employee?.leaves.length > 0
											? 'ON LEAVE'
											: data.isActive
											? 'ACTIVE'
											: 'INACTIVE',
									type: 'badge',
									options: {
										bg:
											data.employee?.leaves.length &&
											data.employee?.leaves.length > 0
												? 'warning'
												: data.isActive
												? 'green'
												: 'danger',
									},
								},
							]}
							title="personal information"
						/>

						<InfoComp
							infos={[
								{ title: 'E-mail', value: data.email || '' },
								{ title: 'Mobile', value: data.profile?.phone || '' },
								{ title: 'Address', value: data.profile?.address || '' },
								{
									title: 'State',
									value: toCapitalize(data.profile?.state || ''),
								},
								{
									title: 'City',
									value: toCapitalize(data.profile?.city || ''),
								},
							]}
							title="contact information"
						/>

						<InfoComp
							infos={[
								{
									title: 'Is Email Verified?',
									value: data.isEmailVerified ? 'YES' : 'NO',
									type: 'badge',
									options: {
										bg: data.isEmailVerified ? 'green' : 'danger',
									},
								},
								{
									title: 'Is Admin User?',
									value: data.isAdmin ? 'YES' : 'NO',
									type: 'badge',
									options: {
										bg: data.isAdmin ? 'green' : 'danger',
									},
								},
								{
									title: 'Is Super User?',
									value: data.isSuperUser ? 'YES' : 'NO',
									type: 'badge',
									options: {
										bg: data.isSuperUser ? 'green' : 'danger',
									},
								},
								{
									options: {
										bg:
											user.employee && user.client
												? 'secondary'
												: user.client
												? 'pacify'
												: 'danger',
										color:
											user.employee && !user.client
												? 'bg-purple-600'
												: undefined,
									},
									title: 'Role',
									type: 'badge',
									value:
										user.employee && user.client
											? 'CLIENT & EMPLOYEE'
											: user.client
											? 'CLIENT'
											: user.employee
											? 'EMPLOYEE'
											: 'USER',
								},
								{
									title: 'Last Update',
									value: data.updatedAt
										? (getDate(data.updatedAt, true) as string)
										: '---',
								},
								{
									title: 'Date Joined',
									value: data.createdAt
										? (getDate(data.createdAt, true) as string)
										: '---',
								},
							]}
							title="Additional information"
						/>
					</div>

					<Modal
						close={() => setModalVisible(false)}
						component={
							formType === 'user' ? (
								<UserForm
									user={data}
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'User updated successfully!',
										});
									}}
								/>
							) : formType === 'password' ? (
								<ChangePasswordForm
									email={data.email}
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
								? 'Fill the form to change user password'
								: 'Fill in the form to update user information'
						}
						keepVisible
						title={
							formType === 'password'
								? 'Change User Password'
								: 'Update User Information'
						}
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

export default User;
