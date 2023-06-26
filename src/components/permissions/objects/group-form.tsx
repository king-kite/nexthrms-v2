import { PermissionObjectChoices } from '@prisma/client';
import { Alert, Button, Checkbox, Input, Select2 } from 'kite-react-tailwind';
import React from 'react';
import { FaTimes } from 'react-icons/fa';

import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import { useGetGroupsQuery } from '../../../store/queries/permissions';
import { ObjPermGroupType } from '../../../types';
import { handleAxiosErrors } from '../../../validators';

export type FormType = {
	permissions: {
		name: PermissionObjectChoices;
		value: boolean;
	}[];
	groups: string[];
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
	groups: [],
};

function handleDataError(err: unknown): string | undefined {
	if (err) {
		const error = handleAxiosErrors(err);
		if (error) return error?.message;
	}
	return undefined;
}

function GroupForm({
	editMode,
	error,
	loading,
	initState,
	initGroups = [],
	onSubmit,
}: {
	editMode: boolean;
	error?: string;
	loading: boolean;
	initState?: FormType;
	initGroups?: ObjPermGroupType[];
	onSubmit: (form: FormType) => void;
}) {
	const [errorMessage, setErrorMessage] = React.useState(error);
	const formRef = React.useRef<HTMLFormElement | null>(null);
	const [form, setForm] = React.useState(initState || defaultValue);
	const [selectedGroups, setSelectedGroups] =
		React.useState<ObjPermGroupType[]>(initGroups);

	const [search, setSearch] = React.useState('');
	const [usrLimit, setUsrLimit] = React.useState(DEFAULT_PAGINATION_SIZE);

	const groups = useGetGroupsQuery(
		{ limit: usrLimit, offset: 0, search },
		{ enabled: !editMode }
	);

	const groupsError = handleDataError(groups.error);

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
									groups.isFetching ||
									(groups.data &&
										groups.data.result.length >= groups.data.total),
								onClick: () => {
									if (
										groups.data &&
										groups.data.total > groups.data.result.length
									) {
										setUsrLimit(
											(prevState) => prevState + DEFAULT_PAGINATION_SIZE
										);
									}
								},
								title: groups.isFetching
									? 'loading...'
									: groups.data &&
									  groups.data.result.length >= groups.data.total
									? 'loaded all'
									: 'load more',
							}}
							label="Search Groups"
							height="h-[36px]"
							padding="px-3"
							rounded="rounded-md"
							required={false}
							onChange={({ target: { value } }) => setSearch(value)}
							placeholder="Search by name"
						/>
					</div>
					<div className="my-2 py-2 w-full md:w-1/2">
						<Select2
							bdrColor={groupsError ? 'border-red-600' : 'border-gray-300'}
							disabled={groups.isFetching}
							height="min-h-[36px]"
							rounded="rounded-md"
							padding="pl-3 pr-10 py-2"
							onSelect={({ value }) => {
								// Check if the group with this value as id is selected
								const selected = selectedGroups.find(
									(item) => item.id === value
								);
								if (selected) {
									// Remove from selection
									setForm((prevState) => ({
										...prevState,
										groups: prevState.groups.filter((item) => item !== value),
									}));
									setSelectedGroups((prevState) =>
										prevState.filter((item) => item.id !== value)
									);
								} else {
									// Add to selection
									// First find the group to get more info
									const group = groups.data?.result.find(
										(item) => item.id === value
									);
									if (group) {
										setForm((prevState) => ({
											...prevState,
											groups: [...prevState.groups, value],
										}));
										setSelectedGroups((prevState) => [
											...prevState,
											{
												id: group.id,
												name: group.name,
											},
										]);
									}
								}
							}}
							error={groupsError}
							options={
								groups.data
									? groups.data.result
											.sort((a, b) => {
												const aName: string = `${a.name}`.toLowerCase();
												const bName: string = `${b.name}`.toLowerCase();
												return aName < bName ? -1 : aName > bName ? 1 : 0;
											})
											.map((group) => ({
												title: group.name,
												value: group.id,
											}))
									: []
							}
							multiple
							value={form.groups}
							label="Select Groups"
							placeholder="Select Groups"
							shadow="shadow-lg"
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
					} else if (data.groups.length <= 0) {
						setErrorMessage('Please select at leaset one group!');
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
					{selectedGroups.length <= 0 ? (
						<p className="font-medium my-1 pr-2 text-gray-700 text-sm md:text-base">
							No groups selected
						</p>
					) : (
						selectedGroups
							.sort((a, b) => {
								const aName: string = `${a.name}`.toLowerCase();
								const bName: string = `${b.name}`.toLowerCase();
								return aName < bName ? -1 : aName > bName ? 1 : 0;
							})
							.map((group, index) => (
								<GroupTag
									key={index}
									removeGroup={() => {
										setSelectedGroups((prevState) =>
											prevState.filter((item) => item.id !== group.id)
										);
										setForm((prevState) => ({
											...prevState,
											groups: prevState.groups.filter(
												(item) => item !== group.id
											),
										}));
									}}
									name={group.name}
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
									? 'Updating Group Record Permissions...'
									: 'Set Group Record Permissions'
							}
							type="submit"
						/>
					</div>
				</div>
			</form>
		</div>
	);
}

function GroupTag({
	name,
	removeGroup,
}: {
	name: string;
	removeGroup: () => void;
}) {
	return (
		<div className="bg-gray-200 border border-gray-400 border-l-8 p-1 rounded-md lg:pl-4 lg:p-3">
			<div className="flex items-center justify-between py-1 w-full">
				<h4 className="capitalize font-bold text-base text-gray-800 w-full md:text-lg">
					{name}
				</h4>
				<div
					onClick={removeGroup}
					className="cursor-pointer duration-500 mx-4 p-2 rounded-full text-gray-700 text-xs transform transition-all hover:bg-white hover:scale-110 hover:text-gray-600 md:text-sm"
				>
					<FaTimes className="text-xs sm:text-sm" />
				</div>
			</div>
		</div>
	);
}

export default GroupForm;
