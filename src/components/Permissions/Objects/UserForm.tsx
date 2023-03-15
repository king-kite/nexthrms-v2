import { PermissionObjectChoices } from '@prisma/client';
import { Alert, Button, Checkbox, Input, Select2 } from 'kite-react-tailwind';
import Image from 'next/image';
import React from 'react';
import { FaTimes } from 'react-icons/fa';

import { DEFAULT_IMAGE, DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetUsersQuery } from '../../../store/queries';
import { ObjPermUser } from '../../../types';
import { handleAxiosErrors } from '../../../validators';

export type FormType = {
	permissions: {
		name: PermissionObjectChoices;
		value: boolean;
	}[];
	users: string[];
};

const defaultValue: FormType = {
	permissions: [
		{
			name: 'DELETE',
			value: false,
		},
		{
			name: 'EDIT',
			value: false,
		},
		{
			name: 'VIEW',
			value: false,
		},
	],
	users: [],
};

function handleDataError(err: unknown): string | undefined {
	if (err) {
		const error = handleAxiosErrors(err);
		if (error) return error?.message;
	}
	return undefined;
}

function UserForm({
	editMode,
	error,
	loading,
	initState,
	initUsers = [],
	onSubmit,
}: {
	editMode: boolean;
	error?: string;
	loading: boolean;
	initState?: FormType;
	initUsers?: ObjPermUser[];
	onSubmit: (form: FormType) => void;
}) {
	const [errorMessage, setErrorMessage] = React.useState(error);
	const formRef = React.useRef<HTMLFormElement | null>(null);
	const [form, setForm] = React.useState(initState || defaultValue);
	const [selectedUsers, setSelectedUsers] =
		React.useState<ObjPermUser[]>(initUsers);

	const [search, setSearch] = React.useState('');
	const [usrLimit, setUsrLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const users = useGetUsersQuery(
		{ limit: usrLimit, offset: 0, search },
		{ enabled: !editMode }
	);

	const usersError = handleDataError(users.error);

	return (
		<div className="p-4">
			{(error || errorMessage) && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={error || errorMessage}
						onClose={() => setErrorMessage(undefined)}
					/>
				</div>
			)}
			{!editMode && (
				<div className="gap-3 mb-1 pb-2 w-full md:flex md:items-end">
					<div className="my-2 py-2 w-full md:w-1/2">
						<Input
							btn={{
								caps: true,
								disabled:
									users.isFetching ||
									(users.data && users.data.result.length >= users.data.total),
								onClick: () => {
									if (
										users.data &&
										users.data.total > users.data.result.length
									) {
										setUsrLimit(
											(prevState) => prevState + DEFAULT_PAGINATION_SIZE
										);
									}
								},
								title: users.isFetching
									? 'loading...'
									: users.data && users.data.result.length >= users.data.total
									? 'loaded all'
									: 'load more',
							}}
							label="Search Users"
							height="h-[36px]"
							padding="px-3"
							rounded="rounded-md"
							required={false}
							onChange={({ target: { value } }) => setSearch(value)}
							placeholder="Search by first name, last name or email"
						/>
					</div>
					<div className="my-2 py-2 w-full md:w-1/2">
						<Select2
							bdrColor={usersError ? 'border-red-600' : 'border-gray-300'}
							height="min-h-[36px]"
							padding="pl-3 pr-10 py-2"
							rounded="rounded-md"
							shadow="shadow-lg"
							disabled={users.isFetching}
							onSelect={({ value }) => {
								// Check if the user with this value as id is selected
								const selected = selectedUsers.find(
									(item) => item.id === value
								);
								if (selected) {
									// Remove from selection
									setForm((prevState) => ({
										...prevState,
										users: prevState.users.filter((item) => item !== value),
									}));
									setSelectedUsers((prevState) =>
										prevState.filter((item) => item.id !== value)
									);
								} else {
									// Add to selection
									// First find the user to get more info
									const user = users.data?.result.find(
										(item) => item.id === value
									);
									if (user) {
										setForm((prevState) => ({
											...prevState,
											users: [...prevState.users, value],
										}));
										setSelectedUsers((prevState) => [
											...prevState,
											{
												id: user.id,
												firstName: user.firstName,
												lastName: user.lastName,
												email: user.email,
												profile: user.profile
													? {
															image: user.profile.image,
													  }
													: null,
											},
										]);
									}
								}
							}}
							error={usersError}
							options={
								users.data
									? users.data.result
											.sort((a, b) => {
												const aName: string =
													`${a.firstName} ${a.lastName}`.toLowerCase();
												const bName: string =
													`${b.firstName} ${b.lastName}`.toLowerCase();
												return aName < bName ? -1 : aName > bName ? 1 : 0;
											})
											.map((user) => ({
												image: user.profile?.image || DEFAULT_IMAGE,
												title: `${user.firstName} ${user.lastName}`,
												value: user.id,
											}))
									: []
							}
							multiple
							value={form.users}
							label="Select Users"
							placeholder="Select Users"
						/>
					</div>
				</div>
			)}
			<form
				ref={formRef}
				onSubmit={(e) => {
					e.preventDefault();
					const data = {
						...form,
						permissions: form.permissions.map((permission) => ({
							name: permission.name,
							value: formRef.current
								? formRef.current[permission.name.toLowerCase()].checked ||
								  false
								: false,
						})),
					};
					if (
						!editMode &&
						data.permissions.every((perm) => perm.value === false)
					) {
						setErrorMessage('Please select at least one permission!');
					} else if (data.users.length <= 0) {
						setErrorMessage('Please select at leaset one user!');
					} else onSubmit(data);
				}}
			>
				<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
					<div className="flex flex-wrap items-center w-full md:col-span-2">
						<div className="my-1 w-1/3">
							<Checkbox
								defaultChecked={
									form.permissions.find(
										(permission) => permission.name === 'VIEW'
									)?.value || false
								}
								label="VIEW"
								labelColor="text-gray-500"
								labelSize="text-sm tracking-wider md:text-base"
								name="view"
								required={false}
								textSize="text-sm md:text-base"
							/>
						</div>
						<div className="my-1 w-1/3">
							<Checkbox
								defaultChecked={
									form.permissions.find(
										(permission) => permission.name === 'EDIT'
									)?.value || false
								}
								label="EDIT"
								labelColor="text-gray-500"
								labelSize="text-sm tracking-wider md:text-base"
								name="edit"
								required={false}
								textSize="text-sm md:text-base"
							/>
						</div>
						<div className="my-1 w-1/3">
							<Checkbox
								defaultChecked={
									form.permissions.find(
										(permission) => permission.name === 'DELETE'
									)?.value || false
								}
								label="DELETE"
								labelColor="text-gray-500"
								labelSize="text-sm tracking-wider md:text-base"
								name="delete"
								required={false}
								textSize="text-sm md:text-base"
							/>
						</div>
					</div>
					{selectedUsers.length <= 0 ? (
						<p className="font-medium my-1 pr-2 text-gray-700 text-sm md:text-base">
							No users selected
						</p>
					) : (
						selectedUsers
							.sort((a, b) => {
								const aName: string =
									`${a.firstName} ${a.lastName}`.toLowerCase();
								const bName: string =
									`${b.firstName} ${b.lastName}`.toLowerCase();
								return aName < bName ? -1 : aName > bName ? 1 : 0;
							})
							.map((user, index) => (
								<UserTag
									key={index}
									removeUser={() => {
										setSelectedUsers((prevState) =>
											prevState.filter((item) => item.id !== user.id)
										);
										setForm((prevState) => ({
											...prevState,
											users: prevState.users.filter((item) => item !== user.id),
										}));
									}}
									name={`${user.firstName} ${user.lastName}`}
									email={user.email}
									image={user.profile?.image || DEFAULT_IMAGE}
								/>
							))
					)}
				</div>
				<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
					<div className="w-full sm:w-1/2 md:w-1/3">
						<Button
							disabled={loading}
							title={
								loading
									? 'Updating User Record Permissions...'
									: 'Set User Record Permissions'
							}
							type="submit"
						/>
					</div>
				</div>
			</form>
		</div>
	);
}

