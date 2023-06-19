import { Button, InfoComp, Input } from 'kite-react-tailwind';
import React from 'react';
import { FaCheck, FaPen, FaTrash } from 'react-icons/fa';

import { getExtension, getFileType } from './file';
import { DEFAULT_IMAGE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useDeleteManagedFileMutation,
	useGetUserObjectPermissionsQuery,
} from '../../store/queries';
import { ManagedFileType } from '../../types';
import { getStringDateTime } from '../../utils';

function Detail(file: ManagedFileType) {
	const [edit, setEdit] = React.useState(false);
	const [name, setName] = React.useState(file.name);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { type, extension } = React.useMemo(() => {
		return {
			extension: getExtension(file.url) || '------',
			type: getFileType(file.type, file.url, file.name),
		};
	}, [file]);

	const { data } = useGetUserObjectPermissionsQuery({
		modelName: 'managed_files',
		objectId: file.id,
		onError({ message }) {
			open({
				type: 'danger',
				message,
			});
		},
	});

	const [canEdit, canDelete] = React.useMemo(() => {
		return [
			authData?.isSuperUser || data?.edit,
			authData?.isSuperUser || data?.delete,
		];
	}, [authData, data]);

	const { deleteFile } = useDeleteManagedFileMutation();

	return (
		<div>
			{(canEdit || canDelete) && (
				<div className="flex items-center justify-end gap-4 my-3 w-full">
					{canDelete && (
						<div className="w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								bg="bg-red-600 hover:bg-red-500"
								iconLeft={FaTrash}
								onClick={() => deleteFile(file.id)}
								padding="px-4 py-2 sm:py-3"
								title="Delete"
							/>
						</div>
					)}
				</div>
			)}
			<InfoComp
				infos={[
					{
						component: () =>
							edit && canEdit ? (
								<form
									className="flex items-start justify-between"
									onSubmit={(e) => {
										e.preventDefault();
										setEdit(false);
									}}
								>
									<div className="pr-2 w-full">
										<Input
											onChange={({ target: { value } }) => setName(value)}
											value={name}
										/>
									</div>
									<button
										onClick={() => setEdit((prevState) => !prevState)}
										className="cursor-pointer duration-500 inline-block p-2 rounded-full text-primary-500 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
										type="submit"
									>
										<FaCheck className="text-xs sm:text-sm" />
									</button>
								</form>
							) : (
								<div className="flex items-start justify-between">
									<span className="text-sm text-gray-700 sm:mt-0 md:text-base">
										{file.name}
									</span>
									{canEdit && (
										<div
											onClick={() => setEdit((prevState) => !prevState)}
											className="cursor-pointer duration-500 p-2 rounded-full text-primary-500 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
										>
											<FaPen className="text-xs sm:text-sm" />
										</div>
									)}
								</div>
							),
						title: 'Name',
						value: '',
					},
					{
						title: 'Size',
						value: file.size,
					},
					{
						title: 'Type',
						value: type,
					},
					{
						title: 'Extension',
						value: extension,
					},
					{
						title: 'Label',
						value: file.profile
							? 'PROFILE'
							: file.projectFile
							? 'PROJECT'
							: '-----',
						type: 'badge',
						options: {
							bg: file.projectFile
								? 'warning'
								: file.profile
								? 'success'
								: 'info',
						},
					},
					{
						title: 'User',
						value: file.user
							? file.user.firstName + ' ' + file.user.lastName
							: '----',
					},
					{
						title: 'User Email Address',
						value: file.user ? file.user.email : '----',
					},
					{
						title: 'User Image',
						type: 'image',
						value: {
							src: file.user?.profile?.image?.url || DEFAULT_IMAGE,
							alt: file.user
								? file.user.firstName + ' ' + file.user.lastName
								: '----',
						},
					},
					{
						title: 'Date Modified',
						value: getStringDateTime(file.updatedAt),
					},
				]}
				description="Displays detailed information of this file."
				title="File Information"
			/>
		</div>
	);
}

export default Detail;
