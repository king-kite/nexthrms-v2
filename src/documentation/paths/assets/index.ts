import * as routes from '../../../config/server';
import { getImportResponse } from '../../responses';
import * as tags from '../../tags';

import assetsExport from './export-assets';
import asset from './asset'; // Single asset
import assets from './assets';

const paths = {
	[routes.ASSETS_URL]: assets,
	[routes.ASSET_URL('{id}')]: asset,
	[routes.ASSETS_EXPORT_URL]: assetsExport,
	[routes.ASSETS_IMPORT_URL]: getImportResponse({
		title: 'Import Assets Data',
		tags: [tags.Assets],
	}),
};

export default paths;
