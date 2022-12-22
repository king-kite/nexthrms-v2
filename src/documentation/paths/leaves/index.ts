import * as routes from '../../../config/server';

import leave from './leave';
import leaves from './leaves';
import adminLeave from './adminLeave';
import adminLeaves from './adminLeaves';
import adminExportLeaves from './exportAdminLeaves';

const paths = {
    [routes.LEAVES_URL]: leaves,
    [routes.LEAVE_URL("{id}")]: leave,
    [routes.LEAVES_ADMIN_URL]: adminLeaves,
    [routes.LEAVE_ADMIN_URL("{id}")]: adminLeave,
    [routes.LEAVES_ADMIN_EXPORT_URL]: adminExportLeaves,
};

export default paths