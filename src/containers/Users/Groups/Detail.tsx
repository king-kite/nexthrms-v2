import { InfoComp, TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Container, Modal } from '../../../components/common';
import { GroupForm } from '../../../components/Groups/Detail';
import { useAlertContext } from '../../../store/contexts';
import { useGetGroupQuery } from '../../../store/queries';
import { GroupType } from '../../../types';
import { toCapitalize } from '../../../utils';

function GroupDetail({ group }: { group: GroupType }) {
	const [modalVisible, setModalVisible] = useState(false);

	const router = useRouter();
	const id = router.query.id as string;
	const { data, isLoading, isFetching, refetch } = useGetGroupQuery(
		{
			id,
		},
		{
			initialData() {
				return group;
			},
		}
	);
	const { open: showAlert } = useAlertContext();

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
									component: <>This is the users screen</>,
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
