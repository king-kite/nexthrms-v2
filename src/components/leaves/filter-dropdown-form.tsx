import { Button, Input } from 'kite-react-tailwind';
import React from 'react';
import { getDate } from '../../utils';

type FormProps = {
	form: { from?: string; to?: string } | undefined;
	setForm: (form: { from?: string; to?: string } | undefined) => void;
	loading: boolean;
};

function Form({ form, setForm, loading }: FormProps) {
	const formRef = React.useRef<HTMLFormElement | null>(null);

	return (
		<form
			ref={formRef}
			onSubmit={(event) => {
				event.preventDefault();
				if (formRef.current) {
					setForm({
						from: formRef.current.fromDate.value || undefined,
						to: formRef.current.toDate.value || undefined,
					});
				}
			}}
			className="p-2 w-full"
		>
			<div className="mb-2 w-full">
				<Input
					defaultValue={getDate(undefined, true) as string}
					disabled={loading}
					label="From"
					name="fromDate"
					padding="px-3 py-1"
					required={false}
					rounded="rounded-lg"
					type="date"
				/>
			</div>
			<div className="mb-2 w-full">
				<Input
					disabled={loading}
					label="To"
					name="toDate"
					padding="px-3 py-1"
					required={false}
					rounded="rounded-lg"
					type="date"
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
						rounded="rounded-lg"
						type="submit"
						title="filter"
					/>
				</div>
				<div className="w-full md:w-[45%]">
					<Button
						bg="bg-red-600 hover:bg-red-500"
						caps
						disabled={loading}
						onClick={() => setForm(undefined)}
						padding="px-4 py-1"
						rounded="rounded-lg"
						type="reset"
						title="Reset"
					/>
				</div>
			</div>
		</form>
	);
}

export default Form;
