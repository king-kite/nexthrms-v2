import * as routes from '../../../config/server';

import notification from './notification';
import notifications from './notifications';

const path = {
    [routes.NOTIFICATIONS_URL]: notifications,
    [routes.NOTIFICATION_URL("{id}")]: notification,
};

export default path;