import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';

import Sidebar from './sidebar';
import Topbar from './topbar';
import { LOGO_IMAGE } from '../config/static';
import useOutClick from '../hooks/useOutClick';
import useFadeIn from '../hooks/useFadeIn';

const DynamicMenuIcon = dynamic<any>(
	() => import('kite-react-tailwind').then((mod) => mod.MenuIcon),
	{
		loading: () => (
			<p className="cursor-pointer duration-500 text-gray-500 text-base transition transform hover:scale-105 md:text-lg">
				{'|||'}
			</p>
		),
		ssr: false,
	}
);
const DynamicScrollToTop = dynamic<any>(
	() => import('./scroll-to-top').then((mod) => mod.default),
	{ ssr: false }
);

const Layout = ({ children }: { children: React.ReactNode }) => {
	const menu = useOutClick<HTMLDivElement, HTMLDivElement>();

	const scrollToTopView = useFadeIn<HTMLDivElement>();

	return (
		<div className="w-full">
			<div
				className="absolute h-1/2 invisible opacity-0 w-px"
				ref={scrollToTopView.ref}
				style={{ visibility: 'collapse', zIndex: -150 }}
			/>
			<header className="bg-gray-100 flex items-center justify-between px-4 py-2 md:px-6 md:py-3 lg:hidden">
				<div className="h-[32px] relative w-[35px] md:h-[35px] md:w-[40px]">
					<Image
						className="h-full w-full"
						layout="fill"
						src={LOGO_IMAGE}
						alt="kite"
					/>
				</div>
				<DynamicMenuIcon
					color="primary"
					ref={menu.buttonRef}
					setVisible={menu.setVisible}
					visible={menu.visible}
				/>
			</header>
			<div className="flex relative">
				<Sidebar
					setVisible={menu.setVisible}
					visible={menu.visible}
					ref={menu.ref}
				/>

				<main className="h-full min-h-screen w-full lg:ml-auto lg:w-5/6">
					<Topbar />
					{children}
					<DynamicScrollToTop
						onClick={() => window.scroll(0, 0)}
						visible={scrollToTopView.visible}
					/>
				</main>
			</div>
		</div>
	);
};

export default Layout;
