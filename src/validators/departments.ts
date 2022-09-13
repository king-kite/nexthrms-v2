import Joi from 'joi';

export const createDepartmentSchema = Joi.object({
	name: Joi.string().required().label('Name'),
	hod: Joi.string().uuid().required().allow(null).label('Head Of Department'),
});
