import { Button, ButtonDropdown } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt, FaPlus } from 'react-icons/fa';

import { ExportForm } from '../common';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

type TopbarProps = {
	openModal: (bulkForm?: boolean) => void;
	exportData?: {
		all: string;
		filtered: string;
	};
};

const Topbar = ({ openModal, exportData }: TopbarProps) => {
	const { data: authData } = useAuthContext();

	const [canCreate] = React.useMemo(() => {
		if (!authData) return [false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.attendance.CREATE]);
		return [canCreate];
	}, [authData]);

	return (
		<div className="flex flex-wrap gap-y-4 justify-end my-3 w-full sm:flex-row sm:items-center md:gap-4">
			{exportData && (
				<div className="w-full sm:w-[32%] md:w-1/4">
					<ButtonDropdown
						component={() => <ExportForm {...exportData} />}
						props={{
							caps: true,
							iconLeft: FaCloudDownloadAlt,
							margin: 'lg:mr-6',
							padding: 'px-3 py-2 md:px-6',
							rounded: 'rounded-xl',
							title: 'export',
						}}
					/>
				</div>
			)}
			{canCreate && (
				<>
					<div className="w-full sm:w-[32%] md:w-1/4">
						<Button
							iconLeft={FaPlus}
							margin="lg:mr-6"
							onClick={() => openModal(false)}
							padding="px-3 py-2 md:px-6"
							rounded="rounded-xl"
							title="Add Attendance"
						/>
					</div>
					<div className="w-full sm:w-[32%] md:w-1/4">
						<Button
							iconLeft={FaCloudUploadAlt}
							margin="lg:mr-6"
							onClick={() => openModal(true)}
							padding="px-3 py-2 md:px-6"
							rounded="rounded-xl"
							title="Bulk Import"
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default Topbar;
