import { InfoComp } from 'kite-react-tailwind';
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
									title: 'First Name',
									value: '',
								},
							]}
							title="personal information"
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
