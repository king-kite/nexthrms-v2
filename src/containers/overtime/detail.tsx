import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';
import {
	FaCheckCircle,
	FaEdit,
	FaTimesCircle,
	FaTrash,
	FaUserShield,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { Form } from '../../components/overtime';
import {
	ADMIN_OVERTIME_OBJECT_PERMISSION_PAGE_URL,
	DEFAULT_IMAGE,
	permissions,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useGetOvertimeQuery,
	useGetUserObjectPermissionsQuery,
	useApproveOvertimeMutation,
	useDeleteOvertimeMutation,
	useRequestOvertimeUpdateMutation,
} from '../../store/queries';
import {
	CreateOvertimeErrorResponseType,
	CreateOvertimeQueryType,
	OvertimeType,
	UserObjPermType,
} from '../../types';
import { getDate, hasModelPermission, serializeOvertime } from '../../utils';

type ErrorType = CreateOvertimeErrorResponseType & {
	message?: string;
};

const Detail = ({
	admin,
	overtime,
	objPerm = {
		delete: false,
		edit: false,
		view: false,
	},
}: {
	admin?: boolean;
	overtime: OvertimeType;
	objPerm?: UserObjPermType;
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = React.useState(false);
	const [errors, setErrors] = React.useState<ErrorType>();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const {
		data: overtimeData,
		error,
		isFetching,
		isLoading,
		refetch,
	} = useGetOvertimeQuery(
		{ id, admin },
		{
			initialData() {
				return overtime;
			},
		}
	);

	const data = React.useMemo(() => {
		if (overtimeData) return serializeOvertime(overtimeData);
		return undefined;
	}, [overtimeData]);

	// Get user's object level permissions for the overtime table
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'overtime',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	const [canEdit, canDelete, canGrant, canViewPermissions] = React.useMemo(() => {
		if (!authData) return [false, false, false, false];
		// Not Admin Page
		// Only check object level permissions
		if (!admin) return [objPermData?.edit, objPermData?.delete, false, false];
		else {
			let canEdit = false;
			let canDelete = false;
			let canGrant = false;
			// Check model permissions
			if (authData.isAdmin || authData.isSuperUser) {
				canEdit =
					authData.isSuperUser ||
					(authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.overtime.EDIT,
						])) ||
					false;
			}
			if (authData.isAdmin || authData.isSuperUser) {
				canDelete =
					authData.isSuperUser ||
					(authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.overtime.DELETE,
						])) ||
					false;
			}
			if (authData.isAdmin || authData.isSuperUser) {
				canGrant =
					authData.isSuperUser ||
					(authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.overtime.GRANT,
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

			return [canEdit, canDelete, canGrant, canViewPermissions];
		}
	}, [authData, admin, objPermData]);

	const { mutate: approveOvertime, isLoading: appLoading } =
		useApproveOvertimeMutation({
			onRequestComplete({ message, error }) {
				open({
					type: error ? 'danger' : 'success',
					message: error || message,
				});
			},
		});
	const { deleteOvertime } = useDeleteOvertimeMutation({
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
	const { mutate: updateOvertime, isLoading: editLoading } =
		useRequestOvertimeUpdateMutation({
			onSuccess() {
				setModalVisible(false);
				open({
					type: 'success',
					message: 'Overtime request was updated successfully!',
				});
			},
			onError(err) {
				setErrors((prevState) => ({
					...prevState,
					...err,
				}));
			},
		});

	const handleSubmit = React.useCallback(
		(form: CreateOvertimeQueryType) => {
			setErrors(undefined);
			if (canEdit) updateOvertime({ id, admin, data: form });
		},
		[canEdit, updateOvertime, id, admin]
	);

	const actions = React.useMemo(() => {
		const buttons: ButtonType[] = [];
		if (!data) return buttons;
		// Regular/normal user page
		if (!admin) {
			const date =
				typeof data.date === 'string' ? new Date(data.date) : data.date;
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			// As long as the overtime is still pending, the user can edit as he/she likes
			// Also if the date has not yet been reached
			if (
				data.status !== 'APPROVED' &&
				date.getTime() >= currentDate.getTime()
			) {
				if (canEdit)
					buttons.push({
						disabled: editLoading,
						iconLeft: FaEdit,
						onClick: () => setModalVisible(true),
						title: 'Request Update',
					});
				if (canDelete)
					buttons.push({
						bg: 'bg-red-600 hover:bg-red-500',
						disabled: appLoading,
						iconLeft: FaTrash,
						onClick: () => deleteOvertime(id),
						title: 'Delete Overtime',
					});
			}
		} else {
			// Admin user page
			const date =
				typeof data.date === 'string' ? new Date(data.date) : data.date;
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			// If the overtime date is today or next date i.e the current date or days after today
			//  and it is not approved then it can be approved/denied and also updated and deleted.
			// Means that the overtime has yet to commence.
			// If the user is a superuser, then bypass the restriction
			if (
				authData?.isSuperUser ||
				(currentDate.getTime() <= date.getTime() && data.status !== 'APPROVED')
			) {
				if (canEdit)
					buttons.push({
						disabled: editLoading,
						iconLeft: FaEdit,
						onClick: () => setModalVisible(true),
						title: 'Request Update',
					});
				if (canDelete)
					buttons.push({
						bg: 'bg-red-600 hover:bg-red-500',
						disabled: appLoading,
						iconLeft: FaTrash,
						onClick: () => deleteOvertime(id),
						title: 'Delete Overtime',
					});
				if (canGrant)
					buttons.push(
						{
							bg: 'bg-green-600 hover:bg-green-500',
							disabled: appLoading,
							iconLeft: FaCheckCircle,
							onClick: () => approveOvertime({ id, approval: 'APPROVED' }),
							title: 'Approve Overtime',
						},
						{
							bg: 'bg-yellow-600 hover:bg-yellow-500',
							disabled: appLoading,
							iconLeft: FaTimesCircle,
							onClick: () => approveOvertime({ id, approval: 'DENIED' }),
							title: 'Deny Overtime',
						}
					);
			}
			// } else if (
			// 	date.getTime() >= currentDate.getTime() &&
			// 	(data.status === 'APPROVED') || data.status === 'DENIED'
			// ) {
			// 	// Meaning that the date for overtime is either today or has passed
			// 	// and the overtime has either been approved or denied so no updates, deletes, nor approval should be made
			// }
			if (canViewPermissions) {
				buttons.push({
					bg: 'bg-gray-600 hover:bg-gray-500',
					iconLeft: FaUserShield,
					link: ADMIN_OVERTIME_OBJECT_PERMISSION_PAGE_URL(id),
					title: 'View Record Permissions',
				});
			}
		}
		return buttons;
	}, [
		admin,
		appLoading,
		approveOvertime,
		authData,
		canDelete,
		canEdit,
		canGrant,
		canViewPermissions,
		data,
		deleteOvertime,
		editLoading,
		id,
	]);

	return (
		<Container
			heading={admin ? 'Overtime Information (Admin)' : 'Overtime Information'}
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
						image={data.employee.user.profile?.image?.url || DEFAULT_IMAGE}
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
									title: 'Type of Overtime',
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
									title: 'Date',
									value: getDate(data.date, true) as string,
								},
								{
									title: 'Hours',
									value: data.hours,
								},
								{ title: 'Reason For Overtime', value: data.reason },
								{
									title: 'Last Updated',
									value: getDate(data.updatedAt, true) as string,
								},
								{
									title: 'Date Requested',
									value: getDate(data.createdAt, true) as string,
								},
							]}
							title="overtime information"
						/>

						{data.createdBy && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src: data.createdBy.user.profile?.image?.url || DEFAULT_IMAGE,
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
											src: data.approvedBy.user.profile?.image?.url || DEFAULT_IMAGE,
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
						description="Fill in the form below to update overtime request."
						keepVisible
						title="Update overtime request"
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
