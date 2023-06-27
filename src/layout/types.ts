import React from 'react';

export type PropsType = {
	setVisible: (e: boolean) => void;
	visible: boolean;
};

export type LinkItemType = {
	disabled?: boolean;
	href?: string;
	icon: React.ComponentType<any>;
	links?: LinkItemType[];
	onClick?: () => void;
	showRoute?: () => boolean;
	title: string;
};

export type LinkType = {
	links: LinkItemType[];
	title: string;
};
