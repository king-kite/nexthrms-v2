import { permissions } from '../../../../../config';
import { prisma, getProject, getProjectTeam } from '../../../../../db';
import {
	hasObjectPermission,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import { adminMiddleware as admin } from '../../../../../middlewares/api';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { validateParams } from '../../../../../validators';
import { projectTeamCreateSchema } from '../../../../../validators/projects';

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

		const data = await getProjectTeam({
			...params,
			id: req.query.id as string,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched data successfully',
			data,
		});
	})
	.use(admin)
	.post(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.project.EDIT]);
		if (!hasPerm) {
			hasPerm = await hasObjectPermission({
				model: 'projects',
				permission: 'EDIT',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
		}

		if (!hasPerm) throw new NextApiErrorMessage();

		const project = await getProject(req.query.id as string);

		if (!project) throw new NextApiErrorMessage(404);

		const data = await projectTeamCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		// Check that the employee the user is adding in are ones the user can view
		// to avoid guessing
		let hasViewEmployeePerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.employee.VIEW]);

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

		// Have Distinct Project Team Member.
		const filteredMembers = data.team?.reduce(
			(
				acc: {
					employeeId: string;
					isLeader: boolean;
				}[],
				member
			) => {
				// check if the member is already in the acc
				const found = acc.find((item) => item.employeeId === member.employeeId);
				if (found) {
					const newAccumulator = acc;
					const index = newAccumulator.indexOf(found);
					newAccumulator[index] = {
						employeeId: found.employeeId,
						isLeader: member.isLeader || found.isLeader,
					};
					return newAccumulator;
				}
				return [
					...acc,
					{
						...member,
						isLeader: member.isLeader || false,
					},
				];
			},
			[]
		);

		await prisma.projectTeam.createMany({
			data: filteredMembers.map((member) => ({
				projectId: req.query.id as string,
				employeeId: member.employeeId,
				isLeader: member.isLeader,
			})),
			skipDuplicates: true,
		});

		const updatedProject = await getProject(req.query.id as string);

		if (updatedProject) {
			// get the team members just add in
			const dataTeamIds = filteredMembers.map((member) => member.employeeId);
			const team = updatedProject.team.filter((member) =>
				dataTeamIds.includes(member.employee.id)
			);

			await prisma.permission.update({
				where: {
					codename: permissions.projecttask.CREATE,
				},
				data: {
					users: {
						connect: team
							.filter((member) => member.isLeader)
							.map((member) => ({ id: member.employee.user.id })),
					},
				},
			});

			await updateObjectPermissions({
				model: 'projects',
				permissions: ['VIEW'],
				objectId: project.id,
				users: team.map((member) => member.employee.user.id),
			});
		}

		return res.status(201).json({
			status: 'success',
			message: 'Team members added successfully!',
		});
	});
