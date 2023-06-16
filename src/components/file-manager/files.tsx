import React from 'react';

import { FileEmpty } from './box-items';
import { getFileType } from './file';
import FileStorage from './file-storage';
import FileTable from './table';
import { MEDIA_HIDDEN_FILE_NAME } from '../../config';
import { ManagedFileType } from '../../types';

function Files({
	data = [],
	dir,
	setDir,
	showStorage,
	type,
}: {
	data?: ManagedFileType[];
	dir: string;
	setDir: React.Dispatch<React.SetStateAction<string>>;
	showStorage: boolean;
	type: string | null;
}) {
	if (showStorage) {
		if (!data || data.length <= 0) return <FileEmpty />;
		return <FileStorage data={data} dir={dir} setDir={setDir} />;
	}

	const { files, title } = React.useMemo(() => {
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

		return { files, title };
	}, [data, type]);

	return (
		<div className="my-2 md:my-4">
			<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
				{title}
			</h3>
			<div className="bg-gray-200 h-[1px] my-5 w-full">
				<div className="bg-primary-500 h-[1px] w-1/5" />
			</div>
			<div className="my-3 py-2">
				{files.length <= 0 ? <FileEmpty /> : <FileTable files={files} />}
			</div>
		</div>
	);
}

export default Files;
