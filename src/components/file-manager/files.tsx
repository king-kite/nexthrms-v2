import React from 'react';

import FileComponent from './file';
import Folder from './folder';
import { ManagedFileType } from '../../types';

type FileType = {
	name: string;
	type: 'file' | 'folder';
	data: ManagedFileType | null;
};

function Files({
	data,
	dir,
	setDir,
}: {
	data: ManagedFileType[];
	dir: string;
	setDir: React.Dispatch<React.SetStateAction<string>>;
}) {
	const displays = React.useMemo(() => {
		// Get the files to show that should be in "dir" directory
		const showFiles = data.filter((file) => {
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
		<div className="gap-3 grid grid-cols-4 py-3 sm:gap-y-4 sm:grid-cols-6 md:gap-y-5 md:grid-cols-8 xl:grid-cols-9">
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
	);
}

export default Files;
