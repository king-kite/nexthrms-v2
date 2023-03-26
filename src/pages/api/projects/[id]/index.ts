import { permissions } from '../../../../config';
import {
	prisma,
	getProject,
	projectSelectQuery as selectQuery,
} from '../../../../db';
import {
	getRecord,
	getUserObjectPermissions,
	hasObjectPermission,
	removeObjectPermissions,
	updateObjectPermissions,
} from '../../../../db/utils';
import { auth } from '../../../../middlewares';
import { adminMiddleware as admin } from '../../../../middlewares/api';
import { CreateProjectQueryType, ProjectType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { projectCreateSchema } from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const record = await getRecord({
			model: 'projects',
			perm: 'project',
			permission: 'VIEW',
			objectId: req.query.id as string,
			user: req.user,
			getData() {
				return getProject(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data) {
			return res.status(404).json({
				status: 'error',
				message: 'Project with specified ID does not exist',
			});
		}

		return res.status(200).json({
			status: 'success',
			mesage: 'Fetched project successfully!',
			data: record.data,
		});
	})
	.use(admin)
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.project.EDIT]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'projects',
				permission: 'EDIT',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
			hasPerm = perm.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const previousProject = await getProject(req.query.id as string);
		if (!previousProject)
			return res.status(404).json({
				status: 'error',
				message: 'Project with the specified ID does not exist',
			});

		const valid: CreateProjectQueryType =
			await projectCreateSchema.validateAsync({ ...req.body });

		const { team, ...data } = valid;

		// delete old project team in a team array is passed
		if (team && Array.isArray(team)) {
			// Check that the employee the user is adding in are ones the user can view
			// to avoid guessing
			let hasViewEmployeePerm =
				req.user.isSuperUser ||
				hasModelPermission(req.user.allPermissions, [
					permissions.employee.VIEW,
				]);

			if (!hasViewEmployeePerm) {
				const viewEmployeePerms = await Promise.all(
					team.map((member) => {
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

			await Promise.all([
				await prisma.projectTeam.deleteMany({
					where: { projectId: req.query.id as string },
				}),
				// Also remove their user id from the project object permissions
				await removeObjectPermissions({
					model: 'projects',
					objectId: previousProject.id,
					users: previousProject.team.map((member) => member.employee.user.id),
				}),
			]);
		}

		// Have Distinct Project Team Member.
		const filteredMembers = team?.reduce(
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

		// update the project
		const project = (await prisma.project.update({
			where: { id: req.query.id as string },
			data: {
				...data,
				client: data.client
					? {
							connect: {
								id: data.client,
							},
					  }
					: previousProject.client
					? {
							disconnect: true,
					  }
					: undefined,
				team:
					filteredMembers && filteredMembers.length > 0
						? {
								createMany: {
									data: filteredMembers.map(
										({ employeeId, isLeader = false }) => ({
											employeeId,
											isLeader,
										})
									),
									skipDuplicates: true,
								},
						  }
						: {},
			},
			select: selectQuery,
		})) as unknown as ProjectType;

		if (
			(!data.client && previousProject.client) ||
			(previousProject.client &&
				data.client &&
				data.client !== previousProject.client?.id)
		) {
			// Remove the old client object permissions
			await removeObjectPermissions({
				model: 'projects',
				objectId: project.id,
				users: [previousProject.client.contact.id],
			});
		}

		const viewers: string[] = [];
		if (project.client) {
			viewers.push(project.client.contact.id);
		}
		project.team.forEach((member) => {
			viewers.push(member.employee.user.id);
		});
		const leaders = project.team
			.filter((member) => member.isLeader === true)
			.map((member) => member.employee.user.id);

		await Promise.all([
			updateObjectPermissions({
				model: 'projects',
				permissions: ['VIEW'],
				objectId: project.id,
				users: viewers,
			}),
			// updateObjectPermissions({
			// 	model: 'projects',
			// 	permissions: ['EDIT'],
			// 	objectId: project.id,
			// 	users: leaders,
			// }),
			// leaders can create tasks
			prisma.permission.update({
				where: {
					codename: permissions.projecttask.CREATE,
				},
				data: {
					users: {
						connect: leaders.map((id) => ({ id })),
					},
				},
			}),
			...project.team.map((member) =>
				updateObjectPermissions({
					model: 'projects_team',
					permissions: ['VIEW'],
					objectId: member.id,
					users: viewers,
				})
			),
		]);

		return res.status(200).json({
			status: 'success',
			message: 'Project updated successfully',
			data: project,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.project.DELETE]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'projects',
				permission: 'DELETE',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
			hasPerm = perm.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.project.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Project deleted successfully!',
		});
	});
