import { MenuIcon } from 'kite-react-tailwind';
import Image from 'next/image';
import React from 'react';

import ScrollToTop from './scrollToTop';
import Sidebar from './sidebar';
import Topbar from './topbar';
import { LOGO_IMAGE } from '../config';
import { useFadeIn, useOutClick } from '../hooks';

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
				<MenuIcon
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
					<ScrollToTop
						onClick={() => window.scroll(0, 0)}
						visible={scrollToTopView.visible}
					/>
				</main>
			</div>
		</div>
	);
};

export default Layout;
