import {
	prisma,
	getHolidays,
	holidaySelectQuery as selectQuery,
} from '../../../db';
import { auth } from '../../../middlewares';
import {
	createHolidaySchema,
	multipleDeleteSchema,
	validateParams,
} from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getHolidays({ ...params });

		return res.status(200).json({
			status: 'error',
			message: 'Fetched Holidays Successfully. A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const valid: {
			name: string;
			date: Date | string;
		} = await createHolidaySchema.validateAsync({ ...req.body });

		const holiday = await prisma.holiday.create({
			data: valid,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Holiday created successfully!',
			data: holiday,
		});
	})
	.delete(async (req, res) => {
		const valid: { values: string[] } =
			await multipleDeleteSchema.validateAsync({ ...req.body });

		if (valid.values.length < 1) {
			return res.status(400).json({
				status: 'error',
				message:
					'Invalid Data. Provide at least 1 holiday ID in the values array.',
			});
		}

		await prisma.holiday.deleteMany({
			where: {
				id: {
					in: valid.values,
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message:
				'Holiday' +
				(valid.values.length > 1 ? 's were ' : ' was ') +
				'deleted successfully',
		});
	});
