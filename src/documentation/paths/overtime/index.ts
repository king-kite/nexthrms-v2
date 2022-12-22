import * as routes from '../../../config/server';

import singleOvertime from './overtime';
import allOvertime from './allOvertime';
import adminOvertime from './adminOvertime';
import adminAllOvertime from './adminAllOvertime';
import adminExportOvertime from './exportAdminOvertime';

const paths = {
	[routes.OVERTIME_URL]: allOvertime,
	[routes.OVERTIME_DETAIL_URL('{id}')]: singleOvertime,
	[routes.OVERTIME_ADMIN_URL]: adminAllOvertime,
	[routes.OVERTIME_ADMIN_DETAIL_URL('{id}')]: adminOvertime,
	[routes.OVERTIME_ADMIN_EXPORT_URL]: adminExportOvertime,
};

export default paths;
