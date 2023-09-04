import axios from 'axios';
import { models } from '../../../../../config/app';
import { USER_OBJECT_PERMISSIONS_URL } from '../../../../../config/services';
import handler from '../../../../../middlewares';
import type { PermissionModelChoices, PermissionObjectChoices } from '../../../../../types';
import { NextErrorMessage } from '../../../../../utils/classes';

export default handler().get(async (req, res) => {
	if (!models.includes(req.query.model?.toString() || ''))
		throw new NextErrorMessage(404, 'Table was not found.');

	if (!req.query.objectId)
		throw new NextErrorMessage(404, 'Record with the specified ID was not found.');

	const model = req.query.model?.toString() as PermissionModelChoices;
	const objectId = req.query?.objectId as string;
	const permission = req.query.permission as PermissionObjectChoices | undefined;

	const url = USER_OBJECT_PERMISSIONS_URL(model, objectId, permission);
	const response = await axios.get(url);
	return res.status(200).json(response.data);
});
