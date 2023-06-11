import { FaFolder } from 'react-icons/fa';

import { BoxGridItem } from './box-items';

function getName(name: string, max = 15) {
	return name.length > max ? `${name.slice(0, max)}...` : name;
}

function Folder({ name, onClick }: { name: string; onClick?: () => void }) {
	// getName()
	return (
		<BoxGridItem 
			bg="bg-indigo-500" 
			caps={false}
			icon={FaFolder} 
			onClick={onClick} 
			title={name} 
		/>
	);
}

export default Folder;
