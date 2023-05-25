import * as routes from '../../../config/server';
import { getExportResponse, getImportResponse } from '../../responses';
import * as tags from '../../tags';

import attendance from './attendance';
import attendanceInfo from './info';

// Admin
import attendanceAdmin from './attendance-admin';
import attendanceSingleAdmin from './attendance-single-admin';

const paths = {
	[routes.ATTENDANCE_URL]: attendance,
	[routes.ATTENDANCE_INFO_URL]: attendanceInfo,

	[routes.ATTENDANCE_ADMIN_URL]: attendanceAdmin,
	[routes.ATTENDANCE_ADMIN_SINGLE_URL('{id}')]: attendanceSingleAdmin,
	[routes.ATTENDANCE_ADMIN_EXPORT_URL]: getExportResponse({
		description: 'Export Attendance Information',
		title: 'Admin Export Attendance Data',
		tags: [tags.Attendance],
	}),
	[routes.ATTENDANCE_ADMIN_IMPORT_URL]: getImportResponse({
		description: 'Import Attendance Information',
		title: 'Admin Import Attendance Data',
		tags: [tags.Attendance],
	}),
};

export default paths;
