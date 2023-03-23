import { permissions } from '../../../../../config';
import { prisma, getProject, getProjectTeam } from '../../../../../db';
import {
	addObjectPermissions,
	getRecord,
	getRecords,
	hasObjectPermission,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import { adminMiddleware as admin } from '../../../../../middlewares/api';
import {
	CreateProjectTeamQueryType,
	ProjectTeamType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { projectTeamCreateSchema } from '../../../../../validators';

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
			model: 'projects_team',
			perm: 'projectteam',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getProjectTeam({
					...params,
					id: req.query.id as string,
				});
			},
		});

		if (!result) throw new NextApiErrorMessage(403);

		return res.status(200).json(result);
	})
	.use(admin)
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.project.CREATE,
				permissions.projectteam.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage();

		const project = await getRecord({
			model: 'projects',
			perm: 'project',
			permission: 'VIEW',
			user: req.user,
			objectId: req.query.id as string,
			getData() {
				return getProject(req.query.id as string);
			},
		});

		if (!project?.data) throw new NextApiErrorMessage(404);

		const data: CreateProjectTeamQueryType =
			await projectTeamCreateSchema.validateAsync({ ...req.body });

		// Check that the employee the user is adding in are ones the user can view
		// to avoid guessing
		let hasViewEmployeePerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.employee.CREATE,
			]);

		if (!hasViewEmployeePerm) {
			const viewEmployeePerms = await Promise.all(
				data.team.map((member) => {
					return hasObjectPermission({
						model: 'employees',
						permission: 'VIEW',
						objectId: member.employeeId,
						userId: req.user.id,
					});
				})
			);
			hasViewEmployeePerm = viewEmployeePerms.every((perm) => perm === true);
		}

		if (!hasViewEmployeePerm)
			throw new NextApiErrorMessage(
				403,
				'You are not authorized to add some team members. Please try again later.'
			);

		await prisma.projectTeam.createMany({
			data: data.team.map((member) => ({
				projectId: req.query.id as string,
				employeeId: member.employeeId,
				isLeader: member.isLeader,
			})),
			skipDuplicates: true,
		});

		await updateObjectPermissions({
			model: 'projects',
			permissions: ['VIEW'],
			objectId: project.data.id,
			users: project.data.team.map((member) => member.employee.user.id),
		});

		return res.status(201).json({
			status: 'success',
			message: 'Team members added successfully!',
		});
	});
