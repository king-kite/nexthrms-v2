import excelJS from 'exceljs';
import { parse } from 'json2csv';
import JSZip from 'jszip';

import prisma from '../client';
import { uploadBuffer } from '../../utils/files';

const permissionHeaders = ['name', 'object_id', 'permission', 'is_user'];

function exportData(
	result: {
		data: any;
		permissions?: {
			is_user: boolean;
			name: string;
			object_id: string;
			permission: 'DELETE' | 'EDIT' | 'VIEW';
		}[];
	},
	headers: string[],
	options: {
		permissionTitle?: string;
		title: string;
		type: string; // 'csv' | 'excel';
		userId?: string;
	} = {
		title: 'Sheet 1',
		type: 'csv',
	}
) {
	return new Promise<{ file: string; size: number | null }>(
		async (resolve, reject) => {
			try {
				const csvTitle = options.title.toLowerCase() + '.csv';
				const excelTitle = options.title.toLowerCase() + '.xlsx';
				const zipTitle = options.title.toLowerCase() + '.zip';

				let uploadInfo: {
					buffer: Buffer;
					location: string;
					name: string;
				} | null = null;

				if (options.type === 'csv') {
					const data = parse(result.data);
					if (result.permissions) {
						// Store the files as a zip and update the uploadInfo variable if the permissions are provided
						const permissions = parse(result.permissions);
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
						const buffer = Buffer.from(data, 'utf-8'); // Buffer.alloc(data.length, data)
						uploadInfo = {
							buffer,
							location: 'media/exports/' + csvTitle,
							name: csvTitle,
						};
					}
				} else {
					// Create 2 worksheets for data and permissions
					const workbook = new excelJS.Workbook(); // Create a new workbook
					const worksheet = workbook.addWorksheet(options.title); // New Worksheet

					// Add the headers
					worksheet.columns = headers.map((key) => ({
						header: key,
						key,
					}));

					// Add the data/content
					worksheet.addRows(result.data);

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
							file: upload.secure_url || upload.url,
							name: uploadInfo.name,
							size: upload.bytes,
							storageInfo: {
								id: upload.public_id,
								name: upload.original_filename,
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
						select: { file: true, size: true },
					});
					resolve(data);
				}
			} catch (error) {
				reject(error);
			}
		}
	);
}

export default exportData;
