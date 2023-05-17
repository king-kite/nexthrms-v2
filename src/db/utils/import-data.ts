import { csvToJson, excelToJson, zipCsvToJson } from '../../utils/files';
import { ObjectPermissionImportType } from '../../types';

export function importData<DataType = any>({
	headers,
	path,
	type,
	zipName = 'data.csv',
}: {
	headers: string[];
	path: string;
	type: string;
	zipName?: string;
}) {
	return new Promise<{
		data: DataType[];
		permissions?: ObjectPermissionImportType[];
	}>((resolve, reject) => {
		try {
			if (type === 'application/zip') {
				zipCsvToJson<DataType>(path, { name: zipName, headers })
					.then((result) => resolve(result))
					.catch((error) => reject(error));
			} else if (type === 'text/csv') {
				csvToJson(path, { headers })
					.then((data: DataType[]) => resolve({ data }))
					.catch((error) => reject(error));
			} else {
				excelToJson(path, { headers })
					.then(
						(result: {
							data: DataType[];
							permissions?: ObjectPermissionImportType[];
						}) => resolve(result)
					)
					.catch((error) => reject(error));
			}
		} catch (error) {
			reject(error);
		}
	});
}

export default importData;