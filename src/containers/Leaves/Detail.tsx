import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
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
	useGetUserObjectPermissionsQuery,
	useApproveLeaveMutation,
	useDeleteLeaveMutation,
	useRequestLeaveUpdateMutation,
} from '../../store/queries';
import {
	CreateLeaveErrorResponseType,
	CreateLeaveQueryType,
	LeaveType,
	UserObjPermType,
} from '../../types';
import {
	getDate,
	getNextDate,
	getNoOfDays,
	hasModelPermission,
	serializeLeave,
} from '../../utils';

type ErrorType = CreateLeaveErrorResponseType & {
	message?: string;
};

const Detail = ({
	admin = false,
	leave,
	objPerm = {
		delete: false,
		edit: false,
		view: false,
	},
}: {
	admin?: boolean;
	leave: LeaveType;
	objPerm?: UserObjPermType;
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [errors, setErrors] = useState<ErrorType>();

	const { data: authData } = useAuthContext();

	const { open } = useAlertContext();

	const {
		data: leaveData,
		error,
		isFetching,
		isLoading,
		refetch,
	} = useGetLeaveQuery(
		{ id, admin },
		{
			initialData() {
				return leave;
			},
		}
	);

	const data = useMemo(() => {
		if (leaveData) return serializeLeave(leaveData);
		return undefined;
	}, [leaveData]);

	// Get user's object level permissions for the users table
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'users',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	const [canEdit, canDelete, canViewPermissions] = useMemo(() => {
		if (!authData) return [false, false, false];
		// Not Admin Page
		// Only check object level permissions
		if (!admin) return [objPermData?.edit, objPermData?.delete, false];
		else {
			let canEdit = false;
			let canDelete = false;
			// Check model permissions
			if (authData.isAdmin || authData.isSuperUser) {
				canEdit =
					authData.isSuperUser ||
					(authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.leave.EDIT,
						])) ||
					false;
			}
			if (authData.isAdmin || authData.isSuperUser) {
				canDelete =
					authData.isSuperUser ||
					(authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.leave.DELETE,
						])) ||
					false;
			}

			// If the user doesn't have model edit permissions, then check obj edit permission
			if (!canEdit && objPermData) canEdit = objPermData.edit;
			if (!canDelete && objPermData) canDelete = objPermData.delete;

			const canViewPermissions =
				authData.isSuperUser ||
				(authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.permissionobject.VIEW,
					])) ||
				false;

			return [canEdit, canDelete, canViewPermissions];
		}
	}, [authData, admin, objPermData]);

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
		admin,
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
			if (canEdit) updateLeave({ id, admin, data: form });
		},
		[canEdit, updateLeave, admin, id]
	);

	const actions = useMemo(() => {
		const buttons: ButtonType[] = [];
		if (!data) return buttons;
		// Regular/normal user page
		if (!admin) {
			const startDate =
				typeof data.startDate === 'string'
					? new Date(data.startDate)
					: data.startDate;
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			// As long as the leave is still pending, the user can edit as he/she likes
			// Also if the startDate has not yet been reached
			if (
				data.status !== 'APPROVED' &&
				data.status !== 'DENIED' &&
				startDate.getTime() >= currentDate.getTime()
			) {
				if (canEdit)
					buttons.push({
						disabled: editLoading,
						iconLeft: FaEdit,
						onClick: () => setModalVisible(true),
						title: 'Request Leave Update',
					});
				if (canDelete)
					buttons.push({
						bg: 'bg-red-600 hover:bg-red-500',
						disabled: appLoading,
						iconLeft: FaTrash,
						onClick: () => deleteLeave(id),
						title: 'Delete Leave',
					});
			}
		} else {
			// Admin user page
			const startDate =
				typeof data.startDate === 'string'
					? new Date(data.startDate)
					: data.startDate;
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			// If the leave start date is today or next date i.e the current date or days after today
			//  and it is still pending then it can be approved/denied and also updated and deleted.
			// Means that the leave has yet to commence.
			// If the user is a superuser, then bypass the restriction
			if (
				authData?.isSuperUser ||
				(currentDate.getTime() <= startDate.getTime() &&
					data.status === 'PENDING')
			) {
				if (canEdit)
					buttons.push({
						disabled: editLoading,
						iconLeft: FaEdit,
						onClick: () => setModalVisible(true),
						title: 'Request Leave Update',
					});
				if (canDelete)
					buttons.push({
						bg: 'bg-red-600 hover:bg-red-500',
						disabled: appLoading,
						iconLeft: FaTrash,
						onClick: () => deleteLeave(id),
						title: 'Delete Leave',
					});
				if (canEdit)
					buttons.push(
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
						}
					);
			}
			// } else if (
			// 	startDate.getTime() >= currentDate.getTime() &&
			// 	(data.status === 'APPROVED') || data.status === 'DENIED'
			// ) {
			// 	// Meaning that the start date for leave is either today or has passed
			// 	// and the leave has either been approved or denied so no updates, deletes, nor approval should be made
			// }
			if (canViewPermissions) {
				buttons.push({
					bg: 'bg-gray-600 hover:bg-gray-500',
					iconLeft: FaUserShield,
					link: ADMIN_LEAVE_OBJECT_PERMISSION_PAGE_URL(id),
					title: 'View Record Permissions',
				});
			}
		}
		return buttons;
	}, [
		admin,
		appLoading,
		approveLeave,
		authData,
		canDelete,
		canEdit,
		canViewPermissions,
		data,
		deleteLeave,
		editLoading,
		id,
	]);

	return (
		<Container
			heading={admin ? 'Leave Information (Admin)' : 'Leave Information'}
			error={
				error
					? {
							statusCode:
								(error as any).response?.status || (error as any).status || 500,
							title:
								(error as any)?.response?.data?.message ||
								(error as any).message,
					  }
					: undefined
			}
			icon
			refresh={{
				loading: isFetching,
				onClick: () => {
					refetch();
					objPermRefetch();
				},
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
												: data.expired
												? 'info'
												: 'warning',
									},
									title: 'Status',
									value:
										data.status === 'PENDING' && data.expired
											? 'EXPIRED'
											: data.status,
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
