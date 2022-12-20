import * as routes from '../../../config/server';

import attendance from './attendance';
import attendanceInfo from './info';

const paths = {
	[routes.ATTENDANCE_INFO_URL]: attendanceInfo,
	[routes.ATTENDANCE_URL]: attendance,
};

export default paths