import * as routes from '../../../config/server';

import departments from './departments';

const path = {
    [routes.DEPARTMENTS_URL]: departments,
};

export default path;