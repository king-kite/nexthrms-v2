import { Button } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPen } from 'react-icons/fa';

import PermissionsForm from './PermissionsForm';
import { Modal, Pagination } from '../../common';
import { Permissions } from '../../Groups/Detail';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import {
	useEditUserPermissionsMutation,
	useGetUserPermissionsQuery,
} from '../../../store/queries';
import { PermissionType } from '../../../types';

function UserPermissions({
	permissions,
	hideOtherModals,
}: {
	permissions: {
		total: number;
		result: PermissionType[];
	};
	hideOtherModals: () => void;
}) {
	const [errors, setErrors] = React.useState<{
		permissions?: string;
		message?: string;
	}>();
	const [errorType, setErrorType] = React.useState<'single' | 'multiple'>(
		'single'
	);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [offset, setOffset] = React.useState(0);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { close: closeAlertModal } = useAlertModalContext();

	const { data, isLoading, isFetching } = useGetUserPermissionsQuery(
		{
			id,
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: '',
		},
		{
			initialData() {
				return permissions;
			},
		}
	);

	const { mutate: editPermissions, isLoading: editLoading } =
		useEditUserPermissionsMutation({
			onSuccess() {
				if (errorType === 'single') {
					closeAlertModal();
					showAlert({
						type: 'success',
						message: 'Permission was removed successfully!',
					});
				} else {
					setModalVisible(false);
					showAlert({
						type: 'success',
						message: 'User permissions were updated successfully!',
					});
				}
			},
			onError(err) {
				if (errorType === 'single') {
					closeAlertModal();
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
		});

	return (
		<React.Fragment>
			{!isLoading && (
				<div className="flex flex-wrap items-center w-full lg:justify-end">
					<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaPen}
							rounded="rounded-xl"
							title="Update Permissions"
							disabled={isFetching || editLoading}
							onClick={() => {
                hideOtherModals();
								setModalVisible(true);
								setErrorType('multiple');
							}}
						/>
					</div>
				</div>
			)}
			{isLoading ? (
				<p className="text-primary-500 text-xs md:text-sm">Loading...</p>
			) : data && data.result.length > 0 ? (
				<div>
					<Permissions
						permissions={data.result}
						removePermission={(codename: string) => {
							setErrorType('single');
							const form = {
								permissions: data.result
									.filter((permission) => permission.codename !== codename)
									.map((permission) => permission.codename),
							};
							editPermissions({ id, form });
						}}
					/>
					{data.total > 0 && (
						<div className="pt-2 pb-5">
							<Pagination
								disabled={isFetching}
								onChange={(pageNo: number) => {
									const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
									offset !== value &&
										setOffset(value * DEFAULT_PAGINATION_SIZE);
								}}
								pageSize={DEFAULT_PAGINATION_SIZE}
								totalItems={data.total}
							/>
						</div>
					)}
				</div>
			) : (
				<p className="text-primary-500 text-xs md:text-sm">
					There are currently no private permissions for this user. Check the
					user&apos;s groups instead.
				</p>
			)}
			<Modal
				close={() => setModalVisible(false)}
				component={
					<PermissionsForm
						loading={editLoading}
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						initState={data?.result || permissions.result}
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