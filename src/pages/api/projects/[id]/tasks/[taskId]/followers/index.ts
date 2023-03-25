import { permissions } from '../../../../../../../config';
import {
	prisma,
	getProject,
	getProjectTask,
	getTaskFollowers,
} from '../../../../../../../db';
import {
	addObjectPermissions,
	getRecord,
	getRecords,
	hasObjectPermission,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../../../db/utils';
import { auth } from '../../../../../../../middlewares';
import { CreateProjectTaskFollowersQueryType } from '../../../../../../../types';
import { hasModelPermission } from '../../../../../../../utils';
import { NextApiErrorMessage } from '../../../../../../../utils/classes';
import { projectTaskFollowersCreateSchema } from '../../../../../../../validators';

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
		const result = await getRecords({
			model: 'projects_tasks_followers',
			perm: 'projecttaskfollower',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getTaskFollowers({
					...params,
					id: req.query.taskId as string,
				});
			},
		});

		if (!result) throw new NextApiErrorMessage(403);

		return res.status(200).json(result);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.CREATE,
				permissions.projecttaskfollower.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage();

		const task = await getRecord({
			model: 'projects_tasks',
			perm: 'projecttask',
			permission: 'VIEW',
			user: req.user,
			objectId: req.query.taskId as string,
			getData() {
				return getProject(req.query.taskId as string);
			},
		});

		if (!task?.data) throw new NextApiErrorMessage(404);

		const data: CreateProjectTaskFollowersQueryType =
			await projectTaskFollowersCreateSchema.validateAsync({ ...req.body });

		// Check that the team member the user is adding in are ones the user can view
		// to avoid guessing
		let hasViewMemberPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projectteam.VIEW,
			]);

		if (!hasViewMemberPerm) {
			const viewEmployeePerms = await Promise.all(
				data.team.map((member) => {
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
				'You are not authorized to add some team members. Please try again later.'
			);

		await prisma.projectTaskFollower.createMany({
			data: data.team.map((follower) => ({
				taskId: req.query.taskId as string,
				memberId: follower.memberId,
				isLeader: follower.isLeader,
			})),
			skipDuplicates: true,
		});

		const updatedTask = await getProjectTask(req.query.taskId as string);
		if (updatedTask) {
			// get the team members just add in
			const dataTeamIds = data.team.map((member) => member.memberId);
			const followers = updatedTask.followers.filter((follower) =>
				dataTeamIds.includes(follower.member.employee.id)
			);

			await Promise.all([
				...followers.map((member) =>
					addObjectPermissions({
						model: 'projects_tasks_followers',
						objectId: member.id,
						users: [req.user.id],
					})
				),
			]);

			await Promise.all([
				updateObjectPermissions({
					model: 'projects_tasks',
					permissions: ['VIEW'],
					objectId: task.data.id,
					users: followers.map((follower) => follower.member.employee.user.id),
				}),
				...followers.map((member) =>
					updateObjectPermissions({
						model: 'projects_tasks_followers',
						permissions: ['VIEW'],
						objectId: member.id,
						users: followers.map(
							(follower) => follower.member.employee.user.id
						),
					})
				),
			]);
		}

		return res.status(201).json({
			status: 'success',
			message: 'Task followers added successfully!',
		});
	});
