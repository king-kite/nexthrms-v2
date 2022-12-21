import * as routes from '../../../config/server';

import departments from './departments';
import exportDepartments from './exportDepartments';

const path = {
    [routes.DEPARTMENTS_URL]: departments,
    [routes.DEPARTMENTS_EXPORT_URL]: exportDepartments,
};

export default path;