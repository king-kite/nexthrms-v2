import { Prisma } from '@prisma/client';

import { permissions } from '../../../../../config';
import {
	prisma,
	getProject,
	getProjectFiles,
	projectFileSelectQuery as selectQuery,
} from '../../../../../db';
import {
	addObjectPermissions,
	getRecord,
	getRecords,
	hasViewPermission,
	updateObjectPermissions,
} from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';
import {
	CreateProjectFileQueryType,
	ProjectFileType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { upload as uploadFile } from '../../../../../utils/files';
import parseForm from '../../../../../utils/parseForm';
import { projectFileCreateSchema } from '../../../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

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
			model: 'projects_files',
			perm: 'projectfile',
			query: req.query,
			user: req.user,
			placeholder: {
				result: [],
			},
			getData(params) {
				return getProjectFiles({
					...params,
					id: req.query.id as string,
				});
			},
		});

		return res.status(200).json(
			result || {
				status: 'success',
				message: 'Fetched data successfully',
				data: {
					result: [],
				},
			}
		);
	})
	.post(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projectfile.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const project = await getRecord({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			permission: 'VIEW',
			user: req.user,
			getData() {
				return getProject(req.query.id as string);
			},
		});

		if (!project?.data)
			throw new NextApiErrorMessage(
				404,
				'Project with the specified ID was not found'
			);

		const { fields, files } = (await parseForm(req)) as {
			fields: any;
			files: any;
		};

		if (!files.file || Array.isArray(files.file)) {
			return res.status(400).json({
				status: 'error',
				message: 'File was not provided or is invalid!',
			});
		}

		const form: CreateProjectFileQueryType =
			await projectFileCreateSchema.validateAsync({
				...fields,
				file: files.file,
			});

		const location = `media/projects/${form.name.toLowerCase()}_${files.file.originalFilename?.toLowerCase()}`;

		const result = await uploadFile({
			file: files.file,
			location,
		});

		let data: Prisma.ProjectFileCreateInput = {
			project: {
				connect: {
					id: req.query.id as string,
				},
			},
			file: {
				create: {
					type: files.file.mimetype || 'file',
					name: String(fields.name),
					url: result.secure_url || result.url,
					size: files.file.size,
					storageInfo: {
						name: result.original_filename,
						location: result.location,
						public_id: result.public_id,
						type: result.resource_type,
					},
					userId: req.user.id,
				},
			},
		};

		if (req.user.employee)
			data.employee = {
				connect: {
					id: req.user.employee.id,
				},
			};

		const finalResult = (await prisma.projectFile.create({
			data,
			select: selectQuery,
		})) as unknown as ProjectFileType;

		await Promise.all([
			addObjectPermissions({
				model: 'projects_files',
				objectId: finalResult.id,
				users: [req.user.id],
			}),
			addObjectPermissions({
				model: 'managed_files',
				objectId: finalResult.file.id,
				users: [req.user.id],
			}),
		]);

		const viewers = [];
		if (project.data.client) viewers.push(project.data.client.contact.id);

		project.data.team.forEach((member) => {
			viewers.push(member.employee.user.id);
		});

		await updateObjectPermissions({
			model: 'projects_files',
			permissions: ['VIEW'],
			objectId: finalResult.id,
			users: viewers,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Project file created successfully',
			data: finalResult,
		});
	});
