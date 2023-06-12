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
				key=">"
				links={dir
					.split('/')
					.filter((i, m) => m < dir.split('/').length - 1)
					.map((value, index, arr) => {
						const isMedia = index === 0 && value === 'media';
						return {
							link: '#',
							title: isMedia ? 'home' : value,
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
									className="cursor-pointer text-gray-500 text-sm tracking-wide transition-all uppercase hover:scale-105 md:text-base"
								>
									{isMedia ? 'home' : value}
								</span>
							),
						};
					})}
			/>
		</div>
	);
}

export default Crumbs;
