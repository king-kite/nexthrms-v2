import * as routes from '../../../config/server';

import getLeaves from './getLeaves';

const paths = {
    [routes.LEAVES_URL]: getLeaves,
};

export default paths