import { IconType } from 'react-icons';

export type PropsType = {
	setVisible: (e: boolean) => void;
	visible: boolean;
};

export type LinkItemType = {
	admin?: boolean; // is an admin link
	disabled?: boolean;
	href?: string;
	icon: IconType;
	links?: LinkItemType[];
	objPerm?: boolean;
	onClick?: () => void;
	permissions?: string[];
	title: string;
};

export type LinkType = {
	admin?: boolean;
	links: LinkItemType[];
	permissions: string[]; // permissions required to view link
	title: string;
};
