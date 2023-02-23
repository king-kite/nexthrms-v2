import { TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';

import { Container } from '../../../components/common';
import { UserTable } from '../../../components/Permissions/Objects';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetObjectPermissionsQuery } from '../../../store/queries';
import {
	ObjPermUser,
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

	const users: ObjPermUser[] = React.useMemo(() => {
		if (!data) return [];
		const users = data.result.reduce((acc: ObjPermUser[], obj) => {
			// Store all the users in an array and the permission they got
			// To be returned later after modification if neccessary
			const users = acc;

			// NOTE: obj.permission will go/vary from 'DELETE' to 'EDIT' to 'VIEW'
			// in the reduce function

			obj.users.forEach((user) => {
				// Check if user is already in the accumulator
				const found = users.find((item) => item.id === user.id);
				if (found) {
					const index = users.indexOf(found);
					users[index] = {
						...users[index],
						[obj.permission.toLowerCase()]: true,
					};
				} else {
					users.push({
						...user,
						[obj.permission.toLowerCase()]: true, // reduce the permission from upper to lower case
					});
				}
			});

			return users;
		}, []);
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
						component: <UserTable users={users} />,
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
