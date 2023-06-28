import {
	projectHeaders as headers,
	projectFileHeaders as fileHeaders,
	projectTeamHeaders as teamHeaders,
	projectTaskHeaders as taskHeaders,
	projectTaskFollowerHeaders as followerHeaders,
	permissions,
} from '../../../config';
import {
	getProjects,
	// selects
	projectSelectQuery,
	projectFileSelectQuery,
	taskSelectQuery,
} from '../../../db/queries/projects';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
	getUserObjects,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	NextApiRequestExtendUser,
	ProjectType,
	ProjectFileType,
	ProjectTaskType,
	ProjectTaskFollowerImportQueryType,
	ProjectTeamImportQueryType,
} from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

type DataFileType = ProjectFileType & {
	file: ProjectFileType['file'] & {
		storageInfo?: object | null;
	};
};

type DataType = ProjectType & {
	client: {
		id: string;
	} | null;
	files: DataFileType[];
	tasks: ProjectTaskType[];
};

type RecordType = {
	total: number;
	ongoing: number;
	completed: number;
	result: DataType[];
};

// Get the task export/import query data
async function getTasksData(data: DataType['tasks']) {
	const tasks = data.map((task) => ({
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
	const followers = data.reduce(
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
// Get the files export/import query data
async function getFilesData(data: DataType['files']) {
	const files = data.map((file) => ({
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

async function getProjectsData(req: NextApiRequestExtendUser) {
	const placeholder: RecordType = {
		total: 0,
		result: [],
		ongoing: 0,
		completed: 0,
	};

	// Only get the files that the user can view if the user is not a superuser
	// and does not have model permissions
	const validFileIds =
		!req.user.isSuperUser &&
		!hasModelPermission(req.user.allPermissions, [permissions.projectfile.VIEW])
			? (
					await getUserObjects({
						modelName: 'projects_files',
						permission: 'VIEW',
						userId: req.user.id,
					})
			  ).map((permFile) => permFile.objectId)
			: undefined;

	// Only get the tasks that the user can view if the user is not a superuser
	// and does nothave model permissions
	const validTaskIds =
		!req.user.isSuperUser &&
		!hasModelPermission(req.user.allPermissions, [permissions.projecttask.VIEW])
			? (
					await getUserObjects({
						modelName: 'projects_tasks',
						permission: 'VIEW',
						userId: req.user.id,
					})
			  ).map((permTask) => permTask.objectId)
			: undefined;

	const records = await getRecords({
		model: 'projects',
		perm: 'project',
		placeholder,
		user: req.user,
		query: req.query,
		getData(params) {
			const value = getProjects({
				...params,
				select: {
					...projectSelectQuery,
					client: {
						select: {
							id: true,
						},
					},
					files: {
						where: validFileIds
							? {
									id: {
										in: validFileIds,
									},
							  }
							: undefined,
						select: {
							...projectFileSelectQuery,
							file: {
								select: {
									...projectFileSelectQuery.file.select,
									storageInfo: true,
								},
							},
						},
					},
					tasks: {
						where: validTaskIds
							? {
									id: {
										in: validTaskIds,
									},
							  }
							: undefined,
						select: taskSelectQuery,
					},
				},
			});
			return value as unknown as Promise<RecordType>;
		},
	});

	// Projects
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
	const projectPerms = await getObjectPermissionExportData({
		ids: projects.map((project) => project.id),
		model: 'projects',
	});

	// Team
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

	// Files
	const { allFiles, allTasks } = data.result.reduce(
		(
			acc: { allFiles: DataType['files']; allTasks: DataType['tasks'] },
			project
		) => ({
			allFiles: [...acc.allFiles, ...project.files],
			allTasks: [...acc.allTasks, ...project.tasks],
		}),
		{ allFiles: [], allTasks: [] }
	);
	const files = await getFilesData(allFiles);

	// Tasks
	const { followers, ...tasks } = await getTasksData(allTasks);

	return {
		files,
		projects: {
			data: projects,
			permissions: projectPerms,
		},
		team: {
			data: team,
		},
		tasks,
		followers: {
			data: followers,
		},
	};
}

async function handleDataExport(req: NextApiRequestExtendUser) {
	try {
		const { files, followers, projects, tasks, team } = await getProjectsData(
			req
		);

		// export projects
		const projectData = await exportData(projects, headers, {
			title: 'projects',
			type: (req.query.type as string) || 'csv',
			userId: req.user.id,
		});
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
		const fileData = await exportData(files, fileHeaders, {
			title: 'project files',
			type: (req.query.type as string) || 'csv',
			userId: req.user.id,
		});
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
		const teamData = await exportData(team, teamHeaders, {
			title: 'team',
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

		// export project tasks
		const taskData = await exportData(tasks, taskHeaders, {
			title: 'tasks',
			type: (req.query.type as string) || 'csv',
			userId: req.user.id,
		});
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
		const followerData = await exportData(followers, followerHeaders, {
			title: 'task followers',
			type: (req.query.type as string) || 'csv',
			userId: req.user.id,
		});
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
