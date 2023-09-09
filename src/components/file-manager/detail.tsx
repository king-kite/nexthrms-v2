import { Button, InfoComp, Input } from 'kite-react-tailwind';
import React from 'react';
import { FaCheck, FaPen, FaTrash } from 'react-icons/fa';

import { getExtension, getFileType } from './file';
import { DEFAULT_IMAGE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useEditManagedFileMutation,
	useDeleteManagedFileMutation,
} from '../../store/queries/managed-files';
import { useGetUserObjectPermissionsQuery } from '../../store/queries/permissions';
import { ManagedFileType } from '../../types';
import { getByteSize, getStringDateTime } from '../../utils';

function Detail(data: ManagedFileType) {
	const [detail, setDetail] = React.useState<ManagedFileType>();

	const file = React.useMemo(() => {
		if (detail) return detail;
		return data;
	}, [data, detail]);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { type, extension } = React.useMemo(() => {
		return {
			extension: getExtension(file.location) || '------',
			type: getFileType(file.type, file.location, file.name),
		};
	}, [file]);

	const { data: objPerm } = useGetUserObjectPermissionsQuery({
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
		return [authData?.isSuperUser || objPerm?.edit, authData?.isSuperUser || objPerm?.delete];
	}, [authData, objPerm]);

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
						component: () => (
							<NameComponent
								showDetail={setDetail}
								canEdit={canEdit}
								id={file.id}
								name={file.name}
							/>
						),
						title: 'Name',
						value: '',
					},
					{
						title: 'Size',
						value: file.size ? getByteSize(file.size) : '----',
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
						value: file.profile ? 'PROFILE' : file.projectFile ? 'PROJECT' : '-----',
						type: 'badge',
						options: {
							bg: file.projectFile ? 'warning' : file.profile ? 'success' : 'info',
						},
					},
					{
						title: 'User',
						value: file.user ? file.user.firstName + ' ' + file.user.lastName : '----',
					},
					{
						title: 'User Email Address',
						value: file.user ? file.user.email : '----',
					},
					{
						title: 'User Image',
						type: 'image',
						value: {
							src: file.user?.profile?.image?.location || DEFAULT_IMAGE,
							alt: file.user ? file.user.firstName + ' ' + file.user.lastName : '----',
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

function NameComponent({
	canEdit,
	id: fileId,
	name: fileName,
	showDetail,
}: {
	canEdit?: boolean;
	id: string;
	name: string;
	showDetail: (detail: ManagedFileType) => void;
}) {
	const [edit, setEdit] = React.useState(false);

	if (edit && canEdit)
		return (
			<NameForm
				fileId={fileId}
				originalFileName={fileName}
				onSuccess={(data) => {
					setEdit(false);
					if (data) showDetail(data);
				}}
			/>
		);
	return (
		<div className="flex items-start justify-between">
			<span className="text-sm text-gray-700 sm:mt-0 md:text-base">{fileName}</span>
			{canEdit && (
				<div
					onClick={() => setEdit((prevState) => !prevState)}
					className="cursor-pointer duration-500 p-2 rounded-full text-primary-500 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
				>
					<FaPen className="text-xs sm:text-sm" />
				</div>
			)}
		</div>
	);
}

function NameForm({
	fileId,
	originalFileName,
	onSuccess,
}: {
	fileId: string;
	originalFileName: string;
	onSuccess: (detail?: ManagedFileType) => void;
}) {
	const [name, setName] = React.useState(originalFileName);
	const [error, setError] = React.useState('');

	const { mutate, isLoading } = useEditManagedFileMutation({
		onSuccess(data) {
			onSuccess(data);
		},
		onError({ message }) {
			setError(message);
		},
	});

	return (
		<form
			className="flex items-start justify-between"
			onSubmit={(e) => {
				e.preventDefault();
				if (error) setError('');
				const value = name.trim();
				if (value !== '') {
					if (value === originalFileName) onSuccess();
					else mutate({ id: fileId, data: { name: value } });
				}
			}}
		>
			<div className="pr-2 w-full">
				<Input
					disabled={isLoading}
					error={error}
					onChange={({ target: { value } }) => {
						if (error) setError('');
						setName(value);
					}}
					value={name}
				/>
			</div>
			<button
				disabled={isLoading}
				className={`${
					isLoading
						? 'bg-gray-500 text-gray-50'
						: 'text-primary-500 hover:bg-gray-200 hover:scale-110 hover:text-gray-600'
				} cursor-pointer duration-500 inline-block p-2 rounded-full text-xs transform transition-all md:text-sm`}
				type="submit"
			>
				<FaCheck className="text-xs sm:text-sm" />
			</button>
		</form>
	);
}

export default Detail;
