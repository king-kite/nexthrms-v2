import excelJS from 'exceljs';
import JSZip from 'jszip';

import prisma from '../client';
import { exportPermissionHeaders as permissionHeaders } from '../../config';
import { ObjectPermissionImportType } from '../../types';
import { uploadBuffer } from '../../utils/files';

function exportData(
	result: {
		data: any;
		permissions?: ObjectPermissionImportType[];
	},
	headers: string[],
	options: {
		permissionTitle?: string;
		title?: string;
		type: string; // 'csv' | 'excel';
		userId?: string;
	} = {
		type: 'csv',
	}
) {
	return new Promise<{ file: string; size: number | null }>(
		async (resolve, reject) => {
			try {
				const csvTitle = (options.title || 'Data').toLowerCase() + '.csv';
				const excelTitle = (options.title || 'Data').toLowerCase() + '.xlsx';
				const zipTitle = (options.title || 'Data').toLowerCase() + '.zip';

				let uploadInfo: {
					buffer: Buffer;
					location: string;
					name: string;
				} | null = null;

				const workbook = new excelJS.Workbook(); // Create a new workbook
				const worksheet = workbook.addWorksheet(options.title || 'Data'); // New Worksheet

				// Add the headers
				worksheet.columns = headers.map((key) => ({
					header: key,
					key,
				}));

				// Add the data/content
				worksheet.addRows(result.data);

				if (options.type === 'csv') {
					const data = Buffer.from(await workbook.csv.writeBuffer());
					if (result.permissions) {
						// Store the files as a zip and update the uploadInfo variable if the permissions are provided
						const permissionWorkbook = new excelJS.Workbook(); // Create a new workbook
						const permissionWorksheet =
							permissionWorkbook.addWorksheet('Permissions'); // New Worksheet
						// Add the headers
						permissionWorksheet.columns = permissionHeaders.map((key) => ({
							header: key,
							key,
						}));
						// Add the data/content
						permissionWorksheet.addRows(result.permissions);

						const permissions = Buffer.from(
							await permissionWorkbook.csv.writeBuffer()
						);

						const zip = new JSZip();
						zip.file(csvTitle, data);
						zip.file('permissions.csv', permissions);

						const buffer = Buffer.from(
							await zip.generateAsync({ type: 'arraybuffer' })
						);

						uploadInfo = {
							buffer,
							location: 'media/exports/' + zipTitle,
							name: zipTitle,
						};
					} else {
						uploadInfo = {
							buffer: data,
							location: 'media/exports/' + csvTitle,
							name: csvTitle,
						};
					}
				} else {
					// Add another worksheet for data and permissions
					if (result.permissions) {
						const permissionWorksheet = workbook.addWorksheet('Permissions'); // New Permission Worksheet

						permissionWorksheet.columns = permissionHeaders.map((key) => ({
							header: key,
							key,
						}));

						permissionWorksheet.addRows(result.permissions);
					}

					const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
					uploadInfo = {
						buffer,
						location: 'media/exports/' + excelTitle,
						name: excelTitle,
					};
				}
				// upload the buffer
				if (uploadInfo) {
					const upload = await uploadBuffer(uploadInfo);
					// Create managed file
					const data = await prisma.managedFile.create({
						data: {
							url: upload.secure_url || upload.url,
							name: uploadInfo.name,
							size: upload.bytes,
							storageInfo: {
								public_id: upload.public_id,
								name: upload.original_filename,
								location: upload.location,
								type: upload.resource_type,
							},
							type: 'file',
							user: options.userId
								? {
										connect: {
											id: options.userId,
										},
								  }
								: undefined,
						},
						select: { url: true, size: true },
					});
					resolve({
						file: data.url,
						size: data.size,
					});
				}
			} catch (error) {
				reject(error);
			}
		}
	);
}

export default exportData;
