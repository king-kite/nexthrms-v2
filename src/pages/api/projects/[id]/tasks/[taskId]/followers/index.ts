import permissions from '../../../../../../../config/permissions';
import prisma from '../../../../../../../db';
import {
	getProjectTask,
	getTaskFollowers,
} from '../../../../../../../db/queries/projects';
import {
	hasObjectPermission,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../../../db/utils';
import { auth } from '../../../../../../../middlewares';
import { hasModelPermission } from '../../../../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../../../../utils/classes';
import { validateParams } from '../../../../../../../validators';
import { projectTaskFollowersCreateSchema } from '../../../../../../../validators/projects';

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

		// Check the user can view the task
		const canViewTask = await hasViewPermission({
			model: 'projects_tasks',
			perm: 'projecttask',
			objectId: req.query.taskId as string,
			user: req.user,
		});
		if (!canViewTask) throw new NextApiErrorMessage(403);
		next();
	})
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = getTaskFollowers({
			...params,
			id: req.query.taskId as string,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched data successfully',
			data,
		});
	})
	.post(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EDIT,
			]);
		if (!hasPerm) {
			hasPerm = await hasObjectPermission({
				model: 'projects_tasks',
				permission: 'EDIT',
				objectId: req.query.taskId as string,
				userId: req.user.id,
			});
		}

		if (!hasPerm) throw new NextApiErrorMessage();

		const data = await projectTaskFollowersCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		// Have Distinct followers.
		const filteredFollowers = data.team?.reduce(
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

		await prisma.projectTaskFollower.createMany({
			data: filteredFollowers.map((follower) => ({
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

			await updateObjectPermissions({
				model: 'projects_tasks',
				permissions: ['VIEW'],
				objectId: req.query.taskId as string,
				users: followers.map((follower) => follower.member.employee.user.id),
			});
		}

		return res.status(201).json({
			status: 'success',
			message: 'Task followers added successfully!',
		});
	});
