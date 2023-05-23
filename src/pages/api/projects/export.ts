import {
	projectHeaders as headers,
	projectFileHeaders as fileHeaders,
	projectTeamHeaders as teamHeaders,
	projectTaskHeaders as taskHeaders,
	projectTaskFollowerHeaders as followerHeaders,
	permissions,
} from '../../../config';
import { getProjects, getProjectFiles, getProjectTasks } from '../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	NextApiRequestExtendUser,
	ProjectTaskFollowerImportQueryType,
	ProjectTeamImportQueryType,
	ProjectFileType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

async function getTasksData(
	req: NextApiRequestExtendUser,
	projectIds: string[]
) {
	const placeholder = {
		total: 0,
		result: [],
		project: {
			id: req.query.id as string,
			name: '',
		},
		ongoing: 0,
		completed: 0,
	};
	const result = await getRecords({
		model: 'projects_tasks',
		perm: 'projecttask',
		user: req.user,
		placeholder,
		getData() {
			return getProjectTasks({
				where: {
					projectId: {
						in: projectIds,
					},
				},
			});
		},
	});

	const data = result ? result.data : placeholder;
	const tasks = data.result.map((task) => ({
		id: task.id,
		name: task.name,
		description: task.description,
		due_date: task.dueDate,
		completed: task.completed,
		priority: task.priority,
		project_id: task.project.id,
		updated_at: task.updatedAt,
		created_at: task.createdAt,
	}));
	const perms = await getObjectPermissionExportData({
		ids: tasks.map((task) => task.id),
		model: 'projects_tasks',
	});
	const followers = data.result.reduce(
		(acc: ProjectTaskFollowerImportQueryType[], task) => {
			const taskFollowers = task.followers.map((follower) => ({
				id: follower.id,
				is_leader: follower.isLeader,
				member_id: follower.member.id,
				task_id: task.id,
				created_at: follower.createdAt,
				updated_at: follower.updatedAt,
			}));
			return [...acc, ...taskFollowers];
		},
		[]
	);

	return {
		data: tasks,
		followers,
		permissions: perms,
	};
}

type FileDataType = ProjectFileType & {
	storageInfo?: object | null;
};

