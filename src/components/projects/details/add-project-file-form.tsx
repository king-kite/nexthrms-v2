import { Alert, Button, File, Input } from 'kite-react-tailwind';
import React from 'react';

import { useAlertModalContext } from '../../../store/contexts';
import { useCreateProjectFileMutation } from '../../../store/queries';
import { CreateProjectFileErrorResponseType } from '../../../types';
import { handleJoiErrors, projectFileCreateSchema } from '../../../validators';

const AddProjectFileForm = ({
	accept = 'application/*, image/*',
	projectId,
	onClose,
	label,
}: {
	accept?: string;
	label?: string;
	projectId: string;
	onClose: () => void;
}) => {
	const formRef = React.useRef<HTMLFormElement | null>(null);
	const [imageName, setImageName] = React.useState<string>();

	const { open } = useAlertModalContext();
	const [formErrors, setFormErrors] =
		React.useState<CreateProjectFileErrorResponseType>();

	const { mutate: createProjectFile, isLoading } = useCreateProjectFileMutation(
		{
			onError(err) {
				setFormErrors((prevState) => ({ ...prevState, ...err }));
			},
			onSuccess() {
				onClose();
				setImageName(undefined);
				open({
					header: 'File Added',
					color: 'success',
					message: 'File was added to project successfully',
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		async (form: { name: string; file: File }) => {
			setFormErrors(undefined);
			try {
				const valid = await projectFileCreateSchema.validateAsync({
					name: form.name,
					file: form.file,
				});
				createProjectFile({
					projectId,
					data: valid,
				});
			} catch (error) {
				const err = handleJoiErrors<CreateProjectFileErrorResponseType>(error);
				setFormErrors((prevState) => {
					if (err)
						return {
							...prevState,
							...err,
						};
					return {
						...prevState,
						message: (err as any)?.message || 'Unable to upload file.',
					};
				});
			}
		},
		[createProjectFile, projectId]
	);

	const removeErrors = React.useCallback(
		(name: string) => {
			if (Object(formErrors)[name]) {
				setFormErrors((prevState) => ({
					...prevState,
					name: undefined,
				}));
			}
		},
		[formErrors]
	);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current)
					handleSubmit({
						name: formRef.current.fileName.value,
						file: formRef.current.file.files[0],
					});
			}}
			className="p-4"
		>
			{formErrors?.message && (
				<div className="pb-4 w-full">
					<Alert
						type="danger"
						message={formErrors?.message}
						onClose={() => removeErrors('message')}
					/>
				</div>
			)}
			<div className="gap-2 grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-6">
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<div className="w-full md:w-1/2 lg:w-1/3">
						<File
							accept={accept}
							disabled={isLoading}
							error={formErrors?.file}
							label={label || 'File'}
							name="file"
							onChange={({ target: { files } }) => {
								if (files && files[0]) setImageName(files[0].name);
								removeErrors('file');
							}}
							placeholder={`Upload ${label || 'file'}`}
							value={imageName}
						/>
					</div>
				</div>
				<div className="w-full md:col-span-2 md:flex md:flex-col md:justify-end">
					<Input
						disabled={isLoading}
						error={formErrors?.name}
						label="File Name"
						name="fileName"
						onChange={() => removeErrors('name')}
						placeholder="Enter file name"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center my-4 sm:my-5 md:mt-8">
				<div className="w-full sm:w-1/2 md:w-1/3">
					<Button
						disabled={isLoading}
						title={isLoading ? 'Uploading...' : 'Upload'}
						type="submit"
					/>
				</div>
			</div>
		</form>
	);
};

export default AddProjectFileForm;
