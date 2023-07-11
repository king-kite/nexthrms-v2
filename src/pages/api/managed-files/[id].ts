import path from 'path';

import { permissions, MEDIA_URL } from '../../../config';
import prisma from '../../../db';
import {
	getManagedFile,
	managedFileSelectQuery,
} from '../../../db/queries/managed-files';
import { getRecord, hasObjectPermission } from '../../../db/utils';
import { auth } from '../../../middlewares';
import { ManagedFileType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextErrorMessage } from '../../../utils/classes';
import { deleteFile } from '../../../utils/files';

export default auth()
	.get(async (req, res) => {
		const record = await getRecord({
			model: 'managed_files',
			perm: 'managedfile',
			permission: 'VIEW',
			user: req.user,
			objectId: req.query.id as string,
			getData() {
				return getManagedFile(req.query.id as string);
			},
		});

		if (!record) throw new NextErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: '404',
				message: 'File record with the specified ID was not found',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched data successfully!',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.managedfile.EDIT,
			]);

		if (!hasPerm) {
			// check if the user has delete object permission for this object
			hasPerm = await hasObjectPermission({
				model: 'managed_files',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
		}

		if (!hasPerm) throw new NextErrorMessage(403);

		const name = req.body.name;
		if (!name || typeof name !== 'string') {
			return res.status(400).json({
				status: 'error',
				message: 'name field is required and must be a string!',
			});
		}

		const file = (await prisma.managedFile.findUnique({
			where: { id: req.query.id as string },
			select: managedFileSelectQuery,
		})) as unknown as ManagedFileType;

		if (!file) {
			return res.status(404).json({
				status: 'error',
				message: 'File with the specified ID does not exist!',
			});
		}

		let location = file.storageInfo
			? path.dirname(
					file.storageInfo?.location || file.storageInfo?.public_id || ''
			  )
			: undefined;
		if (!location) {
			// get the location from the url
			const _split = file.url.split(MEDIA_URL);
			// skip the last item in the split array if every item is empty i.e. 'media/media/' => ['', '', '']
			const skipLast = _split.every((item) => item === '');
			location = path.dirname(
				_split.reduce((acc: string, item: string, index: number) => {
					if (index === 0) return acc;
					// Last item and skipLast
					if (index === _split.length - 1 && skipLast) return acc;
					if (item === '') return acc + MEDIA_URL;
					return acc + item;
				}, '')
			);
		}
		if (!location.endsWith('/')) location += '/';

		// check if a file with the same name already exists in that location
		const exists = await prisma.managedFile.findFirst({
			where: {
				name,
				OR: [
					{
						storageInfo: {
							path: ['location'],
							string_starts_with: location,
						},
					},
					{
						storageInfo: {
							path: ['public_id'],
							string_starts_with: location,
						},
					},
				],
			},
			select: { id: true },
		});

		if (exists && exists.id !== file.id)
			return res.status(400).json({
				status: 'error',
				message: 'A file with specified name already exists!',
			});

		const data = await prisma.managedFile.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				name,
			},
			select: managedFileSelectQuery,
		});

		return res.status(200).json({
			status: 'success',
			messsage: 'File updated successfully!',
			data,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.managedfile.DELETE,
			]);

		if (!hasPerm) {
			// check if the user has delete object permission for this object
			hasPerm = await hasObjectPermission({
				model: 'managed_files',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
		}

		if (!hasPerm) throw new NextErrorMessage(403);

		const record = await prisma.managedFile.findUnique({
			where: { id: req.query.id as string },
		});

		if (!record) throw new NextErrorMessage(404);

		await deleteFile((record.storageInfo as any)?.public_id || record.url);

		await prisma.managedFile.delete({
			where: {
				id: req.query.id as string,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'File deleted successfully!',
		});
	});
