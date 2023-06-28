import { holidayHeaders as headers, permissions } from '../../../config';
import { getHolidays } from '../../../db/queries/holidays';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { employeeMiddleware as employee } from '../../../middlewares/api';
import {
	GetHolidaysResponseType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

// Get the records from the database, including the permissions
async function getData(req: NextApiRequestExtendUser) {
	const placeholder: GetHolidaysResponseType['data'] = {
		total: 0,
		result: [],
	};

	const result = await getRecords<GetHolidaysResponseType['data']>({
		model: 'holiday',
		perm: 'holiday',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getHolidays(params);
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((value) => {
		return {
			id: value.id,
			name: value.name,
			date: value.date,
			updated_at: value.updatedAt,
			created_at: value.createdAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'holiday',
	});

	return {
		data: values,
		permissions: perms,
	};
}

export default admin()
	.use(employee)
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.holiday.EXPORT]);
		if (!hasPerm) throw new NextApiErrorMessage(403);

		getData(req)
			.then((data) => {
				return exportData(data, headers, {
					title: 'holidays',
					type: (req.query.type as string) || 'csv',
					userId: req.user.id,
				});
			})
			.then((data) => {
				let message =
					'File exported successfully. Click on the download link to proceed!';
				if (data.size) {
					const size = String(data.size / (1024 * 1024));
					const sizeString =
						size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
					message = `File (${sizeString}MB) exported successfully. Click on the download link to proceed!`;
				}
				createNotification({
					message,
					messageId: data.file,
					recipient: req.user.id,
					title: 'Holiday data export was successful.',
					type: 'DOWNLOAD',
				});
			})
			.catch((err) => {
				const error = handlePrismaErrors(err);
				createNotification({
					message: error.message,
					recipient: req.user.id,
					title: 'Holiday data export failed.',
					type: 'ERROR',
				});
			});

		return res.status(200).json({
			status: 'success',
			message:
				'Your request was received successfully. A notification will be sent to you with a download link.',
		});
	});
