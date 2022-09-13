import { Prisma } from '@prisma/client';

import { getDepartments, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import {
	createDepartmentSchema,
	multipleDeleteSchema,
	validateParams,
} from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getDepartments({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched departments successfully. A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const valid: {
			name: string;
			hod: string | null;
		} = await createDepartmentSchema.validateAsync({ ...req.body });

		let data: Prisma.DepartmentCreateInput = { name: valid.name };

		if (valid.hod !== null && valid.hod !== undefined) {
			data = { ...data, hod: { connect: { id: valid.hod } } };
		}

		const department = await prisma.department.create({
			data,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Department created successfully',
			data: department,
		});
	})
	.delete(async (req, res) => {
		const valid: { values: string[] } =
			await multipleDeleteSchema.validateAsync({
				...req.body,
			});

		await prisma.department.deleteMany({
			where: {
				id: {
					in: valid.values,
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Deleted departments successfully',
		});
	});

const selectQuery = {
	id: true,
	name: true,
	hod: {
		select: {
			id: true,
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
					profile: {
						select: {
							image: true,
						},
					},
					employee: {
						select: {
							job: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			},
		},
	},
	_count: {
		select: { employees: true },
	},
};
