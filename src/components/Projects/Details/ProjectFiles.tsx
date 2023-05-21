import { Button } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { FaTimes, FaFileUpload, FaRegFilePdf } from 'react-icons/fa';

import Form from './AddProjectFileForm';
import { EMPLOYEE_PAGE_URL, permissions } from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useDeleteProjectFileMutation } from '../../../store/queries';
import { ProjectFileType } from '../../../types';
import { downloadFile, hasModelPermission } from '../../../utils';

export type ProjectFilesProps = {
	files: ProjectFileType[];
};

const ProjectFiles = ({ files }: ProjectFilesProps) => {
	const router = useRouter();
	const id = router.query.id as string;
	const [visible, setVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreateFile] = React.useMemo(() => {
		if (!authData) return [];
		const canCreateFile =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.projectfile.CREATE,
			]);
		return [canCreateFile];
	}, [authData]);

	const { deleteProjectFile } = useDeleteProjectFileMutation({
		onError({ message }) {
			open({
				message,
				type: 'danger',
			});
		},
	});

	return (
		<div className="bg-white my-4 p-4 rounded-md shadow-lg">
			<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
				uploaded files
			</h3>
			{canCreateFile && (
				<>
					{visible ? (
						<div>
							<div className="flex justify-end">
								<div
									onClick={() => setVisible(false)}
									className="duration-500 mx-4 p-2 rounded-full text-primary-500 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
								>
									<FaTimes className="text-xs sm:text-sm" />
								</div>
							</div>
							<Form
								accept=".doc,.docx,.pdf"
								type="application"
								label="File"
								projectId={id}
								onClose={() => setVisible(false)}
							/>
						</div>
					) : (
						<div className="flex justify-start my-2 w-full px-3">
							<div className="w-2/3 sm:w-1/3 md:w-1/4">
								<Button
									onClick={() => setVisible(true)}
									iconLeft={FaFileUpload}
									rounded="rounded-lg"
									title="Add File"
								/>
							</div>
						</div>
					)}
				</>
			)}
			{files.length > 0 ? (
				<ul className="divide-y divide-gray-500 divide-opacity-50 mt-2">
					{files.map((file, index) => {
						const date = new Date(file.updatedAt);
						const time = date.toLocaleTimeString();
						const size = String(file.size / (1024 * 1024));
						const sizeString =
							size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
						return (
							<li key={index} className="flex items-start py-2">
								<div className="flex items-center justify-center py-4 w-[15%]">
									<span className="flex items-center justify-center">
										<FaRegFilePdf className="text-xl text-gray-700 md:text-2xl" />
									</span>
								</div>
								<div className="w-[85%]">
									<h5
										onClick={() =>
											downloadFile({
												url: file.file,
												name: file.name,
											})
										}
										className="cursor-pointer text-indigo-600 text-base hover:text-indigo-500 hover:underline"
									>
										{file.name}
									</h5>
									<p className="text-gray-700 text-sm">
										{date.toDateString()} {time}
									</p>
									<p className="capitalize text-gray-700 text-sm">
										Size:{' '}
										<span className="font-medium mx-1 uppercase">
											{sizeString}MB
										</span>
									</p>
									{file.employee && (
										<p className="text-gray-700 text-sm">
											Uploaded by:
											<Link
												href={
													file.employee.id
														? EMPLOYEE_PAGE_URL(file.employee.id)
														: '#'
												}
											>
												<a className="capitalize cursor-pointer inline-block mx-1 text-blue-600 text-sm hover:text-blue-500 hover:underline">
													{file.employee.user.firstName}{' '}
													{file.employee.user.lastName}
												</a>
											</Link>
										</p>
									)}
									<p
										onClick={() => deleteProjectFile(id, file.id)}
										className="capitalize cursor-pointer text-red-600 text-sm hover:text-red-500 hover:underline"
									>
										delete
									</p>
								</div>
							</li>
						);
					})}
				</ul>
			) : (
				<p className="text-sm text-gray-700">
					There are currently no files/documents on this project.
				</p>
			)}
		</div>
	);
};

export default ProjectFiles;
