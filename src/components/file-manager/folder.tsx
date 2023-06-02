import { FaFolder } from 'react-icons/fa';

function getName(name: string, max = 15) {
	return name.length > max ? `${name.slice(0, max)}...` : name;
}

function Folder({ name, onClick }: { name: string; onClick?: () => void }) {
	return (
		<div
			onClick={onClick}
			className="cursor-pointer flex flex-col items-center transition-all hover:scale-105"
		>
			<span className="text-gray-700">
				<FaFolder className="h-[50px] text-gray-700 w-[50px]" />
			</span>
			<span className="font-light text-gray-500 text-sm md:text-base">
				{getName(name)}
			</span>
		</div>
	);
}

export default Folder;
