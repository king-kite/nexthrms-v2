import { Button, ButtonType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
	FaCheckCircle,
	FaEdit,
	FaTimesCircle,
	FaTrash,
	FaUserShield,
} from 'react-icons/fa';

import Form from './form';
import Modal from '../common/modal';
import permissions from '../../config/permissions';
import { ADMIN_LEAVE_OBJECT_PERMISSION_PAGE_URL } from '../../config/routes';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useApproveLeaveMutation,
	useDeleteLeaveMutation,
	useRequestLeaveUpdateMutation,
} from '../../store/queries/leaves';
import { useGetUserObjectPermissionsQuery } from '../../store/queries/permissions';
import {
	CreateLeaveErrorResponseType,
	CreateLeaveQueryType,
	LeaveType,
	UserObjPermType,
} from '../../types';
import { hasModelPermission } from '../../utils/permission';

type ErrorType = CreateLeaveErrorResponseType & {
	message?: string;
};

type DetailActionsProps = {
	admin: boolean;
	data?: LeaveType;
	objPerm: UserObjPermType;
	forwardedRef: {
		ref: React.ForwardedRef<DetailActionsRef>;
	};
};

type DetailActionsRef = {
	refreshPerm?: () => void;
} | null;

function DetailActions({
	admin,
	data,
	objPerm,
	forwardedRef,
}: DetailActionsProps) {
	const [modalVisible, setModalVisible] = React.useState(false);
	const [errors, setErrors] = React.useState<ErrorType>();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const router = useRouter();
	const id = React.useMemo(() => router.query.id as string, [router]);

	// Get user's object level permissions for the leaves table
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'leaves',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	React.useImperativeHandle(
		forwardedRef.ref,
		() => ({
			refreshPerm: objPermRefetch,
		}),
		[objPermRefetch]
	);

	const [canEdit, canDelete, canGrant, canViewPermissions] =
		React.useMemo(() => {
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
				if (authData.isAdmin || authData.isSuperUser) {
					canGrant =
						authData.isSuperUser ||
						(authData.isAdmin &&
							hasModelPermission(authData.permissions, [
								permissions.leave.GRANT,
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

	const handleSubmit = React.useCallback(
		(form: CreateLeaveQueryType) => {
			setErrors(undefined);
			if (canEdit) updateLeave({ id, admin, data: form });
		},
		[canEdit, updateLeave, admin, id]
	);

	const actions = React.useMemo(() => {
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
				if (canGrant) {
					if (data.status === 'APPROVED') {
						buttons.push({
							bg: 'bg-yellow-600 hover:bg-yellow-500',
							disabled: appLoading,
							iconLeft: FaTimesCircle,
							onClick: () => approveLeave({ id, approval: 'DENIED' }),
							title: 'Deny Leave',
						});
					} else if (data.status === 'DENIED') {
						buttons.push({
							bg: 'bg-green-600 hover:bg-green-500',
							disabled: appLoading,
							iconLeft: FaCheckCircle,
							onClick: () => approveLeave({ id, approval: 'APPROVED' }),
							title: 'Approve Leave',
						});
					} else
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
		canGrant,
		canViewPermissions,
		data,
		deleteLeave,
		editLoading,
		id,
	]);

	return (
		<>
			<div className="flex flex-wrap p-4 w-full md:h-1/2 md:mt-auto md:pb-0 md:w-2/3">
				{actions.map((action, index) => (
					<div key={index} className="my-2 w-full sm:my-4 sm:px-4 sm:w-1/2">
						<Button
							{...action}
							renderLinkAs={({ children, link, ...props }) => (
								<Link href={link}>
									<a {...props}>{children}</a>
								</Link>
							)}
						/>
					</div>
				))}
			</div>
			{canEdit && (
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
			)}
		</>
	);
}

export default DetailActions;
