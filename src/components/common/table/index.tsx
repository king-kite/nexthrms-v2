import Image from 'next/image';

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
