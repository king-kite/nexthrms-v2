import { InfoComp } from '@king-kite/react-kit';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
	FaLock,
	FaUserEdit,
	FaUserCheck,
	FaUserSlash,
	FaTrash,
} from 'react-icons/fa';

import { ChangePasswordForm, EmployeeForm } from '../../components/Employees';
import { Container, InfoTopBar, Modal } from '../../components/common';
import { DEFAULT_IMAGE } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useGetEmployeeQuery,
	useActivateUserMutation,
	useDeleteEmployeeMutation,
} from '../../store/queries';
import { EmployeeType } from '../../types';
import { getDate, toCapitalize } from '../../utils';

const Employee = ({ employee }: { employee: EmployeeType }) => {
	const router = useRouter();
	const id = router.query.id as string;
	const { data, isLoading, isFetching, refetch } = useGetEmployeeQuery(
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

	const [formType, setFormType] = useState<'employee' | 'password'>('employee');
	const [modalVisible, setModalVisible] = useState(false);

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

	return (
		<Container
			heading="Employee Information"
			icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
			disabledLoading={!isLoading && isFetching}
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
						actions={[
							{
								onClick: () => {
									formType !== 'employee' && setFormType('employee');
									setModalVisible(true);
								},
								disabled: actLoading || delLoading,
								iconLeft: FaUserEdit,
								title: 'Edit Employee',
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
							},
							{
								bg: 'bg-red-600 hover:bg-red-500',
								iconLeft: FaTrash,
								disabled: actLoading || delLoading,
								onClick: () => deleteEmployee(data.id),
								title: delLoading ? 'Deleting Employee...' : 'Delete Employee',
							},
						]}
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
										data.leaves.length > 1
											? 'ON LEAVE'
											: data.user.isActive
											? 'ACTIVE'
											: 'INACTIVE',
									type: 'badge',
									options: {
										bg:
											data.leaves.length > 1
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
									title: 'HOD',
									value: data.department?.hod
										? data.department.hod.user.firstName +
										  ' ' +
										  data.department.hod.user.lastName
										: '------',
								},
								{
									title: "HOD's Profile Image",
									type: data.department?.hod ? 'image' : undefined,
									value: data.department?.hod
										? {
												src:
													data.department.hod?.user.profile?.image ||
													DEFAULT_IMAGE,
												alt: 'HOD Image',
										  }
										: '-------',
								},
								{
									title: 'Last Leave Date',
									value:
										data.leaves.length > 1
											? `${getDate(
													data.leaves[data.leaves.length - 1].startDate,
													true
											  )} - ${getDate(
													data.leaves[data.leaves.length - 1].endDate,
													true
											  )}`
											: '-------',
								},
								{
									title: 'Length Of Leave',
									value:
										data.leaves.length > 1
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
