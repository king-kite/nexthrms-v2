import * as routes from '../../../config/server';
import { getExportResponse, getImportResponse } from '../../responses';
import * as tags from '../../tags';

import asset from './asset'; // Single asset
import assets from './assets';

const paths = {
	[routes.ASSETS_URL]: assets,
	[routes.ASSET_URL('{id}')]: asset,
	[routes.ASSETS_EXPORT_URL]: getExportResponse({
		title: 'Export Assets Data',
		tags: [tags.Assets],
	}),
	[routes.ASSETS_IMPORT_URL]: getImportResponse({
		title: 'Import Assets Data',
		tags: [tags.Assets],
	}),
};

export default paths;
