import { TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';

import { Container } from '../../../components/common';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetObjectPermissionsQuery } from '../../../store/queries';
import {
	GetObjectPermissionsResponseType,
	PermissionModelNameType,
} from '../../../types';

function ObjectPermissions({
	permissions,
}: {
	permissions: GetObjectPermissionsResponseType['data'];
}) {
	const router = useRouter();
	const [paginateGroups, setPaginateGroups] = React.useState({
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});

	const [paginateUsers, setPaginateUsers] = React.useState({
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});

	const modelName = router.query.model as PermissionModelNameType;
	const objectId = router.query.objectId as string;

	const { data, isFetching, refetch } = useGetObjectPermissionsQuery(
		{
			modelName,
			objectId,
			users: paginateUsers,
			groups: paginateGroups,
		},
		{
			initialData() {
				return permissions;
			},
		}
	);

	return (
		<Container
			heading="Object/Record Permissions"
      icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
		>
			<TabNavigator
				screens={[
					{
						component: <></>,
						description:
							'This screen shows the users with access to this record',
						title: 'Users',
					},
					{
						component: <></>,
						description:
							'This screen shows the groups with access to this record',
						title: 'Groups',
					},
				]}
			/>
		</Container>
	);
}

export default ObjectPermissions;
