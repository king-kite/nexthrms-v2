import { Alert, Button, File, Input } from 'kite-react-tailwind';
import React from 'react';

import { useAlertContext } from '../../store/contexts';
import { useCreateManagedFileMutation } from '../../store/queries/managed-files';
import { CreateManagedFileType, CreateManagedFileErrorType } from '../../types';
import { handleYupErrors } from '../../validators';
import { managedFileCreateSchema } from '../../validators/managed-files';

interface ErrorType extends CreateManagedFileErrorType {
	message?: string;
}

export type FormProps = {
	directory?: string;
	onSuccess: () => void;
	type?: 'file' | 'folder';
};

const Form = ({ directory, type = 'file', onSuccess }: FormProps) => {
	const [form, setForm] = React.useState({
		file: '',
	});
	const [formErrors, setErrors] = React.useState<
		CreateManagedFileErrorType & {
			message?: string;
		}
	>();

	const formRef = React.useRef<HTMLFormElement>(null);

	const { open } = useAlertContext();

	const { mutate, isLoading } = useCreateManagedFileMutation({
		onSuccess() {
			open({
				message:
					type === 'file'
						? 'File added successfully!'
						: 'Folder added successfully!',
				type: 'success',
			});
			onSuccess();
			if (formRef.current) formRef.current.reset();
			setForm({ file: '' });
		},
		onError(error) {
			setErrors((prevState) => ({
				...error?.data,
				message: error.message,
			}));
		},
	});

	const handleSubmit = React.useCallback(
		async (input: CreateManagedFileType) => {
			setErrors(undefined);

			try {
				const valid = await managedFileCreateSchema.validate(
					{ ...input },
					{
						abortEarly: false,
					}
				);
				const form = new FormData();
				form.append('name', valid.name);
				form.append('type', valid.type);

				if (valid.directory) {
					// make sure if dir !== '', it should end with a '/' directory end
					let dir = valid.directory.trim();
					if (dir !== '' && !dir.endsWith('/')) dir += '/';
					form.append('directory', dir);
				}
				valid.file && form.append('file', valid.file as any);
				mutate(form);
			} catch (error) {
				const err = handleYupErrors<CreateManagedFileErrorType>(error);
				if (err) {
					setErrors((prevState) => ({
						...prevState,
						...err,
					}));
				}
			}
		},
		[mutate]
	);

	const removeError = React.useCallback(
		(name: string) => {
			if (Object(formErrors)[name])
				setErrors((prevState) => ({
					...prevState,
					[name]: undefined,
				}));
		},
		[formErrors]
	);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					handleSubmit({
						file: type === 'file' ? formRef.current?.file.files[0] : undefined,
						directory:
							directory !== undefined
								? directory
								: formRef.current?.directory.value,
						name: formRef.current?.fileName.value,
						type,
					});
				}
			}}
			className="p-4 pb-0"
		>
			{formErrors?.message && (
				<div className="pb-4 w-full">
					<Alert
						message={formErrors.message}
						onClose={() => removeError('message')}
						type="danger"
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 items-end md:grid-cols-2 md:gap-4 lg:gap-6">
				{type === 'file' && (
					<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
						<div className="w-full md:w-1/2 lg:w-1/3">
							<File
								disabled={isLoading}
								error={formErrors?.file}
								label="File"
								name="file"
								onChange={({ target: { files } }) => {
									if (files && files[0]) {
										setForm((prevState) => ({
											...prevState,
											file: files[0].name,
										}));
									}
									removeError('file');
								}}
								placeholder="Select File"
								required={type === 'file'}
								value={form.file}
							/>
						</div>
					</div>
				)}
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Input
						disabled={isLoading}
						error={formErrors?.name}
						label="Name"
						name="fileName"
						onChange={() => removeError('name')}
						placeholder={type === 'file' ? 'File name' : 'Folder name'}
					/>
				</div>
				{directory === undefined && (
					<div className="w-full md:col-span-2">
						<label
							className="mb-2 text-gray-600 text-xs md:text-sm block font-semibold"
							htmlFor="directory"
						>
							Directory
						</label>
						<div className="flex items-center w-full">
							<span className="bg-gray-200 font-semibold inline-block px-3 py-2 rounded-l rounded-r-none text-gray-500 text-xs w-[3.5rem] md:text-sm">
								home/
							</span>
							<Input
								disabled={isLoading}
								error={formErrors?.directory}
								name="directory"
								rounded="rounded-r rounded-l-none"
								onChange={() => removeError('directory')}
								placeholder="users/pictures/"
								required={false}
							/>
						</div>
					</div>
				)}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={isLoading}
						title={type === 'file' ? 'Upload' : 'Create'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

Form.defaultProps = {
	editMode: false,
};

export default Form;
