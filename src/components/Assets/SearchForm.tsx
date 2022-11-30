import { Button, Input } from 'kite-react-tailwind';

function SearchForm() {
	return (
		<div className="bg-gray-200 p-6 rounded lg:px-12">
			<div className="gap-5 grid grid-cols-1 mb-3 sm:grid-cols-2 md:gap-2 md:grid-cols-4">
				<div className="w-full sm:col-span-2">
					<Input
						bg="bg-white"
						bdrColor="border-transparent"
						label="Search"
						placeholder="Search by asset name, user"
						type="text"
					/>
				</div>
				<div className="w-full">
					<Input
						bg="bg-white"
						bdrColor="border-transparent"
						label="Start Date"
						type="date"
					/>
				</div>
				<div className="w-full">
					<Input
						bg="bg-white"
						bdrColor="border-transparent"
						label="End Date"
						type="date"
					/>
				</div>
			</div>
			<div className="flex items-center justify-center">
				<div className="flex justify-center my-6 w-[12rem]">
					<Button padding="px-6 py-3" title="Search" />
				</div>
			</div>
		</div>
	);
}

export default SearchForm;
