import { Button, Select } from 'kite-react-tailwind';
import React from 'react';

import { useAxiosInstance } from '../../hooks';
import { useAlertContext } from '../../store/contexts';

type FormProps = {
	// remove this
	onSubmit?: (type: any, filter: boolean) => void;
	loading?: boolean;
	//

	filtered?: string;
	all?: string;
};

const Form = ({ all, filtered }: FormProps) => {
	const [form, setForm] = React.useState({
		type: 'csv',
		filtered: 'all',
	});

	const { open } = useAlertContext();

	const { execute, loading } = useAxiosInstance({
		onSettled(response) {
			open({
				type: response.status === 'success' ? 'success' : 'danger',
				message: response.message,
			});
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				let url = all + '?type=' + form.type;
				if (form.filtered === 'all' && all) execute(url);
				else if (form.filtered === 'filtered' && filtered)
					execute(url + filtered);
			}}
			className="p-2 w-full"
		>
			<div className="mb-2 w-full">
				<Select
					disabled={loading}
					label="Type"
					name="type"
					options={[
						{ title: 'CSV', value: 'csv' },
						{ title: 'Excel', value: 'excel' },
					]}
					onChange={(e) =>
						setForm((prevState) => ({ ...prevState, type: e.target.value }))
					}
					padding="px-3 py-1"
					required
					rounded="rounded-lg"
					value={form.type}
				/>
			</div>
			<div className="mb-2 w-full">
				<Select
					disabled={loading}
					label="All/Filtered"
					name="filtered"
					options={[
						{ title: 'All', value: 'all' },
						{ title: 'Filtered', value: 'filtered' },
					]}
					onChange={(e) =>
						setForm((prevState) => ({
							...prevState,
							filtered: e.target.value,
						}))
					}
					padding="px-3 py-1"
					required
					rounded="rounded-lg"
					value={form.filtered}
				/>
			</div>
			<div className="mt-4 mb-2 w-full">
				<Button
					caps
					disabled={loading}
					padding="px-4 py-1"
					rounded="rounded-lg"
					type="submit"
					title={loading ? 'exporting...' : 'export'}
				/>
			</div>
		</form>
	);
};

export default Form;
