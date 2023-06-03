import { Breadcrumbs } from 'kite-react-tailwind';
import React from 'react';

import { MEDIA_URL } from '../../config';

function Crumbs({
	dir,
	setDir,
}: {
	dir: string;
	setDir: React.Dispatch<React.SetStateAction<string>>;
}) {
	return (
		<div className="my-3">
			<Breadcrumbs
				links={dir
					.split('/')
					.filter((i, m) => m < dir.split('/').length - 1)
					.map((value, index, arr) => {
						const isMedia = index === 0 && value === 'media';
						return {
							link: '#',
							title: isMedia ? '..' : value,
							renderAs: () => (
								<span
									onClick={() => {
										if (isMedia) setDir(MEDIA_URL);
										else {
											let location = arr.filter((a, j) => j <= index).join('/');
											location = location.endsWith('/')
												? location
												: location + '/';
											setDir(location);
										}
									}}
									className={`cursor-pointer text-gray-500 transition-all ${
										isMedia
											? 'text-[23px] hover:scale-110 sm:text-[25px] md:text-[27px]'
											: 'text-sm hover:scale-105 sm:text-base md:text-lg'
									}`}
								>
									{isMedia ? '..' : value}
								</span>
							),
						};
					})}
			/>
		</div>
	);
}

export default Crumbs;
