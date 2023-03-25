import { permissions } from '../../../../../config';
import {
	prisma,
	getProjectTasks,
	taskSelectQuery as selectQuery,
} from '../../../../../db';
import {
	addObjectPermissions,
	getRecords,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import {
	CreateProjectTaskQueryType,
	ProjectTaskType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { taskCreateSchema, validateParams } from '../../../../../validators';

export default auth()
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
		const placeholder = {
			total: 0,
			result: [],
			completed: 0,
			ongoing: 0,
			project: {
				id: req.query.id as string,
				name: '',
			},
		};

		const result = await getRecords({
			model: 'projects_tasks',
			perm: 'projecttask',
			placeholder,
			query: req.query,
			user: req.user,
			getData(params) {
				return getProjectTasks({
					...params,
					id: req.query.id as string,
				});
			},
		});

		if (result) return res.status(200).json(result);

		// If result is empty that means that he doesnt
		// have any task that he can view. check that the user is in the team and return an empty array
		if (req.user.employee) {
			const member = await prisma.projectTeam.findFirst({
				where: {
					projectId: req.query.id as string,
					employeeId: req.user.employee?.id,
				},
				select: { id: true },
			});
			if (member) {
				return res.status(200).json({
					status: 'success',
					message: 'Fetched data successfully!',
					data: placeholder,
				});
			}
		}

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: CreateProjectTaskQueryType =
			await taskCreateSchema.validateAsync({ ...req.body });

		const task = (await prisma.projectTask.create({
			data: {
				...data,
				project: {
					connect: {
						id: req.query.id as string,
					},
				},
				followers:
					data.followers && data.followers.length > 0
						? {
								createMany: {
									data: data.followers.map(
										({ memberId, isLeader = false }) => ({
											memberId,
											isLeader,
										})
									),
									skipDuplicates: true,
								},
						  }
						: {},
			},
			select: selectQuery,
		})) as unknown as ProjectTaskType;

		// Assign all object level permissions for the task and task followers to the request user only
		await Promise.all([
			addObjectPermissions({
				model: 'projects_tasks',
				objectId: task.id,
				users: [req.user.id],
			}),
			...task.followers.map((follower) =>
				addObjectPermissions({
					model: 'projects_tasks_followers',
					objectId: follower.id,
					users: [req.user.id],
				})
			),
		]);

		// Assign view object level permissions for the project team and client
		// and also give create project task permissions to the project leaders
		const followers = task.followers.map(
			(follower) => follower.member.employee.user.id
		);
		const leaders = task.followers
			.filter((follower) => follower.isLeader === true)
			.map((follower) => follower.member.employee.user.id);

		await Promise.all([
			updateObjectPermissions({
				model: 'projects_tasks',
				permissions: ['VIEW'],
				objectId: task.id,
				users: followers,
			}),
			updateObjectPermissions({
				model: 'projects_tasks',
				permissions: ['EDIT'],
				objectId: task.id,
				users: leaders,
			}),
			...task.followers.map((follower) =>
				updateObjectPermissions({
					model: 'projects_tasks_followers',
					permissions: ['VIEW'],
					objectId: follower.id,
					users: followers,
				})
			),
		]);

		return res.status(201).json({
			status: 'success',
			message: 'Created Project Task successfully!',
			data: task,
		});
	});
