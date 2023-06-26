import { permissions } from '../../../config';
import {
	prisma,
	getProjects,
	projectSelectQuery as selectQuery,
} from '../../../db';
import {
	addObjectPermissions,
	getRecords,
	hasObjectPermission,
	updateObjectPermissions,
} from '../../../db/utils';
import { auth } from '../../../middlewares';
import { adminMiddleware as admin } from '../../../middlewares/api';
import { ProjectType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { projectCreateSchema } from '../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const result = await getRecords({
			model: 'projects',
			perm: 'project',
			placeholder: {
				total: 0,
				result: [],
				completed: 0,
				ongoing: 0,
			},
			query: req.query,
			user: req.user,
			getData(params) {
				return getProjects(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.use(admin)
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.project.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await projectCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
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

		if (filteredMembers) {
			// Check that the employee the user is adding in are ones the user can view
			// to avoid guessing
			let hasViewEmployeePerm =
				req.user.isSuperUser ||
				hasModelPermission(req.user.allPermissions, [
					permissions.employee.VIEW,
				]);

			if (!hasViewEmployeePerm) {
				const viewEmployeePerms = await Promise.all(
					filteredMembers.map((member) => {
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
		}

		const project = (await prisma.project.create({
			data: {
				...data,
				description: data.description ? data.description : '',
				client: data.client
					? {
							connect: {
								id: data.client,
							},
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

		// Assign all object level permissions for the project and project team to the request user only
		await Promise.all([
			addObjectPermissions({
				model: 'projects',
				objectId: project.id,
				users: [req.user.id],
			}),
		]);

		// Assign view object level permissions for the project team and client
		// and also give create project task permissions to the project leaders
		const viewers: string[] = [];
		if (project.client) viewers.push(project.client.contact.id);
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
		]);

		return res.status(201).json({
			status: 'success',
			message: 'Created project successfully!',
			data: project,
		});
	});
