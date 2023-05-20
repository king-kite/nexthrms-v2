import { Alert, Button, ButtonDropdown } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt } from 'react-icons/fa';

import { ImportForm, Modal } from '../../common';
import {
	permissions,
	samples,
	PROJECT_FILES_EXPORT_URL,
	PROJECT_FILES_IMPORT_URL,
} from '../../../config';
import { useAxiosInstance } from '../../../hooks';
import { useAuthContext, useAlertContext } from '../../../store/contexts';
import { hasModelPermission } from '../../../utils';

function ImportExport({ id }: { id: string }) {
	const [modalVisible, setModalVisible] = React.useState(false);
	const { data: authData } = useAuthContext();

	const { open } = useAlertContext();

	const { execute, loading } = useAxiosInstance({
		onSettled(response) {
			open({
				type: response.status === 'success' ? 'success' : 'danger',
				message: response.message,
			});
		},
	});

	const { url, importUrl } = React.useMemo(
		() => ({
			url: PROJECT_FILES_EXPORT_URL(id),
			importUrl: PROJECT_FILES_IMPORT_URL(id),
		}),
		[id]
	);

	const [canCreate, canExport] = React.useMemo(() => {
		if (!authData) return [false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.projectfile.CREATE,
			]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.projectfile.EXPORT,
			]);
		return [canCreate, canExport];
	}, [authData]);

	return canCreate || canExport ? (
		<div className="mt-3">
			<div className="flex flex-wrap items-center w-full">
				{canCreate && (
					<div className="my-2 w-full sm:px-2 sm:w-1/3">
						<Button
							iconLeft={FaCloudUploadAlt}
							onClick={() => setModalVisible(true)}
							rounded="rounded-xl"
							title="Import Files"
						/>
					</div>
				)}
				{canExport && (
					<div className="my-2 w-full sm:px-2 sm:w-1/2 md:max-w-[200px]">
						<ButtonDropdown
							dropList={[
								{
									onClick() {
										execute(url + '?type=csv');
									},
									title: 'CSV',
								},
								{
									onClick() {
										execute(url + '?type=excel');
									},
									title: 'Excel',
								},
							]}
							props={{
								caps: true,
								disabled: loading,
								iconLeft: FaCloudDownloadAlt,
								margin: 'lg:mr-6',
								padding: 'px-3 py-2 md:px-6',
								rounded: 'rounded-xl',
								title: loading ? 'Exporting...' : 'Export Files',
							}}
						/>
					</div>
				)}
			</div>
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						!modalVisible ? (
							<Alert
								type="danger"
								message="Unable show import form. Please try again!"
							/>
						) : (
							<ImportForm
								onSuccess={(data) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
								}}
								title="project_files"
								requirements={[
									{
										required: false,
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'name',
										value: 'Image 1',
									},
									{
										title: 'file',
										value: '/images/default.png',
									},
									{
										title: 'size',
										value: '1607',
									},
									{
										required: false,
										title: 'storage_info_keys',
										value: '"id,name,type"',
									},
									{
										required: false,
										title: 'storage_info_values',
										value:
											'"c2524fca-9182-4455-8367-c7a27abe1b73,Image 1,file"',
									},
									{
										title: 'type',
										value: 'image',
									},
									{
										title: 'project_id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										required: false,
										title: 'uploaded_by',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										required: false,
										title: 'updated_at',
										value: '"2023-03-26T21:49:51.090Z"',
									},
									{
										required: false,
										title: 'created_at',
										value: '"2023-03-26T21:49:51.090Z"',
									},
								]}
								sample={samples.projectFiles}
								url={importUrl}
							/>
						)
					}
					keepVisible
					description="Upload import file using the form below"
					title="Import Project Files"
					visible={modalVisible}
				/>
			)}
		</div>
	) : (
		<></>
	);
}

export default ImportExport;
