import permissions from '../../../../../config/permissions';
import prisma from '../../../../../db';
import {
	getProjectTeamMember,
	teamSelectQuery as selectQuery,
} from '../../../../../db/queries/projects';
import {
	hasViewPermission,
	hasObjectPermission,
	removeObjectPermissions,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import { adminMiddleware as admin } from '../../../../../middlewares/api';
import { ProjectTeamType } from '../../../../../types';
import { hasModelPermission } from '../../../../../utils/permission';
import { NextErrorMessage } from '../../../../../utils/classes';
import { projectTeamMemberUpdateSchema } from '../../../../../validators/projects';

export default auth()
	.use(async (req, res, next) => {
		// Check the user can view the project
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextErrorMessage(403);
		next();
	})
	.get(async (req, res) => {
		const data = await getProjectTeamMember(req.query.teamId as string);

		if (!data) {
			return res.status(404).json({
				status: 'error',
				message: 'Project team member with the specified ID does not exist!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Team member successfully!',
			data,
		});
	})
	.use(admin)
	.put(async (req, res) => {
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

		if (!hasPerm) throw new NextErrorMessage();

		const data = await projectTeamMemberUpdateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		const member = (await prisma.projectTeam.update({
			where: { id: req.query.teamId as string },
			data,
			select: selectQuery,
		})) as unknown as ProjectTeamType;

		if (member.isLeader) {
			// Make the employee able to create task if the member is a leader
			await prisma.user.update({
				where: {
					id: member.employee.user.id,
				},
				data: {
					permissions: {
						connect: {
							codename: permissions.projecttask.CREATE,
						},
					},
				},
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Team member updated successfully!',
			data: member,
		});
	})
	.delete(async (req, res) => {
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

		if (!hasPerm) throw new NextErrorMessage();

		// Find the team member
		const member = await getProjectTeamMember(req.query.teamId as string);

		if (!member) {
			return res.status(404).json({
				status: 'error',
				message: 'Team member with specified ID was not found!',
			});
		}

		// Delete/Remove the team member
		await prisma.projectTeam.delete({
			where: { id: req.query.teamId as string },
		});

		await removeObjectPermissions({
			model: 'projects',
			objectId: req.query.id as string,
			users: [member.employee.user.id],
		});

		return res.status(200).json({
			status: 'success',
			message: 'Team member deleted successfully!',
		});
	});
