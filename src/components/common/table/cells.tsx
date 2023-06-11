import Image from 'next/image';
import { IconType } from 'react-icons';

export function TableIconNameSizeCell({
	bg = 'bg-primary-500',
	name,
	size,
	icon: Icon,
}: {
	bg?: string;
	name: string;
	size?: string | number;
	icon: IconType;
}) {
	return (
		<abbr title={name} className="flex items-center no-underline py-2">
			<section className="flex-shrink-0 h-[35px] w-[35px]">
				<span
					className={`${bg} h-[35px] inline-flex items-center justify-center relative rounded-full text-gray-100 w-[35px]`}
				>
					<Icon className="h-[15px] text-gray-100 w-[15px]" />
				</span>
			</section>
			<section className="ml-2 text-left">
				<div className="normal-case text-sm font-medium text-gray-900">
					{name}
				</div>
				{size && (
					<div className="font-normal text-sm text-gray-500 uppercase">
						{size}
					</div>
				)}
			</section>
		</abbr>
	);
}

export function TableAvatarEmailNameCell({
	email,
	image,
	name,
}: {
	name: string;
	email: string;
	image?: string;
}) {
	return (
		<div className="flex items-center py-2">
			{image && (
				<section className="flex-shrink-0 h-10 w-10">
					<div className="h-10 relative rounded-full w-10">
						<Image alt="" className="rounded-full" layout="fill" src={image} />
					</div>
				</section>
			)}
			<section className={`${image ? 'ml-4' : ''} text-left`}>
				<div className="text-sm font-medium text-gray-900">{name}</div>
				<div className="normal-case font-normal text-sm text-gray-500">
					{email}
				</div>
			</section>
		</div>
	);
}
