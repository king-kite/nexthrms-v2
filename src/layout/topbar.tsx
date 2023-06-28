import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';

import { LOGO_IMAGE, DEFAULT_IMAGE } from '../config/static';
import { useAuthContext } from '../store/contexts/auth';

const DynamicTopbarNotifications = dynamic<any>(
	() => import('./notifications').then((mod) => mod.default),
	{
		ssr: false,
	}
);

function getName(
	name1: string | null,
	name2: string | null,
	email: string
): string {
	if (name1 && name2) return name1 + ' ' + name2;
	if (name1) return name1;
	if (name2) return name2;
	return email;
}

const Topbar = () => {
	const { data } = useAuthContext();

	return (
		<section className="bg-white flex items-center justify-between relative shadow-lg p-3 md:p-4 lg:p-5 xl:px-7 w-full">
			<div className="invisible lg:flex lg:items-center lg:justify-center lg:visible">
				<div className="h-[32px] relative w-[35px] md:h-[35px] md:w-[40px]">
					<Image
						className="h-full w-full"
						layout="fill"
						src={LOGO_IMAGE}
						alt="kite"
					/>
				</div>
			</div>

			<div className="flex items-center justify-end w-full sm:w-2/3">
				<DynamicTopbarNotifications />

				<div className="flex flex-col justify-center text-right mx-1 pt-2 sm:mx-3">
					<p className="capitalize font-semibold leading-tight text-primary-700 text-xs sm:leading-tighter sm:text-sm">
						{data
							? getName(data.firstName, data.lastName, data.email)
							: 'Anonymous'}
					</p>
					<span className="capitalize pt-1 text-gray-400 text-xs">
						{data?.employee?.job?.name || 'user'}
					</span>
				</div>
				<div className="flex items-center justify-center mx-1 relative rounded-full">
					<div className="h-[30px] relative w-[30px]">
						<Image
							className="h-full rounded-full w-full"
							layout="fill"
							src={data?.profile?.image?.url || DEFAULT_IMAGE}
							alt=""
						/>
					</div>
					<div className="absolute border border-gray-900 bg-green-700 bottom-0 h-2 right-0 rounded-full w-2" />
				</div>
			</div>
		</section>
	);
};

export default Topbar;
