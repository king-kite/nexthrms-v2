import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../../components/common';
import { GroupTable, Form, Topbar } from '../../../components/Groups';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	GROUPS_EXPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useCreateGroupMutation,
	useGetGroupsQuery,
} from '../../../store/queries';
import {
	CreateGroupQueryType,
	CreateGroupErrorResponseType,
	GetGroupsResponseType,
} from '../../../types';
import { downloadFile, hasModelPermission } from '../../../utils';

interface ErrorType extends CreateGroupErrorResponseType {
	message?: string;
}

const Groups = ({
	groups: groupData,
}: {
	groups: GetGroupsResponseType['data'];
}) => {
	const [errors, setErrors] = useState<ErrorType>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.group.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.group.EXPORT])
			: false;
		// TODO: Add Object Level Permissions As Well
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.group.VIEW]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'groups' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isFetching, isLoading, refetch } = useGetGroupsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
			users: {
				limit: DEFAULT_PAGINATION_SIZE,
				offset: 0,
				search: '',
			},
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
		},
		{
			initialData() {
				return groupData;
			},
		}
	);

	const {
		mutate: createGroup,
		isLoading: loading,
		isSuccess: formSuccess,
	} = useCreateGroupMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Group was created successfully!',
			});
		},
		onError(err) {
			setErrors((prevState) => {
				if (err?.data)
					return {
						...prevState,
						...err?.data,
					};
				return {
					...prevState,
					message: err?.message || 'Unable to create group. Please try again!',
				};
			});
		},
	});

	const handleSubmit = useCallback(
		(form: CreateGroupQueryType) => {
			if (canCreate) createGroup(form);
		},
		[canCreate, createGroup]
	);

	return (
		<Container
			heading="Groups"
			disabledLoading={isLoading}
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
			paginate={
				(canCreate || canView) && data
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
				openModal={() => setModalVisible(true)}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = GROUPS_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'groups.csv' : 'groups.xlsx',
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
			{(canCreate || canView) && (
				<div className="mt-3">
					<GroupTable groups={data?.result || []} />
				</div>
			)}
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<Form
							errors={errors}
							resetErrors={() => setErrors(undefined)}
							loading={loading}
							success={formSuccess}
							onSubmit={handleSubmit}
						/>
					}
					description="Fill in the form below to add a new group"
					title="Add Group"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Groups;
