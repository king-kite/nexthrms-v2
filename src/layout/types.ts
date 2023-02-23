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
	onClick?: () => void;
	title: string;
};

export type LinkType = {
	links: LinkItemType[];
	permissions: string[]; // permissions required to view link
	title: string;
};
