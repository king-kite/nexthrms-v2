import * as routes from '../../../config/server';

import department from './department';
import departments from './departments';
import exportDepartments from './exportDepartments';

const path = {
    [routes.DEPARTMENTS_URL]: departments,
    [routes.DEPARTMENT_URL("{id}")]: department,
    [routes.DEPARTMENTS_EXPORT_URL]: exportDepartments,
};

export default path;