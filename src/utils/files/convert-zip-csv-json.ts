import fs from 'fs';
import JSZip from 'jszip';

import csvToJson from './convert-csv';
import { exportPermissionHeaders as permissionHeaders } from '../../config';
import { ObjectPermissionImportType } from '../../types';

type ConvertReturnType<DataType> = {
	data: DataType[];
	permissions: ObjectPermissionImportType[];
};

export default function convertZip<DataType = any>(
	file: string,
	options: {
		headers?: string[];
		name: string;
		onLoadData?: (data: DataType[]) => Promise<any>;
		onLoadPermissions?: (
			permissions: ObjectPermissionImportType[]
		) => Promise<any>;
	}
) {
	return new Promise<ConvertReturnType<DataType>>((resolve, reject) => {
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
				const result: ConvertReturnType<DataType> = {
					data: [],
					permissions: [],
				};
				csvToJson(data, {
					headers: options.headers,
					isPath: false,
				})
					.then((data: DataType[]) => {
						result.data = data;
						if (options.onLoadData) return options.onLoadData(data);
					})
					.then(() =>
						csvToJson(permissions, {
							headers: permissionHeaders,
							isPath: false,
						})
					)
					.then((data: ObjectPermissionImportType[]) => {
						result.permissions = data;
						if (options.onLoadPermissions)
							return options.onLoadPermissions(data);
					})
					.then(() => resolve(result))
					.catch((error) => reject(error));
			});
		} catch (error) {
			reject(error);
		}
	});
}
