import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../components/common/container';
import { Cards, UserTable, Topbar } from '../../components/users';
import {
	permissions,
	samples,
	DEFAULT_PAGINATION_SIZE,
	USERS_EXPORT_URL,
	USERS_IMPORT_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useCreateUserMutation,
	useGetUsersQuery,
} from '../../store/queries/users';
import { CreateUserErrorResponseType, GetUsersResponseType } from '../../types';
import { hasModelPermission } from '../../utils/permission';

interface ErrorType extends CreateUserErrorResponseType {
	message?: string;
}

const DynamicImportForm = dynamic<any>(
	() =>
		import('../../components/common/import-form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicForm = dynamic<any>(
	() => import('../../components/users/form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicModal = dynamic<any>(
	() => import('../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);

const DynamicTablePagination = dynamic<any>(
	() =>
		import('../../components/common/table/pagination').then(
			(mod) => mod.default
		),
	{
		ssr: false,
	}
);

const Users = ({
	users: userData,
}: {
	users: GetUsersResponseType['data'];
}) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [errors, setErrors] = React.useState<ErrorType>();
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.EXPORT])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.VIEW]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'users' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isFetching, isLoading, refetch } = useGetUsersQuery(
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
				return userData;
			},
		}
	);

	const {
		mutate: createUser,
		isLoading: loading,
		isSuccess: formSuccess,
	} = useCreateUserMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'User was created successfully!',
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
					message: err?.message || 'Unable to create user. Please try again!',
				};
			});
		},
	});

	const handleSubmit = React.useCallback(
		(form: FormData) => {
			if (canCreate) createUser(form);
		},
		[canCreate, createUser]
	);

	return (
		<Container
			heading="Users"
			disabledLoading={isLoading}
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{(canCreate || canView) && (
				<Cards
					active={data?.active || 0}
					leave={data?.on_leave || 0}
					inactive={data?.inactive || 0}
					employees={data?.employees || 0}
					clients={data?.clients || 0}
					total={data?.total || 0}
				/>
			)}
			<Topbar
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => {
					// change the page to 1
					paginateRef.current?.changePage(1);
					setSearch(name);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: USERS_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${search}`,
						  }
				}
			/>
			{(canCreate || canView) && (
				<div className="mt-7 rounded-lg py-2 md:py-3 lg:py-4">
					<UserTable users={data?.result || []} offset={offset} />
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
			{canCreate && (
				<DynamicModal
					close={() => setModalVisible(false)}
					component={
						bulkForm ? (
							<DynamicImportForm
								onSuccess={(data: any) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
									setBulkForm(false);
								}}
								requirements={[
									{
										required: false,
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'email',
										value: 'johndoe@gmail.com',
									},
									{
										title: 'first_name',
										value: 'John',
									},
									{
										title: 'last_name',
										value: 'Doe',
									},
									{
										required: false,
										title: 'dob',
										value: '2023-03-26T21:49:51.090Z',
									},
									{
										title: 'gender',
										value: 'MALE',
									},
									{
										required: false,
										title: 'image_id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										required: false,
										title: 'image',
										value: '/images/default.png',
									},
									{
										required: false,
										title: 'address',
										value: '"Lorem Ipsum dolor imet To"',
									},
									{
										required: false,
										title: 'city',
										value: 'Tokyo',
									},
									{
										required: false,
										title: 'state',
										value: 'Old York',
									},
									{
										required: false,
										title: 'phone',
										value: '+234 123 4567 890',
									},
									{
										required: false,
										title: 'is_active',
										value: 'true',
									},
									{
										required: false,
										title: 'is_admin',
										value: 'false',
									},
									{
										required: false,
										title: 'is_superuser',
										value: 'false',
									},
									{
										required: false,
										title: 'email_verified',
										value: 'true',
									},
									{
										required: false,
										title: 'permissions',
										value: 'can_edit_user,can_create_user,can_view_asset',
									},
									{
										required: false,
										title: 'groups',
										value: 'admin,employee,client',
									},
									{
										required: false,
										title: 'updated_at',
										value: '2023-03-26T21:49:51.090Z',
									},
									{
										required: false,
										title: 'created_at',
										value: '2023-03-26T21:49:51.090Z',
									},
								]}
								sample={samples.users}
								url={USERS_IMPORT_URL}
							/>
						) : (
							<DynamicForm
								errors={errors}
								resetErrors={() => setErrors(undefined)}
								loading={loading}
								onSubmit={handleSubmit}
								success={formSuccess}
							/>
						)
					}
					description="Fill in the form below to add a new User"
					title="Add User"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Users;
