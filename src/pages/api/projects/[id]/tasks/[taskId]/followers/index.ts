import { permissions } from '../../../../../../../config';
import {
	prisma,
	getProjectTask,
	getTaskFollowers,
} from '../../../../../../../db';
import {
	hasObjectPermission,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../../../db/utils';
import { auth } from '../../../../../../../middlewares';
import { CreateProjectTaskFollowersQueryType } from '../../../../../../../types';
import { hasModelPermission } from '../../../../../../../utils';
import { NextApiErrorMessage } from '../../../../../../../utils/classes';
import {
	projectTaskFollowersCreateSchema,
	validateParams,
} from '../../../../../../../validators';

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

		const data: CreateProjectTaskFollowersQueryType =
			await projectTaskFollowersCreateSchema.validateAsync({ ...req.body });

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
