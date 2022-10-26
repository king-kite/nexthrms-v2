import { Prisma } from '@prisma/client';

import {
	firebaseBucket,
	prisma,
	getProjectFiles,
	projectFileSelectQuery as selectQuery,
} from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { CreateProjectFileQueryType } from '../../../../../types';
import parseForm from '../../../../../utils/parseForm';
import { projectFileCreateSchema } from '../../../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const files = await getProjectFiles({ id: req.query.id as string });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched project files successfully',
			data: files,
		});
	})
	.post(async (req, res) => {
		const { fields, files } = await parseForm(req);

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

		// Upload a file to the bucket using firebase admin
		const [obj, file] = await firebaseBucket.upload(files.file.filepath, {
			contentType: files.file.mimetype || undefined,
			destination: `projects/${form.name.toLowerCase()}_${files.file.originalFilename?.toLowerCase()}`,
		});

		let data: Prisma.ProjectFileCreateInput = {
			project: {
				connect: {
					id: req.query.id as string,
				},
			},
			type: files.file.mimetype || undefined,
			name: String(fields.name),
			file: file.mediaLink,
			size: file.size,
			storageName: file.name,
			storageGeneration: file.generation,
		};

		if (req.user.employee)
			data.employee = {
				connect: {
					id: req.user.employee.id,
				},
			};

		const result = await prisma.projectFile.create({
			data,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Project file created successfully',
			data: result,
		});
	});
