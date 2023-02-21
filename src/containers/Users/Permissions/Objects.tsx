import { useRouter } from 'next/router';

import { Container } from '../../../components/common';
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

	return (
		<Container
			heading="Object/Record Permissions"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
		>
			<></>
		</Container>
	);
}

export default ObjectPermissions;
