import { useRouter } from 'next/router';
import React from 'react';

import { Pagination } from '../../common';
import { Permissions } from '../../Groups/Detail';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import {
	useEditUserPermissionsMutation,
	useGetUserPermissionsQuery,
} from '../../../store/queries';
import { PermissionType } from '../../../types';

function UserPermissions({
	permissions,
}: {
	permissions: {
		total: number;
		result: PermissionType[];
	};
}) {
	const [offset, setOffset] = React.useState(0);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { close: closeAlertModal } = useAlertModalContext();

	const { data, isLoading, isFetching } = useGetUserPermissionsQuery(
		{
			id,
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: '',
		},
		{
			initialData() {
				return permissions;
			},
		}
	);

	const { mutate: editPermissions } = useEditUserPermissionsMutation({
		onSuccess() {
			closeAlertModal();
			showAlert({
				type: 'success',
				message: 'Permission was removed successfully!',
			});
		},
		onError(err) {
			closeAlertModal();
			showAlert({
				type: 'danger',
				message: err?.data?.permissions || err.message,
			});
		},
	});

	return isLoading ? (
		<p className="text-primary-500 text-xs md:text-sm">Loading...</p>
	) : data && data.result.length > 0 ? (
		<div>
			<Permissions
				permissions={data.result}
				removePermission={(codename: string) => {
					const form = {
						permissions: data.result
							.filter((permission) => permission.codename !== codename)
							.map((permission) => permission.codename),
					};
					editPermissions({ id, form });
				}}
			/>
			{data.total > 0 && (
				<div className="pt-2 pb-5">
					<Pagination
						disabled={isFetching}
						onChange={(pageNo: number) => {
							const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
							offset !== value && setOffset(value * DEFAULT_PAGINATION_SIZE);
						}}
						pageSize={DEFAULT_PAGINATION_SIZE}
						totalItems={data.total}
					/>
				</div>
			)}
		</div>
	) : (
		<p className="text-primary-500 text-xs md:text-sm">
			There are currently no private permissions for this user. Check the
			user&apos;s groups instead.
		</p>
	);
}

export default UserPermissions;
