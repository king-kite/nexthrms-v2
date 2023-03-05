import { IconType } from 'react-icons';

export type PropsType = {
	setVisible: (e: boolean) => void;
	visible: boolean;
};

export type LinkItemType = {
	disabled?: boolean;
	href?: string;
	icon: IconType;
	links?: LinkItemType[];
	onClick?: () => void;
	showRoute?: () => boolean;
	title: string;
};

export type LinkType = {
	links: LinkItemType[];
	title: string;
};
