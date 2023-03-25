import { permissions } from '../../../config';
import {
	prisma,
	getProjects,
	projectSelectQuery as selectQuery,
} from '../../../db';
import {
	addObjectPermissions,
	getRecords,
	updateObjectPermissions,
} from '../../../db/utils';
import { auth } from '../../../middlewares';
import { adminMiddleware as admin } from '../../../middlewares/api';
import { CreateProjectQueryType, ProjectType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { projectCreateSchema } from '../../../validators';

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

		const data: CreateProjectQueryType =
			await projectCreateSchema.validateAsync({ ...req.body });

		const project = (await prisma.project.create({
			data: {
				...data,
				client: data.client
					? {
							connect: {
								id: data.client,
							},
					  }
					: undefined,
				team:
					data.team && data.team.length > 0
						? {
								createMany: {
									data: data.team.map(({ employeeId, isLeader = false }) => ({
										employeeId,
										isLeader,
									})),
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
			...project.team.map((member) =>
				addObjectPermissions({
					model: 'projects_team',
					objectId: member.id,
					users: [req.user.id],
				})
			),
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
			...project.team.map((member) =>
				updateObjectPermissions({
					model: 'projects_team',
					permissions: ['VIEW'],
					objectId: member.id,
					users: viewers,
				})
			),
		]);

		return res.status(201).json({
			status: 'success',
			message: 'Created project successfully!',
			data: project,
		});
	});
