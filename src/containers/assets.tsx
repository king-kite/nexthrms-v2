import { Button, ButtonDropdown } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';

import { AssetTable, Details, Form, SearchForm } from '../components/Assets';
import { Container, ExportForm, Modal } from '../components/common';
import { DEFAULT_PAGINATION_SIZE, ASSETS_EXPORT_URL } from '../config';
import { useAlertContext } from '../store/contexts';
import {
	useCreateAssetMutation,
	useEditAssetMutation,
	useGetAssetsQuery,
} from '../store/queries';
import {
	AssetType,
	AssetCreateQueryType,
	CreateAssetErrorResponseType,
	GetAssetsResponseType,
} from '../types';
import { downloadFile } from '../utils';

function Assets({ assets }: { assets: GetAssetsResponseType['data'] }) {
	const [exportLoading, setExportLoading] = React.useState(false);
	const [modalVisible, setModalVisible] = React.useState(false);

	// Use this to show the details of an asset;
	const [showAsset, setShowAsset] = React.useState<AssetType>();

	const [form, setForm] = React.useState<AssetCreateQueryType>(formStaleData);
	const [editId, setEditId] = React.useState<string>();
	const [errors, setErrors] = React.useState<
		CreateAssetErrorResponseType & {
			message?: string;
		}
	>();
	const [offset, setOffset] = React.useState(0);
	const [searchForm, setSearchForm] = React.useState<{
		name?: string;
		startDate?: string;
		endDate?: string;
	}>();

	const { open } = useAlertContext();

	const { data, isFetching, refetch } = useGetAssetsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: searchForm?.name,
		},
		{
			initialData() {
				return assets;
			},
		}
	);

	const handleChange: React.ChangeEventHandler<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	> = React.useCallback(({ target: { name, value } }) => {
		setForm((prevState) => ({
			...prevState,
			[name]: value,
		}));
		setErrors((prevState) => ({
			...prevState,
			[name]: undefined,
		}));
	}, []);

	const { mutate: createAsset, isLoading: createLoading } =
		useCreateAssetMutation({
			onSuccess() {
				open({
					message: 'Asset was added successfully!',
					type: 'success',
				});
				setModalVisible(false);
				setForm(formStaleData);
				setEditId(undefined);
				setErrors(undefined);
			},
			onError(error) {
				setErrors({ message: error?.message, ...error?.data });
			},
		});

	const { mutate: editAsset, isLoading: editLoading } = useEditAssetMutation({
		onSuccess() {
			open({
				message: 'Asset was updated successfully!',
				type: 'success',
			});
			setModalVisible(false);
			setForm(formStaleData);
			setEditId(undefined);
			setErrors(undefined);
		},
		onError(error) {
			setErrors({ message: error?.message, ...error?.data });
		},
	});

	const handleSubmit = React.useCallback(
		(form: AssetCreateQueryType) => {
			if (editId) editAsset({ id: editId, form });
			else createAsset(form);
		},
		[createAsset, editAsset, editId]
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
											`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${
												searchForm?.name || ''
											}`;
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
					<Button
						onClick={() => {
							setErrors(undefined);
							setForm(formStaleData);
							setEditId(undefined);
							setShowAsset(undefined);
							setModalVisible(true);
						}}
						rounded="rounded-xl"
						title="Add new Asset"
					/>
				</div>
			</div>
			<div className="py-2 md:pt-4 lg:pt-6">
				<SearchForm
					form={searchForm}
					loading={isFetching}
					setForm={setSearchForm}
				/>
			</div>
			<AssetTable
				assets={data?.result || []}
				showAsset={(asset) => {
					setShowAsset(asset);
					setModalVisible(true);
				}}
				editAsset={({ id, updatedAt, user, ...asset }) => {
					setErrors(undefined);
					setEditId(id);
					setForm({
						...asset,
						description: asset.description || undefined,
						model: asset.model || undefined,
						userId: user?.id || '',
					});
					setShowAsset(undefined);
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => {
					setModalVisible(false);
					setEditId(undefined);
					setForm(formStaleData);
					setShowAsset(undefined);
				}}
				component={
					showAsset ? (
						<Details asset={showAsset} />
					) : (
						<Form
							form={form}
							editMode={!!editId}
							errors={errors}
							loading={editId ? editLoading : createLoading}
							setErrors={setErrors}
							onChange={handleChange}
							onSubmit={handleSubmit}
						/>
					)
				}
				description={
					showAsset
						? `Description of the ${showAsset.name} asset.`
						: editId
						? 'Update Asset'
						: 'Fill in the form below to add a new asset'
				}
				keepVisible
				title={
					showAsset ? 'Asset Details' : editId ? 'Update Asset' : 'Add Asset'
				}
				visible={modalVisible}
			/>
		</Container>
	);
}

const formStaleData: AssetCreateQueryType = {
	assetId: '',
	condition: 'GOOD' as const,
	description: '',
	manufacturer: '',
	model: '',
	name: '',
	purchaseDate: new Date().toLocaleDateString('en-Ca'),
	purchaseFrom: '',
	serialNo: '',
	status: 'PENDING',
	supplier: '',
	warranty: 12,
	value: 100,
	userId: '',
};

export default Assets;
