import { Alert, Button, File, Input } from 'kite-react-tailwind';
import React from 'react';

import { useAlertContext } from '../../store/contexts';
import { useCreateManagedFileMutation } from '../../store/queries';
import { CreateManagedFileType, CreateManagedFileErrorType } from '../../types';
import { managedFileCreateSchema, handleJoiErrors } from '../../validators';

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

	const { mutate } = useCreateManagedFileMutation({
		onSuccess() {
			open({
				message:
					type === 'file'
						? 'File add successfully!'
						: 'Folder added successfully!',
				type: 'success',
			});
			onSuccess();
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
				const valid: CreateManagedFileType =
					await managedFileCreateSchema.validateAsync(
						{ ...input },
						{
							abortEarly: false,
						}
					);
				const form = new FormData();
				form.append('name', valid.name);
				form.append('type', valid.type);
				valid.directory && form.append('directory', valid.directory);
				valid.file && form.append('file', valid.file);
				mutate(form);
			} catch (error) {
				const err = handleJoiErrors<CreateManagedFileErrorType>(error);
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
						directory: directory || formRef.current?.directory.value,
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
								// disabled={loading}
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
						// disabled={loading}
						error={formErrors?.name}
						label="Name"
						name="fileName"
						onChange={() => removeError('name')}
						placeholder={type === 'file' ? 'File name' : 'Folder name'}
					/>
				</div>
				{!directory && (
					<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
						<Input
							// disabled={loading}
							error={formErrors?.directory}
							label="Directory"
							name="directory"
							onChange={() => removeError('directory')}
							placeholder="e.g. home/users/pictures/"
						/>
					</div>
				)}
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						// disabled={loading}
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
