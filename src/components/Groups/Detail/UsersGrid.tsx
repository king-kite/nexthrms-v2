import { InputButton } from 'kite-react-tailwind';
import React from 'react';
import { FaSearch } from 'react-icons/fa';

import { PersonCard, TablePagination } from '../../common';
import { DEFAULT_IMAGE, USER_PAGE_URL } from '../../../config';
import { useAlertModalContext } from '../../../store/contexts';
import { GroupUserType } from '../../../types';

function UsersGrid({
	users: unFilteredUsers,
	paginate,
	removeUser,
}: {
	users: GroupUserType[];
	paginate?: {
		loading: boolean;
		totalItems: number;
		limit: number;
		setLimit: React.Dispatch<React.SetStateAction<number>>;
		offset: number;
		setOffset: React.Dispatch<React.SetStateAction<number>>;
	};
	removeUser: (id: string) => void;
}) {
	const [search, setSearch] = React.useState('');

	const users = React.useMemo(
		() =>
			unFilteredUsers.filter((user) => {
				const searchValue =
					`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
				if (searchValue.includes(search)) return user;
			}),
		[search, unFilteredUsers]
	);

	const { open: openModal, close, showLoader } = useAlertModalContext();

	const removeSingleUser = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove User?',
				color: 'warning',
				message: 'Do you want to remove this user from the group?',
				decisions: [
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						caps: true,
						onClick: close,
						title: 'no',
					},
					{
						bg: 'bg-yellow-600 hover:bg-yellow-500',
						caps: true,
						onClick: () => {
							showLoader();
							removeUser(id);
						},
						title: 'yes',
					},
				],
			});
		},
		[openModal, close, removeUser, showLoader]
	);

	return (
		<div>
			<div>
				<form
					className="flex items-center mb-6 mt-3 w-full lg:w-3/5"
					onSubmit={(e) => {
						e.preventDefault();
						setSearch(search);
					}}
				>
					<InputButton
						buttonProps={{
							caps: true,
							disabled: paginate?.loading || false,
							iconLeft: FaSearch,
							padding: 'pl-2 pr-4 py-[0.547rem]',
							title: 'Search',
							type: 'submit',
						}}
						inputProps={{
							bdrColor: 'border-primary-500',
							disabled: paginate?.loading || false,
							icon: FaSearch,
							onChange: ({ target: { value } }) =>
								setSearch(value.trim().toLowerCase()),
							placeholder: 'Search by name',
							rounded: 'rounded-l-lg',
							type: 'search',
						}}
					/>
				</form>
			</div>
			<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
				{users.map((user, index) => (
					<PersonCard
						key={index}
						bg="bg-gray-100"
						border="border-gray-300 border"
						name={user.firstName + ' ' + user.lastName}
						image={{ src: user.profile?.image || DEFAULT_IMAGE }}
						actions={[
							{
								bg: 'bg-white hover:bg-blue-100',
								border: 'border border-primary-500 hover:border-primary-600',
								color: 'text-primary-500',
								link: USER_PAGE_URL(user.id),
								title: 'view profile',
							},
							{
								bg: 'bg-white hover:bg-red-100',
								border: 'border border-red-500 hover:border-red-600',
								color: 'text-red-500',
								onClick: () => removeSingleUser(user.id),
								title: 'Remove',
							},
						]}
					/>
				))}
			</div>
			{paginate && paginate.totalItems > 0 && (
				<TablePagination
					disabled={paginate.loading || false}
					totalItems={paginate.totalItems}
					onChange={(pageNo: number) => {
						const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
						paginate.offset !== value &&
							paginate.setOffset(value * paginate.limit);
					}}
					onSizeChange={(size) => paginate.setLimit(size)}
					pageSize={paginate.limit}
				/>
			)}
		</div>
	);
}

export default UsersGrid;
