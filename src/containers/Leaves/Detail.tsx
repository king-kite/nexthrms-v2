import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import {
	FaCheckCircle,
	FaEdit,
	FaTimesCircle,
	FaTrash,
	FaUserShield,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { Form } from '../../components/Leaves';
import {
	ADMIN_LEAVE_OBJECT_PERMISSION_PAGE_URL,
	DEFAULT_IMAGE,
	permissions,
} from '../../config';
import { useAuthContext, useAlertContext } from '../../store/contexts';
import {
	useGetLeaveQuery,
	useApproveLeaveMutation,
	useDeleteLeaveMutation,
	useRequestLeaveUpdateMutation,
} from '../../store/queries';
import {
	CreateLeaveErrorResponseType,
	CreateLeaveQueryType,
	LeaveType,
} from '../../types';
import { getDate, getNextDate, getNoOfDays, hasPermission } from '../../utils';

type ErrorType = CreateLeaveErrorResponseType & {
	message?: string;
};

const Detail = ({ admin, leave }: { admin?: boolean; leave: LeaveType }) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [errors, setErrors] = useState<ErrorType>();

	const { data: authData } = useAuthContext();

	const canViewPermissions =
		admin && authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasPermission(authData.permissions, [
						permissions.permissionobject.VIEW,
					]))
			: false;

	const { open } = useAlertContext();

	const { data, isFetching, isLoading, refetch } = useGetLeaveQuery(
		{ id, admin },
		{
			initialData() {
				return leave;
			},
		}
	);
	const { mutate: approveLeave, isLoading: appLoading } =
		useApproveLeaveMutation({
			onRequestComplete({ message, error }) {
				open({
					type: error ? 'danger' : 'success',
					message: error || message,
				});
			},
		});
	const { deleteLeave } = useDeleteLeaveMutation({
		onSuccess() {
			router.back();
		},
		onError({ message }) {
			open({
				type: 'danger',
				message,
			});
		},
	});
	const { mutate: updateLeave, isLoading: editLoading } =
		useRequestLeaveUpdateMutation({
			onSuccess() {
				setModalVisible(false);
				open({
					type: 'success',
					message: 'Leave request was updated successfully!',
				});
			},
			onError(err) {
				setErrors((prevState) => ({
					...prevState,
					...err,
				}));
			},
		});

	const handleSubmit = useCallback(
		(form: CreateLeaveQueryType) => {
			setErrors(undefined);
			updateLeave({ id, admin, data: form });
		},
		[updateLeave, admin, id]
	);

	let actions: ButtonType[] = [
		{
			disabled: editLoading,
			iconLeft: FaEdit,
			onClick: () => setModalVisible(true),
			title: 'Request Leave Update',
		},
		{
			bg: 'bg-red-600 hover:bg-red-500',
			disabled: appLoading,
			iconLeft: FaTrash,
			onClick: () => deleteLeave(id),
			title: 'Delete Leave',
		},
	];
	if (admin) {
		actions = [
			...actions,
			{
				bg: 'bg-green-600 hover:bg-green-500',
				disabled: appLoading,
				iconLeft: FaCheckCircle,
				onClick: () => approveLeave({ id, approval: 'APPROVED' }),
				title: 'Approve Leave',
			},
			{
				bg: 'bg-yellow-600 hover:bg-yellow-500',
				disabled: appLoading,
				iconLeft: FaTimesCircle,
				onClick: () => approveLeave({ id, approval: 'DENIED' }),
				title: 'Deny Leave',
			},
		];

		if (canViewPermissions) {
			actions = [
				...actions,
				{
					bg: 'bg-gray-600 hover:bg-gray-500',
					iconLeft: FaUserShield,
					link: ADMIN_LEAVE_OBJECT_PERMISSION_PAGE_URL(id),
					title: 'View Record Permissions',
				},
			];
		}
	}

	return (
		<Container
			heading={admin ? 'Leave Information (Admin)' : 'Leave Information'}
			icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
		>
			{data && (
				<>
					<InfoTopBar
						email={data.employee.user.email}
						full_name={
							data.employee.user.firstName + ' ' + data.employee.user.lastName
						}
						image={data.employee.user.profile?.image || DEFAULT_IMAGE}
						actions={actions}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: data.employee.user.firstName,
								},
								{
									title: 'Last Name',
									value: data.employee.user.lastName,
								},
								{ title: 'E-mail', value: data.employee.user.email },
								{
									title: 'Department',
									value: data.employee.department?.name || '------',
								},
								{ title: 'Job', value: data.employee.job?.name || '------' },
							]}
							title="employee information"
						/>

						<InfoComp
							infos={[
								{
									title: 'Type of Leave',
									value: data.type,
								},
								{
									options: {
										bg:
											data.status === 'APPROVED'
												? 'success'
												: data.status === 'DENIED'
												? 'error'
												: data.status === 'PENDING'
												? 'warning'
												: 'info',
									},
									title: 'Status',
									value: data.status,
									type: 'badge',
								},
								{
									title: 'Start Date',
									value: getDate(data.startDate, true) as string,
								},
								{
									title: 'End Date',
									value: getDate(data.endDate, true) as string,
								},
								{
									title: 'Resumption Date',
									value: getNextDate(data.endDate, 1, true) as string,
								},
								{
									title: 'Number Of Days',
									value: getNoOfDays(data.startDate, data.endDate),
								},
								{ title: 'Reason For Leave', value: data.reason },
								{
									title: 'Last Updated',
									value: getDate(data.updatedAt, true) as string,
								},
								{
									title: 'Date Requested',
									value: getDate(data.createdAt, true) as string,
								},
							]}
							title="leave information"
						/>

						{data.createdBy && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src: data.createdBy.user.profile?.image || DEFAULT_IMAGE,
											alt:
												data.createdBy.user.firstName +
												' ' +
												data.createdBy.user.lastName,
										},
									},
									{
										title: 'First Name',
										value: data.createdBy.user.firstName,
									},
									{
										title: 'Last Name',
										value: data.createdBy.user.lastName,
									},
									{
										title: 'Email',
										value: data.createdBy.user.email,
									},
									{
										title: 'Department',
										value: data.createdBy.department?.name || '-------',
									},
									{
										title: 'Job',
										value: data.createdBy.job?.name || '-------',
									},
								]}
								title="Created By"
							/>
						)}

						{data.approvedBy && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src: data.approvedBy.user.profile?.image || DEFAULT_IMAGE,
											alt:
												data.approvedBy.user.firstName +
												' ' +
												data.approvedBy.user.lastName,
										},
									},
									{
										title: 'First Name',
										value: data.approvedBy.user.firstName,
									},
									{
										title: 'Last Name',
										value: data.approvedBy.user.lastName,
									},
									{
										title: 'Email',
										value: data.approvedBy.user.email,
									},
									{
										title: 'Department',
										value: data.approvedBy.department?.name || '-------',
									},
									{
										title: 'Job',
										value: data.approvedBy.job?.name || '-------',
									},
								]}
								title="Approved/Denied By"
							/>
						)}
					</div>
					<Modal
						close={() => setModalVisible(false)}
						component={
							<Form
								adminView={admin}
								errors={errors}
								initState={data}
								loading={editLoading}
								onSubmit={handleSubmit}
							/>
						}
						description="Fill in the form below to update leave request."
						keepVisible
						title="Update leave request"
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

Detail.defaultProps = {
	admin: false,
};

export default Detail;
