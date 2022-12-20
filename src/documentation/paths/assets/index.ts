import * as routes from "../../../config/server";

import assetsExport from './exportAssets'
import asset from './asset'; // Single asset
import assets from './assets'

const paths = {
	[routes.ASSETS_URL]: assets,
	[routes.ASSET_URL("{id}")]: asset,
	[routes.ASSETS_EXPORT_URL]: assetsExport,
};

export default paths;
