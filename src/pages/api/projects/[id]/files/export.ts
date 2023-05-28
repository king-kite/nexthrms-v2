import {
	projectFileHeaders as headers,
	permissions,
} from '../../../../../config';
import { getProjectFiles } from '../../../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
	hasViewPermission,
} from '../../../../../db/utils';
import { admin } from '../../../../../middlewares';
import {
	NextApiRequestExtendUser,
	ProjectFileType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { handlePrismaErrors } from '../../../../../validators';

type DataType = ProjectFileType & {
	file: ProjectFileType['file'] & {
		storageInfo?: object | null;
	}
};

async function getData(req: NextApiRequestExtendUser) {
	const placeholder = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		result: DataType[];
	}>({
		query: req.query,
		user: req.user,
		model: 'projects_files',
		perm: 'projectfile',
		placeholder,
		getData(params) {
			return getProjectFiles({
				...params,
				id: req.query.id as string,
				select: {
					file: {
						select: {
							name: true,
							url: true,
							size: true,
							type: true,
							storageInfo: true,
						}
					}
				},
			});
		},
	});

	const data = result ? result.data : placeholder;

	const files = data.result.map((file) => ({
		id: file.id,
		project_id: file.project.id,
		name: file.file.name,
		file: file.file.url,
		size: file.file.size,
		storage_info_keys: file.file.storageInfo
			? Object.keys(file.file.storageInfo).join(',')
			: null,
		storage_info_values: file.file.storageInfo
			? Object.values(file.file.storageInfo).join(',')
			: null,
		type: file.file.type,
		uploaded_by: file.employee ? file.employee.id : undefined,
		updated_at: file.updatedAt,
		created_at: file.createdAt,
	}));

	const perms = await getObjectPermissionExportData({
		ids: files.map((file) => file.id),
		model: 'projects_files',
	});

	return {
		data: files,
		permissions: perms,
	};
}

export default admin()
	.use(async (req, res, next) => {
		// Check the user can view the project
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextApiErrorMessage(403);
		next();
	})
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projectfile.EXPORT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		getData(req)
			.then((data) => {
				return exportData(data, headers, {
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
					title: 'Project files data export was successful.',
					type: 'DOWNLOAD',
				});
			})
			.catch((err) => {
				const error = handlePrismaErrors(err);
				createNotification({
					message: error.message,
					recipient: req.user.id,
					title: 'Project files data export failed.',
					type: 'ERROR',
				});
			});

		return res.status(200).json({
			status: 'success',
			message:
				'Your request was received successfully. A notification will be sent to you with a download link.',
		});
	});
