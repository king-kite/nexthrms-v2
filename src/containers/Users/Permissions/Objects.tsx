import { TabNavigator } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';

import { Container, Pagination } from '../../../components/common';
import { GroupTable, UserTable } from '../../../components/Permissions/Objects';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetObjectPermissionsQuery } from '../../../store/queries';
import {
	ObjPermGroupType,
	ObjPermUser,
	GetObjectPermissionsResponseType,
	PermissionModelNameType,
} from '../../../types';

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
	// paginate on the frontend

	// const [paginateGroups, setPaginateGroups] = React.useState({
	// 	limit: DEFAULT_PAGINATION_SIZE,
	// 	offset: 0,
	// 	search: '',
	// });

	// const [paginateUsers, setPaginateUsers] = React.useState({
	// 	limit: DEFAULT_PAGINATION_SIZE,
	// 	offset: 0,
	// 	search: '',
	// });

	const modelName = router.query.model as PermissionModelNameType;
	const objectId = router.query.objectId as string;

	const { data, isFetching, refetch } = useGetObjectPermissionsQuery(
		{
			modelName,
			objectId,
		},
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
							<>
								<UserTable
									modelName={modelName}
									objectId={objectId}
									users={users}
								/>
								{/* {paginate.totalItems > 0 && (
									<div className="pt-2 pb-5">
										<Pagination
											disabled={paginate.loading || false}
											onChange={(pageNo: number) => {
												const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
												paginate.offset !== value &&
													paginate.setOffset(value * DEFAULT_PAGINATION_SIZE);
											}}
											pageSize={DEFAULT_PAGINATION_SIZE}
											totalItems={paginate.totalItems || 0}
										/>
									</div>
								)} */}
							</>
						),
						description:
							'This screen shows the users with access to this record',
						title: 'Users',
					},
					{
						component: (
							<GroupTable
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
