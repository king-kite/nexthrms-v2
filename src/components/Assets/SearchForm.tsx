import { Button, Input } from 'kite-react-tailwind';
import React from 'react';

type FormType =
	| {
			name?: string;
			startDate?: string;
			endDate?: string;
	  }
	| undefined;

function SearchForm({
	form,
	setForm,
	loading,
}: {
	setForm: React.Dispatch<React.SetStateAction<FormType>>;
	form?: {
		name?: string;
		startDate?: string;
		endDate?: string;
	};
	loading: boolean;
}) {
	const formRef = React.useRef<HTMLFormElement | null>(null);

	return (
		<form
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				if (formRef.current) {
					setForm({
						name: formRef.current.assetName?.value || undefined,
						startDate: formRef.current.startDate?.value || undefined,
						endDate: formRef.current.endDate?.value || undefined,
					});
				}
			}}
			className="bg-gray-200 p-6 rounded lg:px-12"
		>
			<div className="gap-5 grid grid-cols-1 mb-3 sm:grid-cols-2 md:gap-2 md:grid-cols-4">
				<div className="w-full sm:col-span-2">
					<Input
						bg="bg-white"
						bdrColor="border-transparent"
						disabled={loading}
						label="Search"
						placeholder="Search by asset name, user"
						name="assetName"
						onChange={({ target: { value } }) => {
							if (!value || value.trim() === '')
								setForm((prevState) => ({
									...prevState,
									name: '',
								}));
						}}
						required={false}
						type="text"
					/>
				</div>
				<div className="w-full">
					<Input
						bg="bg-white"
						bdrColor="border-transparent"
						disabled={loading}
						label="Start Date"
						name="startDate"
						required={false}
						type="date"
					/>
				</div>
				<div className="w-full">
					<Input
						bg="bg-white"
						bdrColor="border-transparent"
						disabled={loading}
						label="End Date"
						name="endDate"
						required={false}
						type="date"
					/>
				</div>
			</div>
			<div className="flex flex-wrap gap-4 items-center justify-center py-6 xs:justify-around">
				<div className="flex justify-center w-full sm:w-[12rem]">
					<Button
						disabled={loading}
						padding="px-6 py-3"
						title={
							loading
								? form?.name?.length !== undefined && form?.name?.length > 0
									? 'Searching...'
									: 'Please Wait...'
								: 'Search'
						}
						type="submit"
					/>
				</div>
				<div className="flex justify-center w-full sm:w-[12rem]">
					<Button
						bg="bg-red-600 hover:bg-red-500"
						disabled={loading}
						onClick={() => setForm(undefined)}
						padding="px-6 py-3"
						title={loading ? 'Please Wait...' : 'Cancel'}
						type="reset"
					/>
				</div>
			</div>
		</form>
	);
}

export default SearchForm;
