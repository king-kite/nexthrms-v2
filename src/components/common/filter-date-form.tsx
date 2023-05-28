import { Input } from 'kite-react-tailwind';
import React from 'react';

type FormProps = {
	data?: { from: string; to: string };
	loading: boolean;
	setDateQuery: React.Dispatch<
		React.SetStateAction<{ from: string; to: string }>
	>;
};

const Form: React.FC<FormProps> = ({ data, loading, setDateQuery }) => {
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
			}}
			className="p-2 w-full"
		>
			<div className="mb-2 w-full">
				<Input
					disabled={loading}
					label="From"
					name="fromDate"
					onChange={(e) =>
						setDateQuery((prevState) => ({
							...prevState,
							from: e.target.value,
						}))
					}
					padding="px-3 py-1"
					required={false}
					rounded="rounded-lg"
					type="date"
					value={data?.from || ''}
				/>
			</div>
			<div className="mb-2 w-full">
				<Input
					disabled={loading}
					label="To"
					name="toDate"
					onChange={(e) =>
						setDateQuery((prevState) => ({ ...prevState, to: e.target.value }))
					}
					padding="px-3 py-1"
					required={false}
					rounded="rounded-lg"
					type="date"
					value={data?.to || ''}
				/>
			</div>
		</form>
	);
};

export default Form;
