import files from './files';
import { getExportResponse, getImportResponse } from '../../responses';
import * as tags from '../../tags';
import * as routes from '../../../config/server';

const paths = {
	[routes.MANAGED_FILES_URL]: files,
	[routes.MANAGED_FILES_EXPORT_URL]: getExportResponse({
		parameters: [
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0,
				},
			},
		],
		tags: [tags.ManagedFiles],
		title: 'Export File Manager Data',
	}),
	[routes.MANAGED_FILES_IMPORT_URL]: getImportResponse({
		tags: [tags.ManagedFiles],
		title: 'Import File Manager Data',
	}),
};

export default paths;
