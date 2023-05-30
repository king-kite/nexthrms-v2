import FileManager from '../containers/file-manager';
import { Title } from '../utils';

function Page() {
	return (
		<>
			<Title title="File Manager" />
			<FileManager />
		</>
	);
}

export default Page;
