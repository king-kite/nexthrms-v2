import { useMemo, useState } from 'react';

import { Container } from '../../../components/common';
import { PermissionTable, Topbar } from '../../../components/Permissions';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	PERMISSIONS_EXPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useGetPermissionsQuery } from '../../../store/queries';
import { GetPermissionsResponseType } from '../../../types';
import { downloadFile, hasModelPermission } from '../../../utils';

const Permissions = ({
	permissions: permissionData,
}: {
	permissions: GetPermissionsResponseType['data'];
}) => {
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canExport, canView] = useMemo(() => {
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
			limit: DEFAULT_PAGINATION_SIZE,
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
			paginate={
				canView && data
					? {
							offset,
							setOffset,
							loading: isFetching,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<Topbar
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={
					!canExport
						? undefined
						: async (type, filtered) => {
								let url = PERMISSIONS_EXPORT_URL + '?type=' + type;
								if (filtered) {
									url =
										url +
										`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
								}
								const result = await downloadFile({
									url,
									name: type === 'csv' ? 'permissions.csv' : 'permissions.xlsx',
									setLoading: setExportLoading,
								});
								if (result?.status !== 200) {
									open({
										type: 'danger',
										message: 'An error occurred. Unable to export file!',
									});
								}
						  }
				}
				exportLoading={exportLoading}
			/>
			{canView && data && (
				<div className="mt-3">
					<PermissionTable permissions={data.result} />
				</div>
			)}
		</Container>
	);
};

export default Permissions;
