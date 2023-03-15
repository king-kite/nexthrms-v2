import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import { FC, useRef, useMemo } from 'react';
import { FaSearch, FaPlus, FaCloudDownloadAlt } from 'react-icons/fa';

import { ExportForm } from '../common';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

type TopbarProps = {
	openModal: () => void;
	loading: boolean;
	onSubmit: (search: string) => void;
	exportData: (type: 'csv' | 'excel', filtered: boolean) => void;
	exportLoading?: boolean;
};

const Topbar: FC<TopbarProps> = ({
	loading,
	openModal,
	onSubmit,
	exportData,
	exportLoading,
}) => {
	const searchRef = useRef<HTMLInputElement | null>(null);

	const { data: authData } = useAuthContext();

	const [canCreate, canExport] = useMemo(() => {
		if (!authData) return [false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.holiday.CREATE]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.holiday.EXPORT]);
		return [canCreate, canExport];
	}, [authData]);

	return (
		<div className="flex flex-col my-2 w-full lg:flex-row lg:items-center">
			<form
				className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
				onSubmit={(e) => {
					e.preventDefault();
					if (searchRef.current) onSubmit(searchRef.current.value);
				}}
			>
				<InputButton
					buttonProps={{
						disabled: loading,
						iconLeft: FaSearch,
						// padding: 'pl-2 pr-4 py-[0.545rem]',
						title: 'Search',
						type: 'submit',
					}}
					inputProps={{
						// bdrColor: 'border-primary-500',
						disabled: loading,
						icon: FaSearch,
						onChange: ({ target: { value } }) => {
							if (!value || value === '') onSubmit('');
						},
						placeholder: 'Search holiday by name...',
						rounded: 'rounded-l-lg',
						type: 'search',
					}}
					ref={searchRef}
				/>
			</form>
			{canCreate && (
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
					<Button
						caps
						iconLeft={FaPlus}
						onClick={openModal}
						margin="lg:mr-6"
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title="add holiday"
					/>
				</div>
			)}
			{canExport && (
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-0 lg:pl-4 xl:pl-5 xl:w-1/4">
					<ButtonDropdown
						component={() => (
							<ExportForm loading={exportLoading} onSubmit={exportData} />
						)}
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
		</div>
	);
};

export default Topbar;
