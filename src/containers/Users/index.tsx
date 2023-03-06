import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, UserTable, Form, Topbar } from '../../components/Users';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	USERS_EXPORT_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useCreateUserMutation, useGetUsersQuery } from '../../store/queries';
import { CreateUserErrorResponseType, GetUsersResponseType } from '../../types';
import { downloadFile, hasModelPermission } from '../../utils';

interface ErrorType extends CreateUserErrorResponseType {
	message?: string;
}

const Users = ({ users: userData }: { users: GetUsersResponseType }) => {
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
			  hasModelPermission(authData.permissions, [permissions.user.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.EXPORT])
			: false;
		// TODO: Add Object Level Permissions As Well
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
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
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

	const handleSubmit = useCallback(
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
			{canView && (
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
				openModal={() => setModalVisible(true)}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = USERS_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'users.csv' : 'users.xlsx',
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
			{canView && (
				<div className="mt-3">
					<UserTable users={data?.result || []} />
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
							onSubmit={handleSubmit}
							success={formSuccess}
						/>
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
