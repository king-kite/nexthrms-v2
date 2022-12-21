import * as routes from '../../../config/server';

import holiday from './holiday';
import holidays from './holidays';
import exportHolidays from './exportHolidays';

const path = {
    [routes.HOLIDAYS_URL]: holidays,
    [routes.HOLIDAY_URL("{id}")]: holiday,
    [routes.HOLIDAYS_EXPORT_URL]: exportHolidays,
};

export default path;