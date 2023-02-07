import React from 'react';
import { FaTimes } from 'react-icons/fa';

import { useAlertModalContext } from '../../../store/contexts';
import { PermissionType } from '../../../types';

function Permissions({
	permissions,
	removePermission,
}: {
	permissions: PermissionType[];
	removePermission: (codename: string) => void;
}) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const removeSinglePermission = React.useCallback(
		(codename: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove Permission?',
				color: 'warning',
				message: 'Do you want to remove this permission from the group?',
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
							removePermission(codename);
						},
						title: 'yes',
					},
				],
			});
		},
		[openModal, close, removePermission, showLoader]
	);

	return (
		<div className="gap-4 grid grid-cols-1 md:gap-6 md:grid-cols-2">
			{permissions.map((permission, index) => (
				<div
					className="bg-gray-200 border border-gray-400 border-l-8 p-2 rounded-md lg:pl-4 lg:p-3"
					key={index}
				>
					<div className="flex items-start justify-between py-1 w-full">
						<h4 className="capitalize font-bold text-base text-gray-800 w-full md:text-lg">
							{permission.name.toLowerCase()}
						</h4>
						<div
							onClick={() => removeSinglePermission(permission.codename)}
							className="cursor-pointer duration-500 mx-4 p-2 rounded-full text-gray-700 text-xs transform transition-all hover:bg-white hover:scale-110 hover:text-gray-600 md:text-sm"
						>
							<FaTimes className="text-xs sm:text-sm" />
						</div>
					</div>
					{permission.description && (
						<p className="font-medium my-1 pr-2 text-gray-700 text-sm md:text-base">
							{permission.description}
						</p>
					)}
				</div>
			))}
		</div>
	);
}

export default Permissions;
