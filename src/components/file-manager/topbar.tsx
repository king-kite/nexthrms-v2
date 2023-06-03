import { Button } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaFileUpload,
	FaFolderPlus,
} from 'react-icons/fa';

import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

function Topbar() {
	const { data: authData } = useAuthContext();

	const [canCreate, canExport] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.managedfile.CREATE,
			  ])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.managedfile.EXPORT,
			  ])
			: false;

		return [canCreate, canExport];
	}, [authData]);

	return (
		<div className="flex flex-wrap items-center justify-end my-3 w-full">
			{canCreate && (
				<>
					<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaFileUpload}
							rounded="rounded-xl"
							title="New File"
						/>
					</div>
					<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaFolderPlus}
							rounded="rounded-xl"
							title="New Folder"
						/>
					</div>
					<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaCloudDownloadAlt}
							rounded="rounded-xl"
							title="Import"
						/>
					</div>
				</>
			)}
			{canExport && (
				<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
					<Button
						iconLeft={FaCloudUploadAlt}
						rounded="rounded-xl"
						title="Export"
					/>
				</div>
			)}
		</div>
	);
}

export default Topbar;
