import { Prisma } from '@prisma/client';

import {
	permissions,
	MEDIA_URL,
	MEDIA_HIDDEN_FILE_NAME,
} from '../../../config';
import { getManagedFiles, prisma, managedFileSelectQuery } from '../../../db';
import { addObjectPermissions, getRecords } from '../../../db/utils';
import { auth } from '../../../middlewares';
import { CreateManagedFileType, ManagedFileType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile, uploadBuffer } from '../../../utils/files';
import { managedFileCreateSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const result = await getRecords({
			model: 'managed_files',
			perm: 'managedfile',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getManagedFiles(params);
			},
		});
		if (result) return res.status(200).json(result);
		return {
			status: 'success',
			message: 'Fetched data successfully',
			data: {
				total: 0,
				result: [],
			},
		};
	})
	.post(async (req, res) => {
		const hasPerm = hasModelPermission(req.user.allPermissions, [
			permissions.managedfile.CREATE,
		]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: CreateManagedFileType =
			await managedFileCreateSchema.validateAsync({
				...req.body,
			});

		if (data.type === 'file' && !data.file) {
			return res.status(400).json({
				status: 'error',
				message: 'File is required!',
			});
		}

		let input: Prisma.ManagedFileCreateInput | null = null;

		// Create file if file sent
		if (data.file) {
			// Upload a file to the bucket using firebase admin

			const location =
				MEDIA_URL +
				(data.directory || '') +
				`${data.name.toLowerCase()}_${new Date().getTime()}`;

			const result = await uploadFile({
				file: data.file,
				location,
			});

			input = {
				url: result.secure_url || result.url,
				name: data.name,
				size: data.file.size,
				type: data.file.mimetype,
				storageInfo: {
					location: result.location,
					public_id: result.public_id,
					name: result.original_filename,
					type: result.resource_type,
				},
				user: {
					connect: {
						id: req.user.id,
					},
				},
			};

			if (input) {
				const result = (await prisma.managedFile.create({
					data: input,
					select: managedFileSelectQuery,
				})) as unknown as ManagedFileType;

				await addObjectPermissions({
					model: 'managed_files',
					objectId: result.id,
					users: [req.user.id],
				});

				return res.status(201).json({
					status: 'success',
					message: 'Added new file successfully!',
					data: result,
				});
			}
		}

		// Create folder is not file is sent, just directory
		const location = MEDIA_URL + data.directory || '' + MEDIA_HIDDEN_FILE_NAME;

		const upload = await uploadBuffer({
			buffer: Buffer.from([]),
			location,
			name: data.name,
		});

		const result = (await prisma.managedFile.create({
			data: {
				url: upload.secure_url || upload.url,
				name: data.name,
				size: upload.bytes || 0,
				type: 'file',
				storageInfo: {
					location: upload.location,
					public_id: upload.public_id,
					name: upload.original_filename,
					type: upload.resource_type,
				},
				user: {
					connect: {
						id: req.user.id,
					},
				},
			},
			select: managedFileSelectQuery,
		})) as unknown as ManagedFileType;

		await addObjectPermissions({
			model: 'managed_files',
			objectId: result.id,
			users: [req.user.id],
		});

		return res.status(201).json({
			status: 'success',
			message: 'Added new folder successfully!',
			data: result,
		});
	});
