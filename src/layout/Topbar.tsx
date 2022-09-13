import Image from 'next/image';
import { useState } from 'react';
import { FaRegBell } from 'react-icons/fa';

import Notifications from './Notifications';
import { LOGO_IMAGE, DEFAULT_IMAGE } from '../config';
import { useOutClick } from '../hooks';
import { useAuthContext } from '../store/contexts';

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
	const { buttonRef, ref, setVisible, visible } = useOutClick<
		HTMLUListElement,
		HTMLDivElement
	>();

	const [count, setCount] = useState(0);
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
				<div
					ref={buttonRef}
					onClick={() => setVisible(!visible)}
					className="cursor-pointer duration-500 flex items-center justify-center min-h-[30px] min-w-[30px] mx-4 relative transition transform hover:scale-110"
				>
					<span>
						<FaRegBell className="text-xl text-gray-700" />
					</span>
					<span
						className={` ${
							count > 99 ? 'h-[17px] right-[3.5px] w-[18px]' : 'h-[16px] right-0 w-[14px]'
						} absolute bg-red-500 flex justify-center items-center rounded-full top-0 text-center text-gray-100 text-[9px]`}
					>
						{count > 99 ? '+99' : count}
					</span>
				</div>

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
							src={data?.profile?.image || DEFAULT_IMAGE}
							alt=""
						/>
					</div>
					<div className="absolute border border-gray-900 bg-green-700 bottom-0 h-2 right-0 rounded-full w-2" />
				</div>
			</div>
			<Notifications setCount={setCount} visible={visible} ref={ref} />
		</section>
	);
};

export default Topbar;
