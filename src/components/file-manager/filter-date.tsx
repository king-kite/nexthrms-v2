import { Button, Input } from 'kite-react-tailwind';
import React from 'react';
import { getDate } from '../../utils';

type FormProps = {
	searchForm?: { from?: string; to?: string };
	setSearchForm: React.Dispatch<
		React.SetStateAction<{ from?: string; to?: string } | undefined>
	>;
	loading: boolean;
};

function Form({ searchForm, setSearchForm, loading }: FormProps) {
	const [form, setForm] = React.useState<
		| {
				from?: string;
				to?: string;
		  }
		| undefined
	>(searchForm);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				setSearchForm(form);
			}}
			className="p-2 w-full"
		>
			<div className="mb-2 w-full">
				<Input
					disabled={loading}
					label="From"
					name="fromDate"
					padding="px-3 py-1"
					onChange={({ target: { value } }) =>
						setForm((prevState) => ({
							...prevState,
							from: getDate(value, true) as string,
						}))
					}
					required={false}
					rounded="rounded"
					type="date"
					value={form?.from ? (getDate(form.from, true) as string) : ''}
				/>
			</div>
			<div className="mb-2 w-full">
				<Input
					disabled={loading}
					label="To"
					name="toDate"
					padding="px-3 py-1"
					onChange={({ target: { value } }) =>
						setForm((prevState) => ({
							...prevState,
							to: getDate(value, true) as string,
						}))
					}
					required={false}
					rounded="rounded"
					type="date"
					value={form?.to ? (getDate(form.to, true) as string) : ''}
				/>
			</div>
			<div className="flex flex-wrap gap-2 justify-between mb-3 mt-4 w-full">
				<div className="w-full md:w-[45%]">
					<Button
						caps
						disabled={loading}
						loader
						loading={loading}
						padding="px-4 py-1"
						rounded="rounded"
						type="submit"
						title="filter"
					/>
				</div>
				<div className="w-full md:w-[45%]">
					<Button
						bg="bg-red-600 hover:bg-red-500"
						caps
						disabled={loading}
						onClick={() => {
							setForm(undefined);
							setSearchForm((prevState) => ({
								...prevState,
								from: undefined,
								to: undefined,
							}));
						}}
						padding="px-4 py-1"
						rounded="rounded"
						type="reset"
						title="Reset"
					/>
				</div>
			</div>
		</form>
	);
}

export default Form;
