import Joi from 'joi';

export const createAssetSchema = Joi.object({
	assetId: Joi.string().required().label('Asset ID'),
	condition: Joi.string()
		.valid('BAD', 'GOOD', 'EXCELLENT')
		.required()
		.label('Condition'),
	description: Joi.string().optional().allow('').label('Description'),
	model: Joi.string().optional().allow('').label('Model'),
	manufacturer: Joi.string().required().label('Manufacturer'),
	name: Joi.string().required().label('Name'),
	purchaseDate: Joi.string().required().label('Purchase Date'),
	purchaseFrom: Joi.string().required().label('Purchase From'),
	serialNo: Joi.string().required().label('Serial Number'),
	status: Joi.string()
		.valid('APPROVED', 'DENIED', 'PENDING', 'RETURNED')
		.required()
		.label('Status'),
	supplier: Joi.string().required().label('Supplier'),
	warranty: Joi.number().required().label('Warranty'),
	value: Joi.number().required().label('Value'),
	userId: Joi.string().required().label('User ID'),
});
