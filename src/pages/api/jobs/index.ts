import { prisma, getJobs } from '../../../db';
import { auth } from '../../../middlewares';
import { createJobSchema, multipleDeleteSchema, validateParams } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getJobs(params);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched jobs successfully. A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const data: {
			name: string;
		} = await createJobSchema.validateAsync({ ...req.body });
		const job = await prisma.job.create({
			data,
			select: {
				id: true,
				name: true,
			},
		});
		return res.status(201).json({
			status: 'success',
			message: 'Job created successfully!',
			data: job,
		});
	})
	.delete(async (req, res) => {
		const valid: { values: string[] } =
			await multipleDeleteSchema.validateAsync({
				...req.body,
			});

		await prisma.job.deleteMany({
			where: {
				id: {
					in: valid.values,
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Deleted jobs successfully',
		});
	});