function UserTag({
	name,
	email,
	image,
	removeUser,
}: {
	name: string;
	email: string;
	image: string;
	removeUser: () => void;
}) {
	return (
		<div className="bg-gray-200 border border-gray-400 border-l-8 p-1 flex items-start justify-between rounded-md lg:pl-4 lg:p-3">
			<div className="h-[30px] mt-2 mr-2 relative rounded-full w-[30px]">
				<Image
					layout="fill"
					src={image}
					className="rounded-full"
					placeholder="blur"
					blurDataURL={DEFAULT_IMAGE}
					alt={name}
				/>
			</div>
			<div style={{ width: `calc(100% - 30px)` }}>
				<div className="flex items-center justify-between py-1 w-full">
					<h4 className="capitalize font-bold text-base text-gray-800 w-full md:text-lg">
						{name}
					</h4>
					<div
						onClick={removeUser}
						className="cursor-pointer duration-500 mx-4 p-2 rounded-full text-gray-700 text-xs transform transition-all hover:bg-white hover:scale-110 hover:text-gray-600 md:text-sm"
					>
						<FaTimes className="text-xs sm:text-sm" />
					</div>
				</div>
				<p className="font-medium pr-2 text-gray-700 text-sm md:text-base">
					{email}
				</p>
			</div>
		</div>
	);
}

export default UserForm;
