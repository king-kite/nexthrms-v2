import { InputButton } from 'kite-react-tailwind';
import React from 'react';
import { FaSearch } from 'react-icons/fa';

import { ExportForm } from '../common';

type TopbarProps = {
	loading: boolean;
	onSubmit: (search: string) => void;
};

const Topbar = ({ loading, onSubmit }: TopbarProps) => {
	const searchRef = React.useRef<HTMLInputElement | null>(null);

	return (
		<div className="flex flex-wrap gap-3 items-center my-2 w-full md:gap-y-5 md:justify-between">
			<form
				className="flex items-center w-full md:w-2/5"
				onSubmit={(e) => {
					e.preventDefault();
					if (searchRef.current) onSubmit(searchRef.current.value);
				}}
			>
				<InputButton
					buttonProps={{
						caps: true,
						disabled: loading,
						iconLeft: FaSearch,
						// padding: 'pl-2 pr-4 py-[0.547rem]',
						title: 'Search',
						type: 'submit',
					}}
					inputProps={{
						// bdrColor: 'border-primary-500',
						disabled: loading,
						icon: FaSearch,
						onChange: ({ target: { value } }) => {
							if (!value || value === '') onSubmit('');
						},
						placeholder: 'Search permission name',
						rounded: 'rounded-l-lg',
						type: 'search',
					}}
					ref={searchRef}
				/>
			</form>
		</div>
	);
};

export default Topbar;
