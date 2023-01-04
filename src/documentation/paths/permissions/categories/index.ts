import * as routes from '../../../../config/server';

import category from './category';
import categories from './categories';
import exportCategories from './exportCategories';

const path = {
	[routes.PERMISSION_CATEGORIES_URL]: categories,
	[routes.PERMISSION_CATEGORY_URL('{id}')]: category,
	[routes.PERMISSION_CATEGORIES_EXPORT_URL]: exportCategories,
};

export default path;
