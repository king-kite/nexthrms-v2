import { jobHeaders as headers, permissions } from '../../../config';
import { getJobs } from '../../../db/queries/jobs';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { NextApiRequestExtendUser } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

async function getJobsData(req: NextApiRequestExtendUser) {
	const placeholder = {
		total: 0,
		result: [],
	};

	const result = await getRecords({
		query: req.query,
		user: req.user,
		model: 'jobs',
		perm: 'job',
		placeholder,
		getData(params) {
			return getJobs(params);
		},
	});

	const data = result ? result.data : placeholder;

	const jobs = data.result.map((job) => ({
		id: job.id,
		name: job.name,
		updated_at: job.updatedAt,
		created_at: job.createdAt,
	}));

	const perms = await getObjectPermissionExportData({
		ids: jobs.map((job) => job.id),
		model: 'jobs',
	});

	return {
		data: jobs,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.job.EXPORT]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	getJobsData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'jobs',
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
				title: 'Jobs data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Jobs data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
