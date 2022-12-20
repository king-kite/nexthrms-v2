import * as routes from "../../../config/server";

import assetsExport from './exportAssets'
// import employee from './employee'; // Single Employee
import assets from './assets'

const paths = {
	[routes.ASSETS_URL]: assets,
	// [routes.EMPLOYEE_URL("{id}")]: employee,
	[routes.ASSETS_EXPORT_URL]: assetsExport,
};

export default paths;
