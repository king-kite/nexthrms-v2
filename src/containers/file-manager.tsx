import { Breadcrumbs } from 'kite-react-tailwind';
import React from 'react';

import { Container } from '../components/common';
import { FileComponent, Folder } from '../components/file-manager';
import { permissions, DEFAULT_PAGINATION_SIZE, MEDIA_URL } from '../config';
import { useAlertContext, useAuthContext } from '../store/contexts';
import { useGetManagedFilesQuery } from '../store/queries';
import { GetManagedFilesResponseType, ManagedFileType } from '../types';
import { hasModelPermission } from '../utils';

type FileType = {
	name: string;
	type: 'file' | 'folder';
	data: ManagedFileType | null;
};

function FileManager({
	files: initialData,
}: {
	files?: GetManagedFilesResponseType['data'];
}) {
	const [offset, setOffset] = React.useState(0);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [searchForm, setSearchForm] = React.useState<{
		search?: string;
		from?: string;
		to?: string;
	}>();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [dir, setDir] = React.useState(MEDIA_URL);

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

	const { data, isFetching, refetch } = useGetManagedFilesQuery(
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

	const displays = React.useMemo(() => {
		if (!data) return [];

		// Get the files to show that should be in "dir" directory
		const showFiles = data.result.filter((file) => {
			// Get the location of the file
			const location =
				file.storageInfo?.location || file.storageInfo?.public_id || file.url;
			// Check if the file location starts with the dir
			if (location.startsWith(dir)) return file;
		});

		// Get the data/content to display on the screen
		const displays: FileType[] = showFiles.reduce((acc: FileType[], file) => {
			const location =
				file.storageInfo?.location || file.storageInfo?.public_id || file.url;
			// Split the current and forward locations out of the previous location
			const forwardLocationString = location.split(dir)[1];

			const forwardLocations = forwardLocationString.split('/');

			// if the forwardLocations length > 1 i.e. current location === folder else file

			// Get the current location
			const currentLocation = forwardLocations[0];

			const type = forwardLocations.length > 1 ? 'folder' : 'file';

			// Check if the currentLocation is already in the acc
			const found = acc.find(
				(item) => item.name === currentLocation && item.type === type
			);
			if (found) return acc;

			return [
				...acc,
				{
					name: currentLocation,
					type,
					data: type === 'folder' ? null : file,
				},
			];
		}, []);
		return displays;
	}, [data, dir]);

	return (
		<Container
			background="bg-white"
			heading="File Manager"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			<div className="my-3">
				<Breadcrumbs
					links={dir
						.split('/')
						.filter((i, m) => m < dir.split('/').length - 1)
						.map((value, index, arr) => {
							const isMedia = index === 0 && value === 'media';
							return {
								link: '#',
								title: isMedia ? '..' : value,
								renderAs: () => (
									<span
										onClick={() => {
											if (isMedia) setDir(MEDIA_URL);
											else {
												let location = arr
													.filter((a, j) => j <= index)
													.join('/');
												location = location.endsWith('/')
													? location
													: location + '/';
												setDir(location);
											}
										}}
										className={`cursor-pointer text-gray-500 transition-all ${
											isMedia
												? 'text-[23px] hover:scale-110 sm:text-[25px] md:text-[27px]'
												: 'text-sm hover:scale-105 sm:text-base md:text-lg'
										}`}
									>
										{isMedia ? '..' : value}
									</span>
								),
							};
						})}
				/>
			</div>
			<div className="gap-3 grid grid-cols-4 sm:gap-y-4 sm:grid-cols-6 md:gap-y-5 md:grid-cols-8 xl:grid-cols-9">
				{displays
					.sort((a, b) => {
						const aName = a.name.toLowerCase().trim();
						const bName = b.name.toLowerCase().trim();
						// Folder and File
						if (a.type === 'folder' && b.type === 'file') return -1;
						else if (a.type === 'file' && b.type === 'folder') return 1;

						// Folder and Folder
						if (a.type === 'folder' && b.type === 'folder')
							return aName < bName ? -1 : aName > bName ? 1 : 0;

						// File and File
						return aName < bName ? -1 : aName > bName ? 1 : 0;
					})
					.map((display, index) =>
						display.type === 'folder' ? (
							<Folder
								key={index}
								name={display.name}
								onClick={() =>
									setDir((prevState) => prevState + display.name + '/')
								}
							/>
						) : (
							display.type === 'file' &&
							display.data && <FileComponent key={index} {...display.data} />
						)
					)}
			</div>
		</Container>
	);
}

export default FileManager;
