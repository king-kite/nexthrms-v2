import { Button } from '@king-kite/react-kit';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { FaTimes, FaFileUpload } from 'react-icons/fa';

import Form from './AddProjectFileForm';
import { EMPLOYEE_PAGE_URL } from '../../../config';
import { ProjectFileType } from '../../../types';
import { downloadFile } from '../../../utils';

export type ProjectImagesProps = {
	files: ProjectFileType[];
};

const ProjectImages: FC<ProjectImagesProps> = ({ files }) => {
	const router = useRouter();
	const id = router.query.id as string;
	const [visible, setVisible] = useState(false);

	return (
		<div className="bg-white my-4 p-4 rounded-md shadow-lg">
			<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
				uploaded images
			</h3>
			{visible ? (
				<div>
					<div className="flex justify-end">
						<div
							onClick={() => setVisible(false)}
							className="cursor-pointer duration-500 mx-4 p-2 rounded-full text-primary-500 text-xs transform transition-all hover:bg-gray-200 hover:scale-110 hover:text-gray-600 md:text-sm"
						>
							<FaTimes className="text-xs sm:text-sm" />
						</div>
					</div>
					<Form
						accept="image/*"
						type="image"
						label="Image"
						projectId={id || ''}
						onClose={() => setVisible(false)}
					/>
				</div>
			) : (
				<div className="flex justify-start my-2 w-full px-3">
					<div className="w-2/3 sm:w-1/3 md:w-1/4">
						<Button
							iconLeft={FaFileUpload}
							onClick={() => setVisible(true)}
							rounded="rounded-lg"
							title="Add Image"
						/>
					</div>
				</div>
			)}
			{files.length > 0 ? (
				<div className="gap-4 grid grid-cols-2 p-3 md:gap-5 md:grid-cols-3 lg:gap-6">
					{files.map((file, index) => {
						const date = new Date(file.updatedAt);
						const time = date.toLocaleTimeString();
						const size = String(file.size / (1024 * 1024));
						const part1 = size.split('.')[0];
						const part2 = size.split('.')[1]
							? size.split('.')[1].slice(0, 2)
							: '';
						const sizeString = part1 + '.' + part2;

						return (
							<div key={index}>
								<div className="bg-gray-500 h-[120px] relative rounded-md w-full md:h-[150px] lg:h-[120px]">
									<Image
										className="h-full rounded-md w-full"
										layout="fill"
										src={file.file}
										alt=""
									/>
								</div>
								<p
									onClick={() => downloadFile(file.file, file.name)}
									className="cursor-pointer mt-1 text-left text-sm text-gray-700 hover:text-blue-600 hover:underline"
								>
									{file.name.slice(0, 40)}
									{file.name.length > 40 ? '...' : ''}
								</p>
								{file.employee && (
									<Link
										href={
											file.employee.id
												? EMPLOYEE_PAGE_URL(file.employee.id)
												: '#'
										}
									>
										<a className="capitalize cursor-pointer text-red-600 text-sm hover:text-red-500 hover:underline">
											{file.employee.user.firstName}
										</a>
									</Link>
								)}
								<p className="text-gray-700 text-sm">
									{date.toDateString()} {time}
								</p>
								<p className="capitalize text-gray-700 text-sm">
									Size:{' '}
									<span className="font-medium mx-1 uppercase">
										{sizeString}MB
									</span>
								</p>
							</div>
						);
					})}
				</div>
			) : (
				<p className="text-sm text-gray-700">
					There are currently no images stored on this project.
				</p>
			)}
		</div>
	);
};

export default ProjectImages;
