import { AxiosError } from 'axios';
import { Alert, Button, File } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt } from 'react-icons/fa';

import { BaseResponseType } from '../../types';
import { downloadFile } from '../../utils';
import { axiosFileInstance } from '../../utils/axios';

type ImportFormProps = {
	onSuccess: (data: BaseResponseType) => void;
	requirements: {
		links?: {
			href: string;
			title: string;
		}[];
		required?: boolean;
		title: string;
		value: string;
	}[];
	sample?: {
		link: string;
		title: string;
	};
	url: string;
};

function ImportForm({ onSuccess, requirements, sample, url }: ImportFormProps) {
	const ref = React.useRef<HTMLFormElement | null>(null);

	const [error, setError] = React.useState<string>();
	const [file, setFile] = React.useState<string>();
	const [downloadLoading, setDownloadLoading] = React.useState(false);
	const [uploadLoading, setUploadLoading] = React.useState(false);

	const handleSubmit = React.useCallback(
		(data: File) => {
			const form = new FormData();
			form.append('data', data);
			setUploadLoading(true);
			axiosFileInstance
				.post(url, form)
				.then((response) => {
					onSuccess(response.data);
				})
				.catch((err) => {
					const error = err as AxiosError<BaseResponseType>;
					let message =
						'Sorry an error occurred, unable to send/complete this request.';
					if (error.response && error.response.data.message)
						message = error.response.data.message;

					setError(message);
				})
				.finally(() => {
					setUploadLoading(false);
				});
		},
		[onSuccess, url]
	);

	return (
		<div className="p-4">
			{error && (
				<div className="mb-4">
					<Alert
						onClose={() => setError(undefined)}
						message={error}
						type="danger"
						visible={!!error}
					/>
				</div>
			)}
			<div className="bg-yellow-200 border border-yellow-300 my-1 px-4 py-2 rounded-md">
				<p className="text-gray-500 text-xs md:text-sm">
					Please note that only a csv (.csv) file, excel (.xlsx) or zip (.zip)
					file can be uploaded in the below format. The file must have the
					required headers/keys at the start of the file.
				</p>
			</div>
			<div className="mt-4 mx-1">
				<p className="text-gray-500 text-xs md:text-sm">
					Below are the list of keywords needed in the file.
					<br /> - The zip file must contain the data.csv and the
					permissions.csv files.
					<br /> - Required keys are starred red.
				</p>
				<ul className="bg-gray-200 divide-y divide-white divide-opacity-100 mt-4 px-3 py-1 rounded-md md:px-6">
					{requirements.map(
						({ links, required = true, title, value }, index) => (
							<li key={index} className="py-3">
								<div className="flex flex-wrap items-center">
									<span className="mr-1 text-gray-600 text-xs md:text-sm">
										{index + 1}.
									</span>
									<p className="text-gray-600 text-xs md:text-sm">
										{title}
										{required && (
											<sup className="text-red-500 text-base">*</sup>
										)}
										:
									</p>
									<p className="bg-primary-500 mx-2 mt-1 rounded px-2 py-1 text-white text-xs tracking-wider sm:my-0">
										e.g. {value}
									</p>
									{links &&
										links.map(({ href, title }, index) => (
											<Link href={href} key={index}>
												<span className="cursor-pointer text-red-500 text-xs hover:underline md:text-sm">
													{title}
												</span>
											</Link>
										))}
								</div>
							</li>
						)
					)}
				</ul>
			</div>
			<form
				ref={ref}
				onSubmit={(e) => {
					e.preventDefault();
					if (ref.current) {
						if (!ref.current.data.files[0])
							setError('Import file is required!');
						else handleSubmit(ref.current.data.files[0]);
					}
				}}
			>
				<div className="flex justify-center mt-4 sm:mt-5 md:mt-8">
					<div className="px-2 w-full sm:w-1/3 md:w-1/2">
						<File
							disabled={uploadLoading}
							onChange={({ target: { files } }) => {
								if (files && files[0]) setFile(files[0].name);
							}}
							icon={FaCloudUploadAlt}
							iconSize="12"
							label="Upload Document"
							name="data"
							placeholder="Upload a csv, excel or zip file"
							required
							value={file}
						/>
					</div>
				</div>
				{sample && (
					<>
						<p className="mt-4 text-base text-center text-gray-500 uppercase md:text-lg">
							or
						</p>
						<div className="flex items-center justify-center">
							<div>
								<Button
									bg="bg-secondary-600 hover:bg-secondary-400"
									disabled={downloadLoading}
									iconRight={FaCloudDownloadAlt}
									onClick={() => {
										downloadFile({
											url: sample.link,
											name: sample.title,
											setLoading: setDownloadLoading,
										}).catch((error) => {
											const message =
												(error as any)?.data || (error as any)?.message;
											setError(message);
										});
									}}
									margin="lg:mr-6"
									padding="px-3 py-2 md:px-6"
									rounded="rounded-md"
									title={
										downloadLoading
											? 'Downloading...'
											: 'Download sample format.zip'
									}
								/>
							</div>
						</div>
					</>
				)}
				<div className="flex items-center justify-center mt-4 sm:mt-5 md:mt-8">
					<div className="w-full sm:w-1/2 md:w-1/3">
						<Button
							disabled={uploadLoading}
							iconLeft={FaCloudUploadAlt}
							rounded="rounded-md"
							title={uploadLoading ? 'Importing...' : 'Import'}
						/>
					</div>
				</div>
			</form>
		</div>
	);
}

export default ImportForm;
