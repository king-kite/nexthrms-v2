import * as routes from '../../../../config/server';
import { getExportResponse, getImportResponse } from '../../../responses';
import * as tags from '../../../tags';

import category from './category';
import categories from './categories';

const path = {
	[routes.PERMISSION_CATEGORIES_URL]: categories,
	[routes.PERMISSION_CATEGORY_URL('{id}')]: category,
	[routes.PERMISSION_CATEGORIES_EXPORT_URL]: getExportResponse({
		description: 'Export Permission Categories and Object Level Data',
		title: 'Export Permission Categories',
		tags: [tags.Permissions],
	}),
	[routes.PERMISSION_CATEGORIES_IMPORT_URL]: getImportResponse({
		description: 'Import Permission Categories and Object Level data',
		title: 'Import Permission Categories',
		tags: [tags.Permissions],
	}),
};

export default path;
