import React from 'react';

import {
	Container,
	ImportForm,
	Modal,
	TablePagination,
} from '../../../components/common';
import { GroupTable, Form, Topbar } from '../../../components/Groups';
import {
	permissions,
	samples,
	DEFAULT_PAGINATION_SIZE,
	GROUPS_EXPORT_URL,
	GROUPS_IMPORT_URL,
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
import { hasModelPermission } from '../../../utils';

interface ErrorType extends CreateGroupErrorResponseType {
	message?: string;
}

const Groups = ({
	groups: groupData,
}: {
	groups: GetGroupsResponseType['data'];
}) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [errors, setErrors] = React.useState<ErrorType>();
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
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
			limit,
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

	const handleSubmit = React.useCallback(
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
		>
			<Topbar
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={
					!canExport
						? undefined
						: {
								all: GROUPS_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${search}`,
						  }
				}
			/>
			{(canCreate || canView) && (
				<div className="mt-7 rounded-lg py-2 md:py-3 lg:py-4">
					<GroupTable groups={data?.result || []} />
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
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						bulkForm ? (
							<ImportForm
								onSuccess={(data) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
									setBulkForm(false);
								}}
								title="groups"
								requirements={[
									{
										required: false,
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'name',
										value: 'employee',
									},
									{
										required: false,
										title: 'description',
										value: '"This group is for employee users only."',
									},
									{
										required: false,
										title: 'permissions',
										value: '"can_mark_attendance,can_view_project"',
									},
									{
										title: 'active',
										value: 'true',
									},
								]}
								sample={samples.groups}
								url={GROUPS_IMPORT_URL}
							/>
						) : (
							<Form
								errors={errors}
								resetErrors={() => setErrors(undefined)}
								loading={loading}
								success={formSuccess}
								onSubmit={handleSubmit}
							/>
						)
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
