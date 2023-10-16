import { Button } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPen } from 'react-icons/fa';

import PermissionsForm from './permissions-form';
import { Modal, TablePagination } from '../../common';
import { Permissions } from '../../groups/detail';
import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import {
	useEditUserPermissionsMutation,
	useGetUserPermissionsQuery,
} from '../../../store/queries/users';

function UserPermissions({
	canEditUser,
	hideOtherModals,
}: {
	canEditUser: boolean;
	hideOtherModals?: () => void;
}) {
	const [errors, setErrors] = React.useState<{
		permissions?: string;
		message?: string;
	}>();
	const [errorType, setErrorType] = React.useState<'single' | 'multiple'>('single');
	const [modalVisible, setModalVisible] = React.useState(false);
	const [limit, setLimit] = React.useState(5);
	const [offset, setOffset] = React.useState(0);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { visible: alertModalVisible, close: closeAlertModal } = useAlertModalContext();

	const { data, isLoading, isFetching } = useGetUserPermissionsQuery({ id });

	const permissions = React.useMemo(() => {
		if (!data) return undefined;
		const result = data.result.slice(offset, limit + offset);
		return result;
	}, [data, limit, offset]);

	const { mutate: editPermissions, isLoading: editLoading } = useEditUserPermissionsMutation(
		{
			onSuccess() {
				showAlert({
					type: 'success',
					message:
						errorType === 'single'
							? 'Permission was removed successfully!'
							: 'User permissions were updated successfully!',
				});
			},
			onError(err) {
				if (errorType === 'single') {
					showAlert({
						type: 'danger',
						message: err?.data?.permissions || err.message,
					});
				} else {
					setErrors((prevState) =>
						prevState
							? {
									...prevState,
									permissions: err?.data?.permissions,
									message: err.message,
							  }
							: {
									permissions: err?.data?.permissions,
									message: err.message,
							  }
					);
				}
			},
		},
		{
			onSettled() {
				if (alertModalVisible) closeAlertModal();
				if (modalVisible) setModalVisible(false);
				setErrorType('single');
			},
		}
	);

	return (
		<React.Fragment>
			{canEditUser && !isLoading && (
				<div className="flex flex-wrap items-center w-full lg:justify-end">
					<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaPen}
							rounded="rounded-xl"
							title="Update"
							disabled={isFetching || editLoading}
							onClick={() => {
								if (hideOtherModals) hideOtherModals();
								setModalVisible(true);
								setErrorType('multiple');
							}}
						/>
					</div>
				</div>
			)}
			{isLoading ? (
				<p className="text-primary-500 text-xs md:text-sm">Loading...</p>
			) : permissions && permissions.length > 0 ? (
				<div>
					<Permissions
						name="user"
						permissions={permissions}
						removePermission={
							!canEditUser
								? undefined
								: (codename: string) => {
										if (!data) return;
										setErrorType('single');
										const form = {
											permissions: data.result
												.filter((permission) => permission.codename !== codename)
												.map((permission) => permission.codename),
										};
										editPermissions({ id, form });
								  }
						}
					/>
					{(data?.total || permissions.length) > 0 && (
						<TablePagination
							disabled={isFetching}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							pageSize={limit}
							onSizeChange={(size) => setLimit(size)}
							totalItems={data?.total || permissions.length}
						/>
					)}
				</div>
			) : (
				<p className="text-primary-500 text-xs md:text-sm">
					There are currently no private permissions for this user. Check the user&apos;s groups
					instead.
				</p>
			)}
			<Modal
				close={() => setModalVisible(false)}
				component={
					<PermissionsForm
						loading={editLoading}
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						initState={data?.result}
						onSubmit={(form) => {
							editPermissions({ id, form });
						}}
					/>
				}
				description="Select permissions you want to assign to this user"
				keepVisible
				title="Update User's Permissions"
				visible={modalVisible}
			/>
		</React.Fragment>
	);
}

export default UserPermissions;
