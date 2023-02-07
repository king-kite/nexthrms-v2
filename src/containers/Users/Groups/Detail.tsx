import { Button, InfoComp, TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';

import { Container, Modal } from '../../../components/common';
import { GroupForm, UsersGrid } from '../../../components/Groups/Detail';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useDeleteGroupMutation,
	useGetGroupQuery,
} from '../../../store/queries';
import { GroupType } from '../../../types';
import { toCapitalize } from '../../../utils';

function GroupDetail({ group }: { group: GroupType }) {
	const [modalVisible, setModalVisible] = useState(false);
	const [offset, setOffset] = useState(0);

	const router = useRouter();
	const id = router.query.id as string;
	const { data, isLoading, isFetching, refetch } = useGetGroupQuery(
		{
			id,
			users: {
				limit: DEFAULT_PAGINATION_SIZE,
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

	return (
		<Container
			heading="Group Information"
			icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
			title={data ? toCapitalize(data.name) : undefined}
		>
			{data && (
				<>
					<div className="flex flex-wrap items-center w-full lg:justify-end">
						<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
							<Button
								iconLeft={FaPen}
								onClick={() => setModalVisible(true)}
								rounded="rounded-xl"
								title="Edit Group"
							/>
						</div>
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
									component: <>This is the permissions screen</>,
								},
								{
									title: 'Users',
									description: 'View all users in this group!',
									component:
										data.users.length > 0 ? (
											<UsersGrid
												users={data.users}
												paginate={
													data._count?.users
														? {
																totalItems: data._count.users,
																offset,
																setOffset,
																loading: isFetching,
														  }
														: undefined
												}
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
					<Modal
						close={() => setModalVisible(false)}
						component={
							<GroupForm
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
				</>
			)}
		</Container>
	);
}

export default GroupDetail;