async function getFilesData(
	req: NextApiRequestExtendUser,
	projectIds: string[]
) {
	const placeholder = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		result: FileDataType[];
	}>({
		user: req.user,
		model: 'projects_files',
		perm: 'projectfile',
		placeholder,
		getData() {
			return getProjectFiles({
				where: {
					projectId: {
						in: projectIds,
					},
				},
				select: {
					storageInfo: true,
				},
			});
		},
	});

	const data = result ? result.data : placeholder;

	const files = data.result.map((file) => ({
		id: file.id,
		project_id: file.project.id,
		name: file.name,
		file: file.file,
		size: file.size,
		storage_info_keys: file.storageInfo
			? Object.keys(file.storageInfo).join(',')
			: null,
		storage_info_values: file.storageInfo
			? Object.values(file.storageInfo).join(',')
			: null,
		type: file.type,
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

async function getProjectsData(req: NextApiRequestExtendUser) {
	const placeholder = {
		total: 0,
		result: [],
		ongoing: 0,
		completed: 0,
	};

	const records = await getRecords({
		model: 'projects',
		perm: 'project',
		placeholder,
		user: req.user,
		query: req.query,
		getData(params) {
			return getProjects(params);
		},
	});

	const data = records ? records.data : placeholder;
	const projects = data.result.map((project) => ({
		id: project.id,
		client_id: project.client ? project.client.id : null,
		name: project.name,
		description: project.description,
		start_date: project.startDate,
		end_date: project.endDate,
		completed: project.completed,
		initial_cost: project.initialCost,
		rate: project.rate,
		priority: project.priority,
		updated_at: project.updatedAt,
		created_at: project.createdAt,
	}));

	const perms = await getObjectPermissionExportData({
		ids: projects.map((project) => project.id),
		model: 'projects',
	});
	const team = data.result.reduce(
		(acc: ProjectTeamImportQueryType[], project) => {
			const members = project.team.map((member) => ({
				id: member.id,
				is_leader: member.isLeader,
				employee_id: member.employee.id,
				project_id: project.id,
				created_at: member.createdAt,
				updated_at: member.updatedAt,
			}));
			return [...acc, ...members];
		},
		[]
	);

	return {
		data: projects,
		team,
		permissions: perms,
	};
}

async function handleDataExport(req: NextApiRequestExtendUser) {
	try {
		const {
			data: projects,
			team,
			permissions: projectPerms,
		} = await getProjectsData(req);

		const projectIds = projects.map((project) => project.id);

		const { data: files, permissions: filePerms } = await getFilesData(
			req,
			projectIds
		);

		const {
			data: tasks,
			followers,
			permissions: taskPerms,
		} = await getTasksData(req, projectIds);

		// export projects
		const projectData = await exportData(
			{ data: projects, permissions: projectPerms },
			headers,
			{
				type: (req.query.type as string) || 'csv',
				userId: req.user.id,
			}
		);
		let message = '';

		message =
			'Projects data was exported successfully. The projects files will be exported shortly. Click on the download link to proceed!';
		if (projectData.size) {
			const size = String(projectData.size / (1024 * 1024));
			const sizeString =
				size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
			message = `Projects data (${sizeString}MB) was exported successfully. The projects files will be exported shortly. Click on the download link to proceed!`;
		}
		createNotification({
			message,
			messageId: projectData.file,
			recipient: req.user.id,
			title: 'Projects data export was successful.',
			type: 'DOWNLOAD',
		});

		// export project files
		const fileData = await exportData(
			{ data: files, permissions: filePerms },
			fileHeaders,
			{
				type: (req.query.type as string) || 'csv',
				userId: req.user.id,
			}
		);
		message =
			'Projects files were exported successfully. The projects teams will be exported shortly. Click on the download link to proceed!';
		if (fileData.size) {
			const size = String(fileData.size / (1024 * 1024));
			const sizeString =
				size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
			message = `Projects files were (${sizeString}MB) was exported successfully. The projects teams will be exported shortly. Click on the download link to proceed!`;
		}
		createNotification({
			message,
			messageId: fileData.file,
			recipient: req.user.id,
			title: 'Projects files data export was successful.',
			type: 'DOWNLOAD',
		});

		// export project team
		const teamData = await exportData({ data: team }, teamHeaders, {
			type: (req.query.type as string) || 'csv',
			userId: req.user.id,
		});
		message =
			'Projects teams were exported successfully. The projects tasks will be exported shortly. Click on the download link to proceed!';
		if (teamData.size) {
			const size = String(teamData.size / (1024 * 1024));
			const sizeString =
				size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
			message = `Projects teams were (${sizeString}MB) was exported successfully. The projects tasks will be exported shortly. Click on the download link to proceed!`;
		}
		createNotification({
			message,
			messageId: teamData.file,
			recipient: req.user.id,
			title: 'Projects teams data export was successful.',
			type: 'DOWNLOAD',
		});

		// export project task
		const taskData = await exportData(
			{ data: tasks, permissions: taskPerms },
			taskHeaders,
			{
				type: (req.query.type as string) || 'csv',
				userId: req.user.id,
			}
		);
		message =
			'Projects tasks were exported successfully. The projects task followers will be exported shortly. Click on the download link to proceed!';
		if (taskData.size) {
			const size = String(taskData.size / (1024 * 1024));
			const sizeString =
				size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
			message = `Projects tasks were (${sizeString}MB) was exported successfully. The projects task followers will be exported shortly. Click on the download link to proceed!`;
		}
		createNotification({
			message,
			messageId: taskData.file,
			recipient: req.user.id,
			title: 'Projects tasks data export was successful.',
			type: 'DOWNLOAD',
		});

		// export project task followers
		const followerData = await exportData(
			{ data: followers },
			followerHeaders,
			{
				type: (req.query.type as string) || 'csv',
				userId: req.user.id,
			}
		);
		message =
			'Projects task followers were exported successfully. Click on the download link to proceed!';
		if (followerData.size) {
			const size = String(followerData.size / (1024 * 1024));
			const sizeString =
				size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
			message = `Projects task followers were (${sizeString}MB) was exported successfully. Click on the download link to proceed!`;
		}
		createNotification({
			message,
			messageId: followerData.file,
			recipient: req.user.id,
			title: 'Projects task followers data export was successful.',
			type: 'DOWNLOAD',
		});
	} catch (err) {
		const error = handlePrismaErrors(err);
		createNotification({
			message: error.message,
			recipient: req.user.id,
			title: 'Projects data export failed.',
			type: 'ERROR',
		});
	}
}

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.project.EXPORT]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	handleDataExport(req);

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
