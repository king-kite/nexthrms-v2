import { Button, ButtonType } from 'kite-react-tailwind';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { FaEnvelope, FaUser } from 'react-icons/fa';
import { DEFAULT_IMAGE } from '../../config';

type TopBarType = {
	full_name?: string;
	email?: string;
	image?: string;
	actions?: ButtonType[] | React.ReactNode;
};

const TopBar: FC<TopBarType> = ({ actions, full_name, email, image }) => (
	<div className="bg-gray-300 rounded-lg">
		<div className="flex flex-col w-full md:flex-row md:px-2 md:py-3">
			<div className="flex flex-col items-center w-full md:items-start md:px-2 md:w-1/3 lg:px-3">
				<div className="h-[150px] my-2 relative rounded-xl w-[150px] md:h-[200px] md:w-[200px]">
					<Image
						className="h-full rounded-xl w-full"
						layout="fill"
						src={image || DEFAULT_IMAGE}
						alt={full_name || 'user'}
					/>
				</div>
				<div className="flex flex-col items-center w-full md:items-start">
					<div className="flex items-center">
						<span className="block mr-2 text-primary-500 text-xs md:text-sm">
							<FaUser />
						</span>
						<h3 className="capitalize font-bold my-2 text-base text-center text-gray-800 md:text-lg lg:text-xl">
							{full_name || 'No Name'}
						</h3>
					</div>

					<div className="flex items-center mt-1 mb-3">
						<span className="block mr-2 text-primary-500 text-xs">
							<FaEnvelope />
						</span>
						<p className="font-medium text-center text-gray-700 text-sm tracking-wide md:text-base">
							{email || 'noname@example.com'}
						</p>
					</div>
				</div>
			</div>
			{actions && Array.isArray(actions) ? (
				<div className="flex flex-wrap p-4 w-full md:h-1/2 md:mt-auto md:pb-0 md:w-2/3">
					{actions.map((action, index) => (
						<div key={index} className="my-2 w-full sm:my-4 sm:px-4 sm:w-1/2">
							<Button
								{...action}
								renderLinkAs={({ children, link, ...props }) => (
									<Link href={link}>
										<a {...props}>{children}</a>
									</Link>
								)}
							/>
						</div>
					))}
				</div>
			) : (
				actions
			)}
		</div>
	</div>
);

export default TopBar;
