import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';
import { FaDownload } from 'react-icons/fa';

import { Container } from '../components/common';
import { FileActions, Files, QuickActions } from '../components/file-manager';
import {
	permissions,
	DEFAULT_MEDIA_PAGINAITON_SIZE,
	MEDIA_URL,
} from '../config';
import { useDebounce } from '../hooks';
import { useAlertContext, useAuthContext } from '../store/contexts';
import { useGetManagedFilesQuery } from '../store/queries/managed-files';
import { GetManagedFilesResponseType, ManagedFileType } from '../types';
import { hasModelPermission } from '../utils';

const DynamicButton = dynamic<any>(
	() => import('kite-react-tailwind').then((mod) => mod.Button),
	{ ssr: false }
);
const DynamicFileDetail = dynamic<any>(
	() => import('../components/file-manager/detail').then((mod) => mod.default),
	{ ssr: false }
);
const DynamicForm = dynamic<any>(
	() => import('../components/file-manager/form').then((mod) => mod.default),
	{ ssr: false }
);
const DynamicModal = dynamic<any>(
	() => import('../components/common/modal').then((mod) => mod.default),
	{ ssr: false }
);

const FileDetailContext = React.createContext<{
	showDetail: (file: ManagedFileType) => void;
} | null>(null);

export function useFileDetailContext() {
	return React.useContext(FileDetailContext) as {
		showDetail: (file: ManagedFileType | null) => void | null;
	};
}

function FileManager({
	files: initialData,
}: {
	files?: GetManagedFilesResponseType['data'];
}) {
	const [limit, setLimit] = React.useState(DEFAULT_MEDIA_PAGINAITON_SIZE);
	const [searchForm, setSearchForm] = React.useState<{
		search?: string;
		from?: string;
		to?: string;
	}>();
	const [modalVisible, setModalVisible] = React.useState(false);
	const [dir, setDir] = React.useState(MEDIA_URL);
	const [formType, setFormType] = React.useState<'file' | 'folder'>('file');
	const [fileDetail, setFileDetail] = React.useState<ManagedFileType | null>(
		null
	);

	const debouncedSearchForm = useDebounce(searchForm, 500);
	const { query } = useRouter();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

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
			offset: 0,
			search: debouncedSearchForm?.search,
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
			{data && data.result.length < data.total && (
				<div
					className={`flex justify-end py-2 w-full ${
						type === 'storage' ? 'sm:pb-5' : ''
					}`}
				>
					<div className="w-[11rem]">
						<DynamicButton
							bg="bg-transparent active:relative active:top-[2px] hover:bg-gray-50"
							border="border border-gray-400"
							color={isFetching ? 'text-gray-100' : 'text-gray-700'}
							disabled={isFetching}
							iconRight={FaDownload}
							iconSize="bottom-[0.5px] relative text-xs"
							onClick={() =>
								setLimit(
									(prevState) => prevState + DEFAULT_MEDIA_PAGINAITON_SIZE
								)
							}
							title={
								isFetching
									? 'Loading...'
									: `Loaded ${data.result.length}/${data.total}`
							}
						/>
					</div>
				</div>
			)}

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

			<FileDetailContext.Provider
				value={{
					showDetail: (file) => {
						setFileDetail(file);
						setModalVisible(true);
					},
				}}
			>
				<Files
					data={data?.result}
					dir={dir}
					loading={isFetching}
					searchForm={searchForm}
					setDir={setDir}
					setSearchForm={setSearchForm}
					showStorage={type === 'storage'}
					type={type}
				/>
			</FileDetailContext.Provider>
			<DynamicModal
				close={() => {
					setModalVisible(false);
					if (fileDetail) setFileDetail(null);
				}}
				keepVisible
				component={
					fileDetail ? (
						<DynamicFileDetail {...fileDetail} />
					) : (
						<DynamicForm
							directory={type === 'storage' ? uploadDir : undefined}
							onSuccess={() => {
								setModalVisible(false);
							}}
							type={formType}
						/>
					)
				}
				description={fileDetail ? undefined : `Add a new ${formType}`}
				title={
					fileDetail
						? undefined
						: formType === 'file'
						? 'New File'
						: 'New Folder'
				}
				visible={modalVisible}
			/>
		</Container>
	);
}

export default FileManager;
