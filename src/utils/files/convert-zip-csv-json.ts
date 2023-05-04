import fs from 'fs';
import JSZip from 'jszip';

import csvToJson from './convert-csv';
import { exportPermissionHeaders as permissionHeaders } from '../../config';
import { ObjectPermissionImportType } from '../../types';

export default function convertZip<DataType = any>(
	file: string,
	options: {
		headers?: string[];
		name: string;
		onLoadData: (data: DataType[]) => Promise<any>;
		onLoadPermissions: (
			permissions: ObjectPermissionImportType[]
		) => Promise<any>;
	}
) {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(file, async function (err, info) {
				if (err) throw err;
				const zipFile = await JSZip.loadAsync(info);
				const data = await zipFile.file(options.name)?.async('string');
				if (!data) {
					return reject({
						status: 404,
						message: `zip file does not contain the ${options.name} file.`,
					});
				}
				const permissions = await zipFile
					.file('permissions.csv')
					?.async('string');
				if (!permissions) {
					return reject({
						status: 404,
						message: 'zip file does not contain the permissions.csv file.',
					});
				}
				csvToJson(data, {
					headers: options.headers,
					isPath: false,
				})
					.then((data: DataType[]) => options.onLoadData(data))
					.then(() =>
						csvToJson(permissions, {
							headers: permissionHeaders,
							isPath: false,
						})
					)
					.then((data: ObjectPermissionImportType[]) =>
						options.onLoadPermissions(data)
					)
					.then(() => resolve(undefined))
					.catch((error) => reject(error));
			});
		} catch (error) {
			reject(error);
		}
	});
}
