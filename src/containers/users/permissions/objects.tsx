import { PermissionModelChoices } from '@prisma/client';
import { TabNavigator } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';

import Container from '../../../components/common/container';
import Users from '../../../components/permissions/objects/users';
import { useGetObjectPermissionsQuery } from '../../../store/queries/permissions';
import {
	ObjPermGroupType,
	ObjPermUser,
	GetObjectPermissionsResponseType,
} from '../../../types';

const DynamicGroups = dynamic<any>(
	() =>
		import('../../../components/permissions/objects/groups').then(
			(mod) => mod.default
		),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Groups...
			</p>
		),
		ssr: false,
	}
);

function ObjectPermissions({
	permissions,
}: {
	permissions: GetObjectPermissionsResponseType['data'];
}) {
	const router = useRouter();
	/** Pagination will be done on the frontend
	 * Say we have over a thousand users that may be have scattered permissions for this object.
	 * For e.g a user A might have view and delete and a user B might have view and edit.
	 * we have 3 permission types per object i.e. DELETE, EDIT, VIEW which have their own users array
	 * if user A was at the very bottom of the view array and at the top of the delete array
	 * and we were to paginate, only he's 'delete' permission may show at a time first and he's
	 * 'view' permission will show later on as we go paginate further and doing so may also make
	 * he's 'delete' permission disappear as well since we go further down and it will be left behind.
	 * Hence getting all the users from the object permission is ideal as we'll get them all
	 * and then paginate them on the frontend
	 */

	const modelName = router.query.model as PermissionModelChoices;
	const objectId = router.query.objectId as string;

	const { data, isFetching, refetch } = useGetObjectPermissionsQuery(
		{ modelName, objectId },
		{
			initialData() {
				return permissions;
			},
		}
	);

	const groups: ObjPermGroupType[] = React.useMemo(() => {
		if (!data) return [];
		const groups = data.result.reduce((acc: ObjPermGroupType[], obj) => {
			// Store all the groups in an array and the permission they got
			// To be returned later after modification if neccessary
			const groups = acc;

			// NOTE: obj.permission will go/vary from 'DELETE' to 'EDIT' to 'VIEW'
			// in the reduce function

			obj.groups.forEach((group) => {
				// Check if group is already in the accumulator
				const found = groups.find((item) => item.id === group.id);
				if (found) {
					const index = groups.indexOf(found);
					groups[index] = {
						...groups[index],
						[obj.permission.toLowerCase()]: true,
					};
				} else {
					groups.push({
						...group,
						[obj.permission.toLowerCase()]: true, // reduce the permission from upper to lower case
					});
				}
			});

			return groups;
		}, []);
		return groups;
	}, [data]);

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
						component: (
							<Users modelName={modelName} objectId={objectId} users={users} />
						),
						description:
							'This screen shows the users with access to this record',
						title: 'Users',
					},
					{
						component: (
							<DynamicGroups
								groups={groups}
								modelName={modelName}
								objectId={objectId}
							/>
						),
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
