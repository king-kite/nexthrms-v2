import * as routes from '../../../config/server';
import * as tags from '../../tags';
import { getExportResponse, getImportResponse } from '../../responses';

import client from './client'; // Single Client
import clients from './clients';

const paths = {
	[routes.CLIENTS_URL]: clients,
	[routes.CLIENT_URL('{id}')]: client,
	[routes.CLIENTS_EXPORT_URL]: getExportResponse({
		title: 'Export Clients Data',
		tags: [tags.Clients],
	}),
	[routes.CLIENTS_IMPORT_URL]: getImportResponse({
		title: 'Import Clients Data',
		tags: [tags.Clients],
	}),
};

export default paths;
