import * as routes from '../../../config/server';

import attendance from './attendance';
import attendanceInfo from './info';

const paths = {
	[routes.ATTENDANCE_URL]: attendance,
	[routes.ATTENDANCE_INFO_URL]: attendanceInfo,
};

export default paths