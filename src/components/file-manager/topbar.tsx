import { Button } from 'kite-react-tailwind';
import { FaCloudUploadAlt, FaFolderPlus } from 'react-icons/fa';

function Topbar() {
	return (
		<div className="flex flex-wrap items-center my-3 w-full">
			<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
				<Button
					iconLeft={FaFolderPlus}
					rounded="rounded-xl"
					title="New Folder"
				/>
			</div>
			<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
				<Button
					iconLeft={FaCloudUploadAlt}
					rounded="rounded-xl"
					title="Upload File"
				/>
			</div>
		</div>
	);
}

export default Topbar;
