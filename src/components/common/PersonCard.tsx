import { Button, ButtonType } from 'kite-react-tailwind';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { FaTimes } from 'react-icons/fa';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { DEFAULT_IMAGE } from '../../config';
import { useOutClick } from '../../hooks';

export type PersonCardType = {
	image?: {
		src: string;
		alt?: string;
	};
	name: string;
	label?: string;
	title?: string;
	bg?: string;
	border?: string;
	actions?: ButtonType[];
	options?: ButtonType[];
};

const PersonCard: FC<PersonCardType> = ({
	actions,
	title,
	label,
	image,
	name,
	options,
	bg = 'bg-white',
	border = 'border border-gray-100',
}) => {
	const { buttonRef, ref, setVisible, visible } = useOutClick<
		HTMLDivElement,
		HTMLSpanElement
	>();

	return (
		<div className={`${bg} ${border} p-4 relative rounded-lg shadow-lg`}>
			{options && (
				<div className="flex items-center justify-end mb-1">
					<span
						onClick={() => setVisible(true)}
						ref={buttonRef}
						className="flex items-center justify-center p-1 rounded-full hover:bg-gray-200"
					>
						<BiDotsVerticalRounded className="cursor-pointer duration-500 text-xl text-gray-700 hover:text-primary-500 hover:scale-105 md:text-2xl lg:text-xl" />
					</span>
				</div>
			)}
			<div className="my-1">
				<div className="flex justify-center items-center">
					<div className="bg-white border border-gray-200 h-[50px] my-1 relative rounded-full w-[50px] lg:h-[55px] lg:w-[55px]">
						<Image
							layout="fill"
							src={image && image.src ? image.src : DEFAULT_IMAGE}
							className="bg-white border border-gray-200 w-full h-full rounded-full"
							alt={image && image.alt ? image.alt : ''}
						/>
					</div>
				</div>
				{title && (
					<h5 className="capitalize font-bold my-1 text-base text-center text-gray-800 tracking-wide md:text-lg">
						{title}
					</h5>
				)}
				{name && (
					<p className="capitalize font-semibold my-1 text-sm text-center text-gray-700 tracking-wide md:text-base">
						{name}
					</p>
				)}
				{label && (
					<span className="capitalize block font-bold my-1 text-sm text-center text-gray-400 tracking-wide md:text-base">
						{label}
					</span>
				)}
				{actions && (
					<div className="gap-4 grid grid-cols-2 mt-2">
						{actions.map((action, index) => (
							<div key={index}>
								<Button
									caps
									focus=""
									padding="p-1"
									titleSize="text-sm"
									renderLinkAs={
										action.link
											? (props) => {
													return (
														<Link href={props.link || '#'}>
															<a {...props}>{props.children}</a>
														</Link>
													);
											  }
											: undefined
									}
									{...action}
								/>
							</div>
						))}
					</div>
				)}
			</div>
			<div
				ref={ref}
				className={`${
					visible ? 'visible opacity-100' : 'opacity-0 invisible'
				} absolute bg-gray-100 p-2 rounded-md right-0 shadow-lg top-0 w-[85%] xs:w-3/5 sm:w-1/2 lg:w-2/3`}
			>
				<div className="flex justify-end p-2 w-full">
					<span
						onClick={() => setVisible(false)}
						ref={buttonRef}
						className="flex items-center justify-center p-1 rounded-full hover:bg-gray-200"
					>
						<FaTimes className="cursor-pointer duration-500 text-base text-gray-700 hover:text-primary-500 hover:scale-105 md:text-lg lg:text-base" />
					</span>
				</div>
				{options && (
					<ul className="divide-y divde-gray-500 divide-opacity-50">
						{options.map((option, index) => (
							<li key={index} className="p-1 w-full">
								<Button
									caps
									focus=""
									titleSize="text-sm md:text-base lg:text-sm"
									renderLinkAs={
										option.link
											? (props) => {
													return (
														<Link href={props.link || '#'}>
															<a {...props}>{props.children}</a>
														</Link>
													);
											  }
											: undefined
									}
									{...option}
								/>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default PersonCard;
