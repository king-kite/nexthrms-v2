import * as routes from '../../../../config/server';

import category from './category';
import categories from './categories';

const path = {
	[routes.PERMISSION_CATEGORIES_URL]: categories,
	[routes.PERMISSION_CATEGORY_URL('{id}')]: category,
};

export default path;
