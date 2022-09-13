import { FC, useEffect } from 'react';
import { FaCloudDownloadAlt, FaSearch, FaUserPlus } from 'react-icons/fa';
import { useFormInput } from '../../hooks';
import { Button, InputButton } from '../controls';

type TopbarProps = {
	openModal: () => void;
	loading: boolean;
	onSubmit: (search: string) => void;
};

const Topbar: FC<TopbarProps> = ({ loading, openModal, onSubmit }) => {
	const search = useFormInput('');

	useEffect(() => {
		if (search.value === '') onSubmit('');
	}, [search.value, onSubmit]);

	return (
		<div className="flex flex-col my-2 w-full lg:flex-row lg:items-center">
			<form
				className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit(search.value);
				}}
			>
				<InputButton
					buttonProps={{
						disabled: loading,
						title: 'Search',
						type: 'submit',
					}}
					inputProps={{
						bdrColor: 'border-primary-500',
						disabled: loading,
						Icon: FaSearch,
						onChange: search.onChange,
						placeholder:
							'Search Contact Person Name or E-mail, Company Name...',
						rounded: 'rounded-l-lg',
						type: 'search',
						value: search.value,
					}}
				/>
			</form>
			<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
				<Button
					caps
					IconLeft={FaUserPlus}
					onClick={openModal}
					margin="lg:mr-6"
					padding="px-3 py-2 md:px-6"
					rounded="rounded-xl"
					title="add client"
				/>
			</div>
			<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
				<Button
					caps
					IconLeft={FaCloudDownloadAlt}
					onClick={() => window.alert('Downloading...')}
					margin="lg:mr-6"
					padding="px-3 py-2 md:px-6"
					rounded="rounded-xl"
					title="export"
				/>
			</div>
		</div>
	);
};

export default Topbar;
