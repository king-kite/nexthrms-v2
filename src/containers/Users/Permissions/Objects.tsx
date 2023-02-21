import { TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';

import { Container } from '../../../components/common';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetObjectPermissionsQuery } from '../../../store/queries';
import {
	ObjectPermissionType,
	ObjectPermissionUserType,
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

	const users = React.useMemo(() => {
		if (!data) return [];

		// scoped users array with will include boolean fields for permissions
		const users: (ObjectPermissionUserType & {
			permissions: ('CREATE' | 'DELETE' | 'EDIT' | 'VIEW')[];
		})[] = [];

		data.result.forEach((objPerm) => {
			// loop through the users in the objPerm and
			// check if there is a user already in the scoped user variable
			objPerm.users.forEach((user) => {
				const found = users.find((item) => item.id === user.id);
				// Check if the user exists in the scoped variable
				// and does not have this objPerm permission yet
				if (found && !found.permissions.includes(objPerm.permission)) {
					const index = users.indexOf(found);
					users[index] = {
						...found,
						permissions: [...found.permissions, objPerm.permission],
					};
				} else {
					users.push({
						...user,
						permissions: [objPerm.permission],
					});
				}
			});
		});

		return users;
	}, [data]);

	console.log({ users });

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
