import { Prisma } from '@prisma/client';

import {
	permissions,
	MEDIA_URL,
	MEDIA_HIDDEN_FILE_NAME,
} from '../../../config';
import { getManagedFiles, prisma, managedFileSelectQuery } from '../../../db';
import {
	addObjectPermissions,
	createNotification,
	getRecords,
	getUserObjects,
} from '../../../db/utils';
import { auth } from '../../../middlewares';
import { CreateManagedFileType, ManagedFileType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile, uploadBuffer } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import {
	deleteManagedFilesSchema,
	handlePrismaErrors,
	managedFileCreateSchema,
} from '../../../validators';

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
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.managedfile.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const { fields, files } = (await parseForm(req)) as {
			files: any;
			fields: any;
		};

		const data: CreateManagedFileType = {
			directory: fields.directory || '',
			file: files.file,
			name: fields.name,
			type: fields.type,
		};

		await managedFileCreateSchema.validateAsync(data);

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
				data.directory +
				`${data.name
					.toLowerCase()
					.trim()
					.replaceAll(' ', '-')}_${new Date().getTime()}`;

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

		// Create folder if file is not sent, just directory
		const location =
			MEDIA_URL + data.directory + data.name + '/' + MEDIA_HIDDEN_FILE_NAME;

		const upload = await uploadBuffer({
			buffer: Buffer.from([]),
			location,
			name: MEDIA_HIDDEN_FILE_NAME,
		});

		const result = (await prisma.managedFile.create({
			data: {
				url: upload.secure_url || upload.url,
				name: MEDIA_HIDDEN_FILE_NAME,
				size: upload.bytes || 0,
				type: 'hidden',
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
	})
	.delete(async (req, res) => {
		const valid: {
			files?: string[];
			folder?: string;
		} = await deleteManagedFilesSchema.validateAsync({ ...req.body });

		if (!valid.files && !valid.folder) {
			return res.status(400).json({
				status: 'error',
				message: 'Provide a folder or a files array.',
			});
		}

		if (valid.files && valid.files.length <= 0) {
			return res.status(400).json({
				status: 'error',
				message: 'No file was sent.',
			});
		}

		const promise = new Promise(async (resolve, reject) => {
			try {
				let folder = valid.folder ? valid.folder.trim() : null;
				folder = folder ? (folder.endsWith('/') ? folder : folder + '/') : null;
				const files = folder
					? await prisma.managedFile.findMany({
							where: {
								OR: [
									{
										storageInfo: {
											path: ['location'],
											string_starts_with: folder,
										},
									},
									{
										storageInfo: {
											path: ['public_id'],
											string_starts_with: folder,
										},
									},
								],
							},
							select: { id: true },
					  })
					: valid.files?.map((item) => ({ id: item }));

				if (!files) {
					await createNotification({
						message: 'No files found',
						recipient: req.user.id,
						title: folder
							? 'Failed to delete folder'
							: 'Failed to delete files',
						type: 'ERROR',
					});
					return reject({
						message: 'No files found',
					});
				}

				const hasPerm =
					req.user.isSuperUser ||
					hasModelPermission(req.user.allPermissions, [
						permissions.managedfile.DELETE,
					]);

				let validFiles: string[] = [];

				if (hasPerm) validFiles = files.map((item) => item.id);
				else {
					// get user objects
					const validObjects = await getUserObjects({
						modelName: 'managed_files',
						userId: req.user.id,
						permission: 'DELETE',
					});
					const fileIds = validObjects.map((item) => item.objectId);
					// check that every file in the files array is in the fileIds array
					validFiles = files
						.filter((item) => fileIds.includes(item.id))
						.map((item) => item.id);
				}

				// if validFiles.length !== files.length, it means not all files are authorized;
				if (validFiles.length !== files.length)
					await createNotification({
						message:
							'You do not have permission to delete some of the requested files.',
						recipient: req.user.id,
						title: 'Authorization Failed',
						type: 'ERROR',
					});

				console.log(files);
				await createNotification({
					message: '',
					recipient: req.user.id,
					title: folder
						? 'Folder Deleted Successfully!'
						: 'Files Deleted Successfully!',
					type: 'SUCCESS',
				});
				resolve(undefined);
			} catch (error) {
				const err = handlePrismaErrors(error);
				reject({
					message: err.message,
				});
			}
		});

		return res.status(200).json({
			status: 'success',
			message:
				'A notification will be sent to you when the task is completed. \nDo note that only files you are authorized to remove will be deleted.',
		});
	});
