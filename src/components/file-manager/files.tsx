import { ButtonDropdown, Input } from 'kite-react-tailwind';
import React from 'react';
import { FaCalendar, FaSearch } from 'react-icons/fa';

import { FileEmpty } from './box-items';
import { getFileType } from './file';
import FilterDropdownForm from './filter-date';
import FileStorage from './file-storage';
import FileTable from './table';
import { TablePagination } from '../common';
import { DEFAULT_PAGINATION_SIZE, MEDIA_HIDDEN_FILE_NAME } from '../../config';
import { ManagedFileType } from '../../types';

function Files({
	data = [],
	dir,
	loading,
	searchForm,
	setDir,
	setSearchForm,
	showStorage,
	type,
}: {
	data?: ManagedFileType[];
	dir: string;
	loading: boolean;
	searchForm?: {
		from?: string;
		to?: string;
		search?: string;
	};
	setDir: React.Dispatch<React.SetStateAction<string>>;
	setSearchForm: React.Dispatch<
		React.SetStateAction<
			| {
					from?: string;
					to?: string;
					search?: string;
			  }
			| undefined
		>
	>;
	showStorage: boolean;
	type: string | null;
}) {
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);

	const { files, total, title } = React.useMemo(() => {
		const title = !type ? 'recent' : type === 'all' ? 'all' : `${type}s`;

		if (!data) return { files: [], title };

		let files = data.filter((file) => {
			if (
				file.name.includes(MEDIA_HIDDEN_FILE_NAME) ||
				file.url.includes(MEDIA_HIDDEN_FILE_NAME)
			)
				return false;
			return true;
		});

		// recent
		if (type === null) {
			// i.e. Home/File Dashboard Route
			files = files.slice(0, 20);
		} else if (type !== null && ['audio', 'image', 'video'].includes(type)) {
			// audio, image, video
			files = files.filter((file) => {
				const fileType = getFileType(file.type, file.url, file.name);
				if (type === fileType) return true;
				return false;
			});
		} else if (type === 'document') {
			// files e.g. word, zip, pdf
			// if file is not an audio, image, video
			files = files.filter((file) => {
				const fileType = getFileType(file.type, file.url, file.name);
				if (!['audio', 'image', 'video'].includes(fileType)) return true;
				return false;
			});
		}

		const total = files.length;
		if (type !== 'storage') {
			files = files.slice(offset, limit);
		}

		return { files, title, total };
	}, [data, type, limit, offset]);

	if (showStorage) {
		if (!data || data.length <= 0) return <FileEmpty />;
		return <FileStorage data={data} dir={dir} setDir={setDir} />;
	}

	return (
		<div className="my-2 md:my-4">
			<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
				{title}
			</h3>
			<div className="bg-gray-200 h-[1px] my-5 w-full">
				<div className="bg-primary-500 h-[1px] w-1/5" />
			</div>
			<div className="my-3 py-2">
				<div className="flex flex-wrap items-end py-2 w-full sm:mb-2 md:mb-4">
					<div className="mb-2 w-full sm:mb-0 sm:w-1/2">
						<Input
							icon={FaSearch}
							label="Search"
							onChange={({ target: { value } }) => {
								setSearchForm((prevState) => ({
									...prevState,
									search: value,
								}));
							}}
							placeholder="Search by file name or by user..."
							required={false}
							rounded="rounded"
							type="search"
							value={searchForm?.search || ''}
						/>
					</div>
					<div className="my-2 w-full sm:mx-4 sm:my-0 sm:w-1/3 lg:w-1/4">
						<ButtonDropdown
							component={() => (
								<FilterDropdownForm
									searchForm={searchForm}
									setSearchForm={setSearchForm}
									loading={loading}
								/>
							)}
							props={{
								iconLeft: FaCalendar,
								margin: 'lg:mr-6',
								padding: 'px-3 py-2 md:px-6',
								rounded: 'rounded',
								title: 'Filter by Date',
							}}
						/>
					</div>
				</div>
				<FileTable files={files} />
				{total && total > 0 && (
					<TablePagination
						disabled={loading}
						totalItems={total}
						onChange={(pageNo: number) => {
							const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
							offset !== value && setOffset(value * limit);
						}}
						onSizeChange={(size) => setLimit(size)}
						pageSize={limit}
					/>
				)}
			</div>
		</div>
	);
}

export default Files;
