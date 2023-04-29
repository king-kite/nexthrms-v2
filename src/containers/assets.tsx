import { Alert, Button, ButtonDropdown } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt, FaPlus } from 'react-icons/fa';

import { AssetTable, Details, Form, SearchForm } from '../components/Assets';
import { Container, ExportForm, ImportForm, Modal } from '../components/common';
import {
	permissions,
	samples,
	ASSETS_EXPORT_URL,
	ASSETS_IMPORT_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../config';
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../store/contexts';
import {
	useCreateAssetMutation,
	useDeleteAssetMutation,
	useEditAssetMutation,
	useGetAssetsQuery,
} from '../store/queries';
import {
	AssetType,
	AssetCreateQueryType,
	CreateAssetErrorResponseType,
	GetAssetsResponseType,
} from '../types';
import { getStringedDate, hasModelPermission } from '../utils';

function Assets({ assets }: { assets: GetAssetsResponseType['data'] }) {
	const [exportLoading, setExportLoading] = React.useState(false);
	const [modalVisible, setModalVisible] = React.useState(false);

	// Use this to show the details of an asset;
	const [showAsset, setShowAsset] = React.useState<AssetType>();

	const [bulkForm, setBulkForm] = React.useState(false);
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
	const { visible: alertModalVisible, close: closeModal } =
		useAlertModalContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.CREATE]))
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.EXPORT]))
			: false;
		// Added Object Level Permissions As Well
		const canView = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.VIEW])) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'assets' && perm.permission === 'VIEW'
			  )
			: false;

		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isFetching, refetch } = useGetAssetsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: searchForm?.name,
			date:
				searchForm?.startDate && searchForm?.endDate
					? {
							start: new Date(searchForm.startDate),
							end: new Date(searchForm.endDate),
					  }
					: undefined,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
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
				setBulkForm(false);
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
			setBulkForm(false);
			setModalVisible(false);
			setForm(formStaleData);
			setEditId(undefined);
			setErrors(undefined);
		},
		onError(error) {
			setErrors({ message: error?.message, ...error?.data });
		},
	});

	const { deleteAsset } = useDeleteAssetMutation(
		{
			onSuccess() {
				open({
					type: 'success',
					message: 'Asset Removed Successfully.',
				});
				if (modalVisible) setModalVisible(false);
				if (editId) setEditId(undefined);
				if (showAsset) setShowAsset(undefined);
			},
			onError(error) {
				open({
					message: error.message,
					type: 'danger',
				});
			},
		},
		{
			onSettled() {
				if (alertModalVisible) closeModal();
			},
		}
	);

	const handleSubmit = React.useCallback(
		(form: AssetCreateQueryType) => {
			// A check should be made to see if the user can edit a select asset;
			// if the user can edit the asset, then the editId field should
			// be set and not be undefined
			if (editId) editAsset({ id: editId, form });
			else if (canCreate) createAsset(form);
		},
		[canCreate, createAsset, editAsset, editId]
	);

	return (
		<Container
			heading="Assets"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
			paginate={
				(canView || canCreate) && data
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
				{canExport && (
					<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
						<ButtonDropdown
							component={() => (
								<ExportForm
									loading={exportLoading}
									onSubmit={async (
										type: 'csv' | 'excel',
										filtered: boolean
									) => {
										let url = ASSETS_EXPORT_URL + '?type=' + type;
										if (filtered) {
											url =
												url +
												`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${
													searchForm?.name || ''
												}`;
											if (searchForm?.startDate && searchForm?.endDate) {
												url += `&startDate=${searchForm.startDate}&endDate=${searchForm.endDate}`;
											}
										}
										setExportLoading(true);
										fetch(url, {
											method: 'GET',
											headers: {
												Accept: 'application/json',
												'Content-Type': 'application/json',
											},
										})
											.then(async (res) => {
												const data = await res.json();
												open({
													message: data.message,
													type: res.ok ? 'success' : 'danger',
												});
											})
											.catch((error: any) => {
												open({
													message: error.message,
													type: 'danger',
												});
											})
											.finally(() => {
												setExportLoading(false);
											});
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
				)}
				{canCreate && (
					<>
						<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								onClick={() => {
									setBulkForm(false);
									setErrors(undefined);
									setForm(formStaleData);
									setEditId(undefined);
									setShowAsset(undefined);
									setModalVisible(true);
								}}
								iconLeft={FaPlus}
								rounded="rounded-xl"
								title="Add new Asset"
							/>
						</div>
						<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								onClick={() => {
									setBulkForm(true);
									setErrors(undefined);
									setForm(formStaleData);
									setEditId(undefined);
									setShowAsset(undefined);
									setModalVisible(true);
								}}
								iconLeft={FaCloudUploadAlt}
								rounded="rounded-xl"
								title="Bulk Import"
							/>
						</div>
					</>
				)}
			</div>
			{(canView || canCreate) && (
				<>
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
						deleteAsset={deleteAsset}
						editAsset={({ id, updatedAt, user, ...asset }) => {
							setErrors(undefined);
							setEditId(id);
							setForm({
								...asset,
								description: asset.description || undefined,
								model: asset.model || undefined,
								userId: user?.id || '',
								purchaseDate: getStringedDate(asset.purchaseDate),
							});
							setShowAsset(undefined);
							setModalVisible(true);
						}}
					/>
				</>
			)}
			{/* editId will determine if the user has edit permission */}
			<Modal
				close={() => {
					setBulkForm(false);
					setModalVisible(false);
					setEditId(undefined);
					setForm(formStaleData);
					setShowAsset(undefined);
				}}
				component={
					showAsset ? (
						<Details
							asset={showAsset}
							editAsset={({ id, updatedAt, user, ...asset }) => {
								setErrors(undefined);
								setEditId(id);
								setForm({
									...asset,
									description: asset.description || undefined,
									model: asset.model || undefined,
									userId: user?.id || '',
									purchaseDate: getStringedDate(asset.purchaseDate),
								});
								setShowAsset(undefined);
								setModalVisible(true);
							}}
							deleteAsset={deleteAsset}
						/>
					) : canCreate && bulkForm ? (
						<ImportForm
							onSuccess={(data) => {
								open({
									type: 'success',
									message: data.message,
								});
								setModalVisible(false);
								setBulkForm(false);
							}}
							requirements={[
								{
									required: false,
									title: 'id',
									value: '"c2524fca-9182-4455-8367-c7a27abe1b73"',
								},
								{
									title: 'asset_id',
									value: '"564-71-3751"',
								},
								{
									title: 'condition',
									value: '"GOOD"',
								},
								{
									required: false,
									title: 'description',
									value: '"Nullam varius. Nulla facilisi."',
								},
								{
									title: 'manufacturer',
									value: '"Daewoo Lacetti"',
								},
								{
									required: false,
									title: 'model',
									value: '"Suzuki"',
								},
								{
									title: 'name',
									value: '"Steel"',
								},
								{
									title: 'purchase_date',
									value: '"2023-03-26T21:49:51.090Z"',
								},
								{
									title: 'purchase_from',
									value: '"Denesik-Bernier"',
								},
								{
									title: 'serial_no',
									value: '"872018614-2"',
								},
								{
									title: 'status',
									value: '"APPROVED"',
								},
								{
									title: 'supplier',
									value: '"Mynte"',
								},
								{
									title: 'warranty',
									value: '8',
								},
								{
									title: 'value',
									value: '1000',
								},
								{
									title: 'user',
									value: '"jandoe@gmail.com"',
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
							sample={samples.assets}
							url={ASSETS_IMPORT_URL}
						/>
					) : canCreate || editId ? (
						<Form
							form={form}
							editMode={!!editId}
							errors={errors}
							loading={editId ? editLoading : createLoading}
							setErrors={setErrors}
							onChange={handleChange}
							onSubmit={handleSubmit}
						/>
					) : (
						<Alert
							visible
							type="info"
							message="Sorry! Unable to display content for this screen at the moment. Please try again later. Thank You."
						/>
					)
				}
				description={
					showAsset
						? `Description of the ${showAsset.name} asset.`
						: editId
						? 'Update Asset'
						: bulkForm
						? 'Upload import file below'
						: 'Fill in the form below to add a new asset'
				}
				keepVisible
				title={
					showAsset
						? 'Asset Details'
						: editId
						? 'Update Asset'
						: bulkForm
						? 'Bulk Import'
						: 'Add Asset'
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
	purchaseDate: getStringedDate(),
	purchaseFrom: '',
	serialNo: '',
	status: 'PENDING',
	supplier: '',
	warranty: 12,
	value: 100,
	userId: '',
};

export default Assets;
