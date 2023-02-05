import { useState } from 'react';

import { Container } from '../../components/common';
import { PermissionTable, Topbar } from '../../components/Permissions';
import { DEFAULT_PAGINATION_SIZE, PERMISSIONS_EXPORT_URL } from '../../config';
import { useAlertContext } from '../../store/contexts';
import { useGetPermissionsQuery } from '../../store/queries';
import { GetPermissionsResponseType } from '../../types';
import { downloadFile } from '../../utils';

const Permissions = ({
	permissions: permissionData,
}: {
	permissions: GetPermissionsResponseType['data'];
}) => {
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();

	const { data, isFetching, refetch } = useGetPermissionsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
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
				data
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
				exportData={async (type, filtered) => {
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
				}}
				exportLoading={exportLoading}
			/>
			<div className="mt-3">
				<PermissionTable permissions={data?.result || []} />
			</div>
		</Container>
	);
};

export default Permissions;
