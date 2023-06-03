import files from './files';

import * as routes from '../../../config/server';

const paths = {
	[routes.MANAGED_FILES_URL]: files,
};

export default paths;
