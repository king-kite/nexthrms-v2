import { AssetCondition, AssetStatus, Prisma } from '@prisma/client';

import {
	DEFAULT_IMAGE,
	DEFAULT_PASSWORD,
	userHeaders as headers,
	permissions,
} from '../../../config';
import { prisma } from '../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { UserImportQueryType, NextApiRequestExtendUser } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';
import { ObjectPermissionImportType } from '../../../types';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getUserInput(
	user: UserImportQueryType
): Omit<Prisma.UserCreateInput, 'password'> {
	return {
		id: user.id && user.id.length > 0 ? user.id : undefined,
		email: user.email,
		firstName: user.first_name,
		lastName: user.last_name,
		// password: user.last_name.toUpperCase(),
		profile: {
			create: {
				dob: user.dob ? new Date(user.dob) : undefined,
				gender: user.gender || 'MALE',
				image: user.image || DEFAULT_IMAGE,
				address: user.address,
				city: user.city,
				state: user.state,
				phone: user.phone,
			},
		},
		isActive: !!user.is_active,
		isAdmin: !!user.is_admin,
		isSuperUser: !!user.is_superuser,
		isEmailVerified: !!user.email_verified,
		updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
		createdAt: user.created_at ? new Date(user.created_at) : new Date(),
	};
}

function createUsers(
	req: NextApiRequestExtendUser,
	data: UserImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getUserInput);
			// check that every user input has an ID.
			const invalid = input.filter((user) => !user.id);
			if (invalid.length > 0) {
				return reject({
					data: {
						message:
							`An id field is required to avoid duplicate records. The following records do not have an id: ` +
							input.map((user) => user.email).join(','),
						title: 'ID field is required.',
					},
					status: 400,
				});
			}
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.user.upsert({
						where: data.id
							? {
									id: data.id,
							  }
							: {
									email: data.email,
							  },
						update: data,
						create: {
							...data,
							password: DEFAULT_PASSWORD,
						},
						select: {
							id: true,
						},
					})
				)
			);
			await Promise.all(
				result.map((user) =>
					addObjectPermissions({
						model: 'users',
						objectId: user.id,
						users: [req.user.id],
					})
				)
			);
			if (perms) await importPermissions(perms);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

export default admin().post(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.CREATE]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const { files } = (await parseForm(req)) as { files: any };

	if (!files.data)
		throw new NextApiErrorMessage(400, 'Data field is required!');

	if (
		files.data.mimetype !== 'text/csv' &&
		files.data.mimetype !== 'application/zip' &&
		files.data.mimetype !==
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	)
		throw new NextApiErrorMessage(
			400,
			'Sorry, only CSVs, Microsoft excel files and Zip files are allowed!'
		);

	importData<UserImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
		zipName: 'users.csv',
	})
		.then((result) => createUsers(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Users data was imported successfully.',
				recipient: req.user.id,
				title: 'Import User Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import User Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
