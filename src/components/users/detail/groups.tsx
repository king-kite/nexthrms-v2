import { Button } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPen } from 'react-icons/fa';

import GroupCards from './group-cards';
import UserGroupsForm from './user-groups-form';
import { Modal, TablePagination } from '../../common';
import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import { useEditUserGroupsMutation, useGetUserGroupsQuery } from '../../../store/queries/users';

function UserGroups({
	canEditUser,
	hideOtherModals,
}: {
	canEditUser: boolean;
	hideOtherModals?: () => void;
}) {
	const [errors, setErrors] = React.useState<{
		groups?: string;
		message?: string;
	}>();
	const [errorType, setErrorType] = React.useState<'single' | 'multiple'>('single');
	const [modalVisible, setModalVisible] = React.useState(false);
	const [limit, setLimit] = React.useState(5);
	const [offset, setOffset] = React.useState(0);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { close: closeAlertModal } = useAlertModalContext();

	const { data, isLoading, isFetching } = useGetUserGroupsQuery({ id });

	const groups = React.useMemo(() => {
		if (!data) return undefined;
		const result = data.result.slice(offset, limit + offset);
		return result;
	}, [data, limit, offset]);

	const { mutate: editGroups, isLoading: editLoading } = useEditUserGroupsMutation({
		onSuccess() {
			if (errorType === 'single') {
				closeAlertModal();
				showAlert({
					type: 'success',
					message: 'User was removed from the group successfully!',
				});
			} else {
				setModalVisible(false);
				showAlert({
					type: 'success',
					message: 'User groups were updated successfully!',
				});
			}
		},
		onError(err) {
			if (errorType === 'single') {
				closeAlertModal();
				showAlert({
					type: 'danger',
					message: err?.data?.groups || err.message,
				});
			} else {
				setErrors((prevState) =>
					prevState
						? {
								...prevState,
								groups: err?.data?.groups,
								message: err.message,
						  }
						: {
								groups: err?.data?.groups,
								message: err.message,
						  }
				);
			}
		},
	});

	return (
		<React.Fragment>
			{canEditUser && !isLoading && (
				<div className="flex flex-wrap items-center w-full lg:justify-end">
					<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaPen}
							rounded="rounded-xl"
							title="Update Groups"
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
			) : groups && groups.length > 0 ? (
				<div className="mt-3">
					<GroupCards
						groups={groups}
						removeGroup={
							!canEditUser
								? undefined
								: (groupId: string) => {
										if (!data) return;
										setErrorType('single');
										const form = {
											groups: data.result
												.filter((group) => group.id !== groupId)
												.map((group) => group.id),
										};
										editGroups({ id, form });
								  }
						}
					/>
					{(data?.total || groups.length) > 0 && (
						<TablePagination
							disabled={isFetching}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							pageSize={limit}
							onSizeChange={(size) => setLimit(size)}
							totalItems={data?.total || groups.length}
						/>
					)}
				</div>
			) : (
				<p className="text-primary-500 text-xs md:text-sm">
					There are currently no groups for this user. Check the user&apos;s permissions instead.
				</p>
			)}
			<Modal
				close={() => setModalVisible(false)}
				component={
					<UserGroupsForm
						loading={editLoading}
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						initState={data?.result}
						onSubmit={(form) => {
							editGroups({ id, form });
						}}
					/>
				}
				description="Select groups you want to this user to be apart"
				keepVisible
				title="Update User's Groups"
				visible={modalVisible}
			/>
		</React.Fragment>
	);
}

export default UserGroups;
