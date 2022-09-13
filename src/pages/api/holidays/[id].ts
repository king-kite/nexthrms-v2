import { prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { createHolidaySchema } from '../../../validators';

const selectQuery = {
	id: true,
	name: true,
	date: true,
};

export default auth()
	.get(async (req, res) => {
		const holiday = await prisma.holiday.findUnique({
			where: {
				id: req.query.id as string,
			},
			select: selectQuery,
		});
		if (!holiday) {
			return res.status(404).json({
				status: 'error',
				message: 'Holiday with specified ID was not found!',
			});
		}
		return res.status(200).json({
			status: 'success',
			message: 'Fetched holiday successfully',
			data: holiday,
		});
	})
	.put(async (req, res) => {
		const data: {
			name: string;
			date: string;
		} = await createHolidaySchema.validateAsync({ ...req.body });
		const holiday = await prisma.holiday.update({
			where: {
				id: req.query.id as string,
			},
			data,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Holiday updated successfully',
			data: holiday,
		});
	})
	.delete(async (req, res) => {
		await prisma.holiday.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Holiday deleted successfully',
		});
	});
