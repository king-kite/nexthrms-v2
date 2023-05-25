import React from 'react';

import { Container, TablePagination } from '../../../components/common';
import { PermissionTable, Topbar } from '../../../components/Permissions';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	PERMISSIONS_EXPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useGetPermissionsQuery } from '../../../store/queries';
import { GetPermissionsResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';

const Permissions = ({
	permissions: permissionData,
}: {
	permissions: GetPermissionsResponseType['data'];
}) => {
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canExport, canView] = React.useMemo(() => {
		if (!authData) return [false, false];
		const hasExportPerm =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.permission.EXPORT]);
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.permission.VIEW,
			  ]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) =>
						perm.modelName === 'permissions' && perm.permission === 'VIEW'
			  )
			: false;
		return [hasExportPerm, canView];
	}, [authData]);

	const { data, isFetching, refetch } = useGetPermissionsQuery(
		{
			limit,
			offset,
			search,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
		},
		{
			initialData() {
				return permissionData;
			},
		}
	);

	return (
		<Container
			heading="Permissions"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
		>
			<Topbar
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={
					!canExport
						? undefined
						: {
								all: PERMISSIONS_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`,
						  }
				}
			/>
			{canView && data && (
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<PermissionTable permissions={data.result} />
					{data && data?.total > 0 && (
						<TablePagination
							disabled={isFetching}
							totalItems={data.total}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							onSizeChange={(size) => setLimit(size)}
							pageSize={limit}
						/>
					)}
				</div>
			)}
		</Container>
	);
};

export default Permissions;
