import * as routes from '../../../config/server';

import attendanceInfo from './info';

const paths = {
	[routes.ATTENDANCE_INFO_URL]: attendanceInfo
};

export default paths