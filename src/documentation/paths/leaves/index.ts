import * as routes from '../../../config/server';

import leave from './leave';
import leaves from './leaves';

const paths = {
    [routes.LEAVES_URL]: leaves,
    [routes.LEAVE_URL("{id}")]: leave
};

export default paths