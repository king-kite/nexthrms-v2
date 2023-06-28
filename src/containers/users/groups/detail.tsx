import { Button, InfoComp, TabNavigator } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import Container from '../../../components/common/container';
import Permissions from '../../../components/groups/detail/permissions';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	GROUP_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../../config';
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../../../store/contexts';
import {
	useDeleteGroupMutation,
	useEditGroupMutation,
	useGetGroupQuery,
	useGetUserObjectPermissionsQuery,
} from '../../../store/queries/permissions';
import {
	GroupType,
	CreateGroupQueryType,
	UserObjPermType,
} from '../../../types';
import { hasModelPermission, toCapitalize } from '../../../utils';

const DynamicGroupForm = dynamic<any>(
	() =>
		import('../../../components/groups/detail/group-form').then(
			(mod) => mod.default
		),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicModal = dynamic<any>(
	() => import('../../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);
const DynamicUsersGrid = dynamic<any>(
	() =>
		import('../../../components/groups/detail/users-grid').then(
			(mod) => mod.default
		),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Users...
			</p>
		),
		ssr: false,
	}
);

function GroupDetail({
	group,
	objPerm,
}: {
	group: GroupType;
	objPerm: UserObjPermType;
}) {
	const [editMessage, setEditMessage] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);
	const [offset, setOffset] = React.useState(0);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const router = useRouter();
	const id = router.query.id as string;
	const { data, error, isLoading, isFetching, refetch } = useGetGroupQuery(
		{
			id,
			users: {
				limit,
				offset,
				search: '',
			},
		},
		{
			initialData() {
				return group;
			},
		}
	);
	const { open: showAlert } = useAlertContext();
	const { close: closeAlertModal } = useAlertModalContext();
	const { data: authData } = useAuthContext();

	// Get user's object level permissions for the users table
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'groups',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	const { mutate: editGroup, isLoading: editLoading } = useEditGroupMutation({
		onSuccess() {
			closeAlertModal();
			showAlert({
				type: 'success',
				message: editMessage || 'Group information was updated successfully!',
			});
		},
		onError(err) {
			closeAlertModal();
			showAlert({
				type: 'danger',
				message: err.message,
			});
		},
	});

	const { deleteGroup, isLoading: delLoading } = useDeleteGroupMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Group was deleted successfully!',
			});
			router.back();
		},
		onError({ message }) {
			showAlert({
				type: 'danger',
				message,
			});
		},
	});

	const [canEdit, canDelete, canViewObjectPermissions] = React.useMemo(() => {
		if (!authData) return [false, false, false];
		if (!authData.isSuperUser && !authData.isAdmin) return [false, false];

		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.group.EDIT]) ||
			(objPermData && objPermData.edit);

		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.group.DELETE]) ||
			(objPermData && objPermData.delete);

		const canViewObjectPermissions =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [
					permissions.permissionobject.VIEW,
				]));

		return [
			canEdit || false,
			canDelete || false,
			canViewObjectPermissions || false,
		];
	}, [authData, objPermData]);

	return (
		<Container
			heading="Group Information"
			icon
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
			refresh={{
				loading: isFetching,
				onClick: () => {
					refetch();
					objPermRefetch();
				},
			}}
			loading={isLoading}
			title={data ? toCapitalize(data.name) : undefined}
		>
			{data && (
				<>
					<div className="flex flex-wrap items-center w-full lg:justify-end">
						{canEdit && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									iconLeft={FaPen}
									onClick={() => setModalVisible(true)}
									rounded="rounded-xl"
									title="Edit Group"
									disabled={editLoading}
								/>
							</div>
						)}
						{canDelete && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									bg="bg-red-600 hover:bg-red-500"
									focus="focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
									iconLeft={FaTrash}
									rounded="rounded-xl"
									title={delLoading ? 'Deleting Group...' : 'Delete Group'}
									disabled={delLoading}
									onClick={() => deleteGroup(id)}
								/>
							</div>
						)}
						{canViewObjectPermissions && (
							// Added a longer button
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/3">
								<Button
									bg="bg-gray-600 hover:bg-gray-500"
									iconLeft={FaUserShield}
									rounded="rounded-xl"
									title="View Object Permissions"
									link={GROUP_OBJECT_PERMISSIONS_PAGE_URL(id)}
								/>
							</div>
						)}
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Name',
									value: data.name,
								},
								{
									title: 'Description',
									value: data.description,
								},
								{
									options: {
										bg: data.active ? 'green' : 'danger',
									},
									type: 'badge',
									title: 'Active',
									value: data.active ? 'ACTIVE' : 'INACTIVE',
								},
							]}
							description="Details and Information about this group"
							title={toCapitalize(data.name)}
						/>
					</div>
					<div className="my-4">
						<TabNavigator
							screens={[
								{
									title: 'Permissions',
									description: 'View all permissions in this group!',
									component:
										data.permissions.length > 0 ? (
											<Permissions
												permissions={data.permissions}
												removePermission={(codename: string) => {
													setEditMessage(
														'Permission was removed from this group successfully!'
													);
													const form: CreateGroupQueryType = {
														name: data.name,
														active: data.active,
														description: data.description || '',
														permissions: data.permissions
															.filter(
																(permission) => permission.codename !== codename
															)
															.map((permission) => permission.codename),
														users: data.users.map((user) => user.id),
													};
													editGroup({ id, form });
												}}
											/>
										) : (
											<p className="text-primary-500 text-xs md:text-sm">
												There are currently no permissions in this group.
											</p>
										),
								},
								{
									title: 'Users',
									description: 'View all users in this group!',
									component:
										data.users.length > 0 ? (
											<DynamicUsersGrid
												users={data.users}
												paginate={
													data._count?.users
														? {
																totalItems: data._count.users,
																limit,
																setLimit,
																offset,
																setOffset,
																loading: isFetching || editLoading,
														  }
														: undefined
												}
												removeUser={(userId: string) => {
													setEditMessage(
														'User was removed from this group successfully!'
													);
													const form: CreateGroupQueryType = {
														name: data.name,
														active: data.active,
														description: data.description || '',
														permissions: data.permissions.map(
															(permission) => permission.codename
														),
														users: data.users
															.filter((user) => user.id !== userId)
															.map((user) => user.id),
													};
													editGroup({ id, form });
												}}
											/>
										) : (
											<p className="text-primary-500 text-xs md:text-sm">
												There are currently no users in this group.
											</p>
										),
								},
							]}
						/>
					</div>
					{canEdit && (
						<DynamicModal
							close={() => setModalVisible(false)}
							component={
								<DynamicGroupForm
									group={data}
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'Group updated successfully!',
										});
									}}
								/>
							}
							description="Fill in the form to update group information"
							keepVisible
							title="Update Group Information"
							visible={modalVisible}
						/>
					)}
				</>
			)}
		</Container>
	);
}

export default GroupDetail;
