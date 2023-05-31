import { Container } from '../components/common';
import { GetManagedFilesResponseType } from '../types';

function FileManager({
	files,
}: {
	files?: GetManagedFilesResponseType['data'];
}) {
	return (
		<Container heading="File Manager">This is the file namager page</Container>
	);
}

export default FileManager;
