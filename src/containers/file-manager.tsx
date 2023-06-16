import { useRouter } from 'next/router';
import React from 'react';

import { Container, Modal } from '../components/common';
import {
	FileActions,
	Files,
	Form,
	QuickActions,
} from '../components/file-manager';
import {
	permissions,
	DEFAULT_MEDIA_PAGINAITON_SIZE,
	MEDIA_URL,
} from '../config';
import { useAlertContext, useAuthContext } from '../store/contexts';
import { useGetManagedFilesQuery } from '../store/queries';
import { GetManagedFilesResponseType } from '../types';
import { hasModelPermission } from '../utils';

function FileManager({
	files: initialData,
}: {
	files?: GetManagedFilesResponseType['data'];
}) {
	const [offset, setOffset] = React.useState(0);
	const [limit, setLimit] = React.useState(DEFAULT_MEDIA_PAGINAITON_SIZE);
	const [searchForm, setSearchForm] = React.useState<{
		search?: string;
		from?: string;
		to?: string;
	}>();
	const [modalVisible, setModalVisible] = React.useState(false);

	const { query } = useRouter();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [dir, setDir] = React.useState(MEDIA_URL);
	const [formType, setFormType] = React.useState<'file' | 'folder'>('file');

	const { type, uploadDir } = React.useMemo(() => {
		const type = query?.type?.toString() || null;

		const _split = dir.split(MEDIA_URL);
		// skip the last item in the split array if every item is empty i.e. 'media/media/' => ['', '', '']
		const skipLast = _split.every((item) => item === '');
		const uploadDir = _split.reduce(
			(acc: string, item: string, index: number) => {
				if (index === 0) return acc;
				// Last item and skipLast
				if (index === _split.length - 1 && skipLast) return acc;
				if (item === '') return acc + MEDIA_URL;
				return acc + item;
			},
			''
		);

		return {
			type,
			uploadDir,
		};
	}, [query, dir]);

	const [canCreate, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.managedfile.CREATE,
			  ])
			: false;
		// Added Object Level Permissions As Well
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.managedfile.VIEW,
			  ]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) =>
						perm.modelName === 'managed_files' && perm.permission === 'VIEW'
			  )
			: false;

		return [canCreate, canView];
	}, [authData]);

	const { data, isFetching, isLoading, refetch } = useGetManagedFilesQuery(
		{
			limit,
			offset,
			search: searchForm?.search,
			from: searchForm?.from,
			to: searchForm?.to,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get files!',
					type: 'danger',
				});
			},
		},
		{
			initialData: initialData ? () => initialData : undefined,
		}
	);

	return (
		<Container
			background="bg-white"
			disabledLoading={isLoading}
			heading="File Manager"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{type !== null && (
				<FileActions
					dir={dir}
					openModal={(type) => {
						setFormType(type);
						setModalVisible(true);
					}}
					setDir={setDir}
					showAction={type === 'storage'}
					uploadDir={uploadDir}
				/>
			)}

			{type === null && (
				<QuickActions
					openModal={(type) => {
						setFormType(type);
						setModalVisible(true);
					}}
					setDir={setDir}
				/>
			)}

			<Files
				data={data?.result}
				dir={dir}
				setDir={setDir}
				showStorage={type === 'storage'}
				type={type}
			/>
			<Modal
				close={() => setModalVisible(false)}
				keepVisible
				component={
					<Form
						directory={type === 'storage' ? uploadDir : undefined}
						onSuccess={() => {
							setModalVisible(false);
						}}
						type={formType}
					/>
				}
				description={`Add a new ${formType}`}
				title={formType === 'file' ? 'New File' : 'New Folder'}
				visible={modalVisible}
			/>
		</Container>
	);
}

export default FileManager;
