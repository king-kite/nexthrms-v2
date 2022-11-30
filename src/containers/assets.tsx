import { Button, ButtonDropdown } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';

import { AssetTable, SearchForm } from '../components/Assets';
import { Container, ExportForm } from '../components/common';
import { DEFAULT_PAGINATION_SIZE, ASSETS_EXPORT_URL } from '../config';
import { useAlertContext } from '../store/contexts';
import { useGetAssetsQuery } from '../store/queries';
import { GetAssetsResponseType } from '../types';
import { downloadFile } from '../utils';

/*


const Departments = ({
	departments,
}: {
	departments: GetDepartmentsResponseType['data'];
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState<{
		name: string;
		hod: string | null;
	}>({ name: '', hod: null });
	const [editId, setEditId] = useState<string>();

	const [nameSearch, setNameSearch] = useState('');


	const handleChange = useCallback((name: string, value: string | null) => {
		setForm((prevState) => ({ ...prevState, [name]: value }));
	}, []);

	return (
		
			<Modal
				close={() => {
					setModalVisible(false);
					setEditId(undefined);
					setForm({ name: '', hod: null });
				}}
				component={
					<Form
						form={form}
						editId={editId}
						onChange={handleChange}
						onSuccess={() => {
							setModalVisible(false);
							openModal({
								closeOnButtonClick: true,
								color: 'success',
								decisions: [
									{
										color: 'success',
										title: 'OK',
									},
								],
								Icon: FaCheckCircle,
								header: editId ? 'Department Edited' : 'Department Created',
								message: editId
									? 'Department Edited Successfully'
									: 'Department Created Successfully.',
							});
							setEditId(undefined);
							setForm({ name: '', hod: null });
						}}
					/>
				}
				description={
					editId
						? 'Update Department'
						: 'Fill in the form below to add a department'
				}
				keepVisible
				title={editId ? 'Update Department' : 'Add Department'}
				visible={modalVisible}
			/>

*/

function Assets({ assets }: { assets: GetAssetsResponseType['data'] }) {
	const [exportLoading, setExportLoading] = React.useState(false);
	const [offset, setOffset] = React.useState(0);
	const [nameSearch, setNameSearch] = React.useState('');

	const { open } = useAlertContext();

	const { data, isFetching, refetch } = useGetAssetsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: nameSearch,
		},
		{
			initialData() {
				return assets;
			},
		}
	);

	return (
		<Container
			heading="Assets"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			paginate={
				data
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<div className="flex items-center justify-end gap-4 my-3 w-full">
				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
					<ButtonDropdown
						component={() => (
							<ExportForm
								loading={exportLoading}
								onSubmit={async (type: 'csv' | 'excel', filtered: boolean) => {
									let url = ASSETS_EXPORT_URL + '?type=' + type;
									if (filtered) {
										url =
											url +
											`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${nameSearch}`;
									}
									const result = await downloadFile({
										url,
										name: type === 'csv' ? 'assets.csv' : 'assets.xlsx',
										setLoading: setExportLoading,
									});
									if (result?.status !== 200) {
										open({
											type: 'danger',
											message: 'An error occurred. Unable to export file!',
										});
									}
								}}
							/>
						)}
						props={{
							caps: true,
							iconLeft: FaCloudDownloadAlt,
							margin: 'lg:mr-6',
							padding: 'px-3 py-2 md:px-6',
							rounded: 'rounded-xl',
							title: 'export',
						}}
					/>
				</div>
				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
					<Button rounded="rounded-xl" title="Add new Asset" />
				</div>
			</div>
			<div className="py-2 md:pt-4 lg:pt-6">
				<SearchForm />
			</div>
			<AssetTable
				assets={data?.result || []}
				showAsset={(asset) => {}}
				editAsset={(asset) => {}}
			/>
		</Container>
	);
}

export default Assets;
