import React from 'react';

import { Container } from '../components/common';
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
			heading="File Manager"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{dir !== MEDIA_URL && (
				<p
					className="cursor-pointer text-secondary-500 text-xl hover:underline"
					onClick={() => {
						setDir((prevState) => {
							if (
								prevState !== MEDIA_URL &&
								prevState.startsWith(MEDIA_URL) &&
								prevState.includes('/')
							) {
								const splitDir = prevState.split('/');
								let newValue = splitDir
									.filter((value, index) => index < splitDir.length - 2)
									.join('/');

								// check the value ends with a '/'
								newValue = newValue.endsWith('/') ? newValue : newValue + '/';
								return newValue;
							} else {
								return MEDIA_URL;
							}
						});
					}}
				>
					Back
				</p>
			)}
			{displays.map((display, index) => (
				<p
					className="cursor-pointer text-primary-500 text-base hover:underline"
					onClick={
						display.type === 'folder'
							? () => setDir((prevState) => prevState + display.name + '/')
							: undefined
					}
					key={index}
				>
					{display.name}
				</p>
			))}
		</Container>
	);
}

export default FileManager;
