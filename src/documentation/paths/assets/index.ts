import * as routes from '../../../config/server';

import assetsExport from './export-assets';
import assetsImport from './import-assets';
import asset from './asset'; // Single asset
import assets from './assets';

const paths = {
	[routes.ASSETS_URL]: assets,
	[routes.ASSET_URL('{id}')]: asset,
	[routes.ASSETS_EXPORT_URL]: assetsExport,
	[routes.ASSETS_IMPORT_URL]: assetsImport,
};

export default paths;
