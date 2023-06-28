import permissions from '../../../../config/permissions';
import prisma from '../../../../db';
import {
	getProject,
	projectSelectQuery as selectQuery,
} from '../../../../db/queries/projects';
import {
	getRecord,
	getUserObjectPermissions,
	hasObjectPermission,
	removeObjectPermissions,
	updateObjectPermissions,
} from '../../../../db/utils';
import { auth } from '../../../../middlewares';
import { adminMiddleware as admin } from '../../../../middlewares/api';
import { ProjectType, ProjectTeamType } from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { projectCreateSchema } from '../../../../validators/projects';

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

		const project = await getProject(req.query.id as string);
		if (!project)
			return res.status(404).json({
				status: 'error',
				message: 'Project with the specified ID does not exist',
			});

		const valid = await projectCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		const { team, ...data } = valid;

		const newTeamMembers: {
			employeeId: string;
			isLeader: boolean;
		}[] = [];
		const removedMembers: ProjectTeamType[] = [];
		const removedLeaders: string[] = [];
		const newLeaders: string[] = [];

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

			// Get the new members and the removed members from the team array;

			// Check for members on the project team that where not passed into the array
			const removed = project.team.reduce((acc: ProjectTeamType[], member) => {
				const findMember = team.find(
					(item) => item.employeeId === member.employee.id
				);
				if (!findMember) return [...acc, member];
				return acc;
			}, []);
			removedMembers.push(...removed);

			// Check for new members in the project team array
			const newMembers = team.reduce(
				(acc: { employeeId: string; isLeader: boolean }[], member) => {
					const oldMember = project.team.find(
						(oldItem) => oldItem.employee.id === member.employeeId
					);
					if (!oldMember) return [...acc, member];
					return acc;
				},
				[]
			);
			newTeamMembers.push(...newMembers);

			// check for new leaders in the old project team array
			const addLeaders = project.team.reduce((acc: string[], member) => {
				const findMember = team.find(
					(item) => item.employeeId === member.employee.id
				);
				if (
					findMember &&
					member.isLeader === false &&
					findMember.isLeader === true
				)
					return [...acc, member.id];
				return acc;
			}, []);
			newLeaders.push(...addLeaders);

			// check for remoed leaders in the old project team array
			const oldLeaders = project.team.reduce((acc: string[], member) => {
				const findMember = team.find(
					(item) => item.employeeId === member.employee.id
				);
				if (
					findMember &&
					member.isLeader === true &&
					findMember.isLeader === false
				)
					return [...acc, member.id];
				return acc;
			}, []);
			removedLeaders.push(...oldLeaders);
		}

		// Have Distinct Project Team Member.
		const filteredMembers = newTeamMembers.reduce(
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
		const updated = (await prisma.project.update({
			where: { id: req.query.id as string },
			data: {
				...data,
				description: data.description || '',
				client: data.client
					? {
							connect: {
								id: data.client,
							},
					  }
					: project.client
					? {
							disconnect: true,
					  }
					: undefined,
				team: {
					createMany:
						filteredMembers.length > 0
							? {
									data: filteredMembers.map(
										({ employeeId, isLeader = false }) => ({
											employeeId,
											isLeader,
										})
									),
									skipDuplicates: true,
							  }
							: undefined,
					deleteMany:
						removedMembers.length > 0
							? {
									projectId: req.query.id as string,
									id: {
										in: removedMembers.map((member) => member.id),
									},
							  }
							: undefined,
					updateMany: {
						where: {
							id: {
								in: newLeaders,
							},
						},
						data: {
							isLeader: true,
						},
					},
				},
			},
			select: selectQuery,
		})) as unknown as ProjectType;

		if (removedLeaders.length > 0) {
			const leaders = removedLeaders.filter((item) => {
				const removed = removedMembers.find((member) => member.id === item);
				if (!removed) return true;
				return false;
			});

			await prisma.projectTeam.updateMany({
				where: {
					id: {
						in: leaders,
					},
				},
				data: {
					isLeader: false,
				},
			});
		}

		// Adding/Removing permissions
		const viewers: string[] = [];
		if (updated.client) {
			viewers.push(updated.client.contact.id);
		}
		updated.team.forEach((member) => {
			viewers.push(member.employee.user.id);
		});
		const leaders = updated.team
			.filter((member) => member.isLeader === true)
			.map((member) => member.employee.user.id);

		const permPromises = [
			updateObjectPermissions({
				model: 'projects',
				permissions: ['VIEW'],
				objectId: updated.id,
				users: viewers,
			}),
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
		];

		const projectTasks = await prisma.projectTask.findMany({
			where: {
				projectId: project.id,
			},
			select: {
				id: true,
			},
		});

		if (removedMembers.length > 0) {
			// remove permissions for removed team members
			permPromises.push(
				removeObjectPermissions({
					model: 'projects',
					objectId: project.id,
					users: removedMembers.map((member) => member.employee.user.id),
				}),
				prisma.$transaction(
					projectTasks.map((task) => {
						return prisma.permissionObject.update({
							where: {
								modelName_objectId_permission: {
									objectId: task.id,
									modelName: 'projects_tasks',
									permission: 'VIEW',
								},
							},
							data: {
								users: {
									disconnect: removedMembers.map((member) => ({
										id: member.employee.user.id,
									})),
								},
							},
						});
					})
				)
			);
		}

		if (
			(!data.client && project.client) ||
			(project.client && data.client && data.client !== project.client?.id)
		) {
			// Remove the old client object permissions
			permPromises.push(
				removeObjectPermissions({
					model: 'projects',
					objectId: updated.id,
					users: [project.client.contact.id],
				})
			);
		}

		await Promise.all(permPromises);

		return res.status(200).json({
			status: 'success',
			message: 'Project updated successfully',
			data: updated,
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
