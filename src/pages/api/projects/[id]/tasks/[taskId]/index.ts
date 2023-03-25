import { permissions } from '../../../../../../config';
import {
	prisma,
	getProjectTask,
	taskSelectQuery as selectQuery,
} from '../../../../../../db';
import {
	getRecord,
	getUserObjectPermissions,
	hasObjectPermission,
	hasViewPermission,
	removeObjectPermissions,
	updateObjectPermissions,
} from '../../../../../../db/utils';
import { auth } from '../../../../../../middlewares';
import {
	CreateProjectTaskQueryType,
	ProjectTaskType,
} from '../../../../../../types';
import { hasModelPermission } from '../../../../../../utils';
import { NextApiErrorMessage } from '../../../../../../utils/classes';
import { taskCreateSchema } from '../../../../../../validators';

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
		const record = await getRecord({
			model: 'projects_tasks',
			perm: 'projecttask',
			permission: 'VIEW',
			objectId: req.query.id as string,
			user: req.user,
			getData() {
				return getProjectTask(req.query.taskId as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data) {
			return res.status(404).json({
				status: 'error',
				message: 'Task with specified ID does not exist!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched task successfully!',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EDIT,
			]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'projects_tasks',
				permission: 'EDIT',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
			hasPerm = perm.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const previousTask = await getProjectTask(req.query.id as string);
		if (!previousTask)
			return res.status(404).json({
				status: 'error',
				message: 'Task with the specified ID does not exist',
			});

		const valid: CreateProjectTaskQueryType =
			await taskCreateSchema.validateAsync({ ...req.body });

		const { followers, ...data } = valid;

		// delete old project task followers in a team array is passed
		if (followers && Array.isArray(followers)) {
			// Check that the team member the user is adding in are ones the user can view
			// to avoid guessing
			let hasViewMemberPerm =
				req.user.isSuperUser ||
				hasModelPermission(req.user.allPermissions, [
					permissions.projectteam.VIEW,
				]);

			if (!hasViewMemberPerm) {
				const viewEmployeePerms = await Promise.all(
					followers.map((member) => {
						return hasObjectPermission({
							model: 'projects_team',
							permission: 'VIEW',
							objectId: member.memberId,
							userId: req.user.id,
						});
					})
				);
				hasViewMemberPerm = viewEmployeePerms.every((perm) => perm === true);
			}

			if (!hasViewMemberPerm)
				throw new NextApiErrorMessage(
					403,
					'You are not authorized to add some task followers. Please try again later.'
				);
			await Promise.all([
				prisma.projectTaskFollower.deleteMany({
					where: { taskId: req.query.taskId as string },
				}),
				// Also remove their user id from the project taskobject permissions
				await removeObjectPermissions({
					model: 'projects_tasks',
					objectId: previousTask.id,
					users: previousTask.followers.map(
						(follower) => follower.member.employee.user.id
					),
				}),
			]);
		}

		// update the project task
		const task = (await prisma.projectTask.update({
			where: { id: req.query.taskId as string },
			data: {
				...data,
				followers:
					followers && followers.length > 0
						? {
								createMany: {
									data: followers.map(({ memberId, isLeader = false }) => ({
										memberId,
										isLeader,
									})),
									skipDuplicates: true,
								},
						  }
						: {},
			},
			select: selectQuery,
		})) as unknown as ProjectTaskType;

		const taskFollowers = task.followers.map(
			(follower) => follower.member.employee.user.id
		);

		await Promise.all([
			updateObjectPermissions({
				model: 'projects_tasks',
				permissions: ['VIEW'],
				objectId: task.id,
				users: taskFollowers,
			}),
			...task.followers.map((follower) =>
				updateObjectPermissions({
					model: 'projects_tasks_followers',
					permissions: ['VIEW'],
					objectId: follower.id,
					users: taskFollowers,
				})
			),
		]);

		return res.status(200).json({
			status: 'success',
			message: 'Task was updated successfully',
			data: task,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.DELETE,
			]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'projects_tasks',
				permission: 'DELETE',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
			hasPerm = perm.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.projectTask.delete({
			where: { id: req.query.taskId as string },
		});

		return res.status(200).json({
			status: 'success',
			message: 'Task deleted successfully!',
		});
	});
