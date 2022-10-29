import { Button, Select } from '@king-kite/react-kit';
import { FC, useState } from 'react';

type FormProps = {
	onSubmit?: (type: any, filter: boolean) => void;
	loading?: boolean;
};

const Form: FC<FormProps> = ({ loading, onSubmit }) => {
	const [form, setForm] = useState({
		type: 'csv',
		filtered: 'all',
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				if (onSubmit)
					onSubmit(form.type, form.filtered === 'all' ? false : true);
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
