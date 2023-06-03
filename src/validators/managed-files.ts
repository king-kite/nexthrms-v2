import Joi from 'joi';

export const managedFileCreateSchema = Joi.object({
	name: Joi.string().required().label('Name'),
	directory: Joi.string().optional().allow('').label('Directory'),
	file: Joi.object().unknown().optional().allow(null).label('File'),
	type: Joi.string().valid('file', 'folder').required().label('Type'),
});
