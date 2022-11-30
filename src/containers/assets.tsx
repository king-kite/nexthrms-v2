import { Input, Select } from 'kite-react-tailwind';

import { GetAssetsResponseType } from '../types'

function Assets({ assets }: { assets: GetAssetsResponseType }) {
	return (
		<div className="bg-gray-200 m-2 py-6 md:px-6 lg:px-12">
				<div className="gap-3 grid grid-cols-1 mb-3 md:grid-cols-2 lg:gap-2 lg:grid-cols-4">
					<div className="w-full">
						<p className="capitalize font-semibold mb-1 text-primary-500 text-xs md:text-sm">type</p>
						<div className="w-full">
							<Select 
								bg="bg-white"
								bdr="border"
								bdrColor="border-transparent"
								placeholder="Type"
								options={[]}
							/>
						</div>
					</div>
					<div className="w-full">
						<p className="capitalize font-semibold mb-1 text-primary-500 text-xs md:text-sm">start date</p>
						<div className="w-full">
							<Input 
								bg="bg-white"
								bdrColor="border-transparent"
								type="date"
							/>
						</div>
					</div>
					<div className="w-full">
						<p className="capitalize font-semibold mb-1 text-primary-500 text-xs md:text-sm">end date</p>
						<div className="w-full">
							<Input 
								bg="bg-white"
								bdrColor="border-transparent"
								type="date"
							/>
						</div>
					</div>
					<div className="w-full">
						<p className="capitalize font-semibold mb-1 text-primary-500 text-xs md:text-sm">reference</p>
						<div className="w-full">
							<Input 
								bg="bg-white"
								bdrColor="border-transparent"
								placeholder="Reference"
								type="text"
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-center">
					<button 
						className="bg-primary-500 capitalize cursor-pointer flex items-center my-6 px-12 py-2 rounded-xl text-xs text-white hover:bg-primary-400 md:text-sm"
					>
						submit
					</button>
				</div>
			</div>
	)
}

export default Assets;