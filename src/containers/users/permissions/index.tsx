import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../../components/common/container';
import { PermissionTable, Topbar } from '../../../components/permissions';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useGetPermissionsQuery } from '../../../store/queries/permissions';
import { GetPermissionsResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';

const DynamicTablePagination = dynamic<any>(
	() =>
		import('../../../components/common/table/pagination').then(
			(mod) => mod.default
		),
	{
		ssr: false,
	}
);

const Permissions = ({
	permissions: permissionData,
}: {
	permissions: GetPermissionsResponseType['data'];
}) => {
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canExport, canEdit, canView] = React.useMemo(() => {
		if (!authData) return [false, false];
		const hasExportPerm =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.permission.EXPORT]);
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.permission.EDIT]);
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
		return [hasExportPerm, canEdit, canView];
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
				onSubmit={(name: string) => {
					// change page to 1
					paginateRef.current?.changePage(1);
					setSearch(name);
				}}
			/>
			{canView && data && (
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<PermissionTable permissions={data.result} offset={offset} />
					{data && data?.total > 0 && (
						<DynamicTablePagination
							disabled={isFetching}
							totalItems={data.total}
							handleRef={{ ref: paginateRef }}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							onSizeChange={(size: number) => setLimit(size)}
							pageSize={limit}
						/>
					)}
				</div>
			)}
		</Container>
	);
};

export default Permissions;
