import { OBJECT_PERMISSIONS_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { objectPermissionSchema } from '../../../../../validators/users';

export default auth()
	.get(async (req, res) => {
		const { groupLimit, groupOffset, groupSearch, userLimit, userOffset, userSearch } = req.query;

		const url = OBJECT_PERMISSIONS_URL(
			req.query.model as string,
			req.query.objectId as string,
			req.query.permission as string | undefined,
			{
				limit: groupLimit ? parseInt(groupLimit.toString()) : undefined,
				offset: groupOffset ? parseInt(groupOffset.toString()) : undefined,
				search: groupSearch ? groupSearch.toString() : undefined,
			},
			{
				limit: userLimit ? parseInt(userLimit.toString()) : undefined,
				offset: userOffset ? parseInt(userOffset.toString()) : undefined,
				search: userSearch ? userSearch.toString() : undefined,
			}
		);

		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	// middleware for post, put, delete
	.use(async (req, res, next) => {
		const permission = req.query.permission;

		if (!permission) {
			return res.status(404).json({
				status: 'error',
				message: 'Permission type not found! Please provide this parameter',
			});
		}

		const { groups, users } = req.body;
		if (!groups && !users) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Data. Provide a groups or users field with an array of IDs',
			});
		}

		next();
	})
	// Sets the users and groups permissions
	.post(async (req, res) => {
		const modelName = req.query.model as string;
		const objectId = req.query.objectId as string;
		const permission = req.query.permission as string;

		const data = await objectPermissionSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const url = OBJECT_PERMISSIONS_URL(modelName, objectId, permission);

		const response = await axiosJn(req).post(url, data);
		return res.status(200).json(response.data);
	})
	// Update/Connects the users and groups permissions
	.put(async (req, res) => {
		const modelName = req.query.model as string;
		const objectId = req.query.objectId as string;
		const permission = req.query.permission as string;

		const data = await objectPermissionSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const url = OBJECT_PERMISSIONS_URL(modelName, objectId, permission);

		const response = await axiosJn(req).put(url, data);
		return res.status(200).json(response.data);
	})
	// Dissconnects the users and groups permissions
	.delete(async (req, res) => {
		const modelName = req.query.model as string;
		const objectId = req.query.objectId as string;
		const permission = req.query.permission as string;

		const data = await objectPermissionSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const url = OBJECT_PERMISSIONS_URL(modelName, objectId, permission);

		const response = await axiosJn(req)({
			url,
			method: 'DELETE',
			data,
		});
		return res.status(200).json(response.data);
	});
