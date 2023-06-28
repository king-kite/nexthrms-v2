import permissions from '../../../../../../config/permissions';
import prisma from '../../../../../../db';
import {
	getProjectTask,
	taskSelectQuery as selectQuery,
} from '../../../../../../db/queries/projects';
import {
	getRecord,
	getUserObjectPermissions,
	hasViewPermission,
	removeObjectPermissions,
	updateObjectPermissions,
} from '../../../../../../db/utils';
import { auth } from '../../../../../../middlewares';
import { ProjectTaskType } from '../../../../../../types';
import { hasModelPermission } from '../../../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../../../utils/classes';
import { taskCreateSchema } from '../../../../../../validators/projects';

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
			objectId: req.query.taskId as string,
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
				objectId: req.query.taskId as string,
				userId: req.user.id,
			});
			hasPerm = perm.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const previousTask = await getProjectTask(req.query.taskId as string);
		if (!previousTask)
			return res.status(404).json({
				status: 'error',
				message: 'Task with the specified ID does not exist',
			});

		const valid = await taskCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		const { followers, ...data } = valid;

		// delete old project task followers in a team array is passed
		if (followers && Array.isArray(followers)) {
			// Check that the team member the user is adding in are ones the user can view
			// to avoid guessing
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

		// Have Distinct followers.
		const filteredFollowers = followers?.reduce(
			(
				acc: {
					memberId: string;
					isLeader: boolean;
				}[],
				follower
			) => {
				// check if the follower is already in the acc
				const found = acc.find((item) => item.memberId === follower.memberId);
				if (found) {
					const newAccumulator = acc;
					const index = newAccumulator.indexOf(found);
					newAccumulator[index] = {
						memberId: found.memberId,
						isLeader: follower.isLeader || found.isLeader,
					};
					return newAccumulator;
				}
				return [
					...acc,
					{
						...follower,
						isLeader: follower.isLeader || false,
					},
				];
			},
			[]
		);

		// update the project task
		const task = (await prisma.projectTask.update({
			where: { id: req.query.taskId as string },
			data: {
				...data,
				description: data.description || '',
				followers:
					filteredFollowers && filteredFollowers.length > 0
						? {
								createMany: {
									data: filteredFollowers.map(
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

		const taskFollowers = task.followers.map(
			(follower) => follower.member.employee.user.id
		);

		await updateObjectPermissions({
			model: 'projects_tasks',
			permissions: ['VIEW'],
			objectId: task.id,
			users: taskFollowers,
		});

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
				objectId: req.query.taskId as string,
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
