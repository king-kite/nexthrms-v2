import { Button } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPen } from 'react-icons/fa';

import GroupCards from './GroupCards';
import UserGroupsForm from './UserGroupsForm';
import { Modal, TablePagination } from '../../common';
import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import {
	useEditUserGroupsMutation,
	useGetUserGroupsQuery,
} from '../../../store/queries';
import { UserGroupType } from '../../../types';

function UserGroups({
	canEditUser,
	groups,
	hideOtherModals,
}: {
	canEditUser: boolean;
	groups: {
		total: number;
		result: UserGroupType[];
	};
	hideOtherModals: () => void;
}) {
	const [errors, setErrors] = React.useState<{
		groups?: string;
		message?: string;
	}>();
	const [errorType, setErrorType] = React.useState<'single' | 'multiple'>(
		'single'
	);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { close: closeAlertModal } = useAlertModalContext();

	const { data, isLoading, isFetching } = useGetUserGroupsQuery(
		{
			id,
			limit,
			offset,
			search: '',
		},
		{
			initialData() {
				return groups;
			},
		}
	);

	const { mutate: editGroups, isLoading: editLoading } =
		useEditUserGroupsMutation({
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
				<div className="mt-3">
					<GroupCards
						groups={data.result}
						removeGroup={
							!canEditUser
								? undefined
								: (groupId: string) => {
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
					{data.total > 0 && (
						<TablePagination
							disabled={isFetching}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							pageSize={limit}
							onSizeChange={(size) => setLimit(size)}
							totalItems={data.total}
						/>
					)}
				</div>
			) : (
				<p className="text-primary-500 text-xs md:text-sm">
					There are currently no groups for this user. Check the user&apos;s
					permissions instead.
				</p>
			)}
			<Modal
				close={() => setModalVisible(false)}
				component={
					<UserGroupsForm
						loading={editLoading}
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						initState={data?.result || groups.result}
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
