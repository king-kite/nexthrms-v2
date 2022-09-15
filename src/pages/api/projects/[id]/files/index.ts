import { Prisma } from '@prisma/client';

import {
	prisma,
	getProjectFiles,
	projectFileSelectQuery as selectQuery,
} from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { CreateProjectFileQueryType } from '../../../../../types';
import { projectFileCreateSchema } from '../../../../../validators';

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
		const _data: CreateProjectFileQueryType =
			await projectFileCreateSchema.validateAsync({ ...req.body });

		let data: Prisma.ProjectFileCreateInput = {
			..._data,
			project: {
				connect: {
					id: req.query.id as string,
				},
			},
		};

		if (req.user.employee)
			data.employee = {
				connect: {
					id: req.user.employee.id,
				},
			};

		const file = await prisma.projectFile.create({
			data,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Project file created successfully',
			data: file,
		});
	});
