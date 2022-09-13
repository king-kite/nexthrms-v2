import { prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { createJobSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const job = await prisma.job.findUnique({
			where: {
				id: req.query.id as string,
			},
		});
		if (!job) {
			return res.status(404).json({
				status: 'error',
				message: 'Job with specified ID was not found!',
			});
		}
		return res.status(200).json({
			status: 'success',
			message: 'Fetched job successfully',
			data: job,
		});
	})
	.put(async (req, res) => {
		const data: {
			name: string;
		} = await createJobSchema.validateAsync({ ...req.body });
		const job = await prisma.job.update({
			where: {
				id: req.query.id as string,
			},
			data,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Job updated successfully',
			data: job,
		});
	})
	.delete(async (req, res) => {
		await prisma.job.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Job deleted successfully',
		});
	});
