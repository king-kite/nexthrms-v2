import * as routes from '../../../config/server';

import attendance from './attendance';
import attendanceInfo from './info';

// Admin
import attendanceAdmin from './attendanceAdmin'
import attendanceAdminExport from './adminExportAttendance';

const paths = {
	[routes.ATTENDANCE_URL]: attendance,
	[routes.ATTENDANCE_INFO_URL]: attendanceInfo,

	[routes.ATTENDANCE_ADMIN_URL]: attendanceAdmin,
	[routes.ATTENDANCE_ADMIN_EXPORT_URL]: attendanceAdminExport,
};

export default paths