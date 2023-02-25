import { FC } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import usePagination, { PaginationType } from '../../hooks/usePagination';

const paginationNumberStyle =
	'block flex items-center justify-center mx-[2px] rounded-sm text-sm';

const PageNumber = ({
	active,
	disabled,
	onClick,
	value,
}: {
	active: boolean;
	disabled: boolean;
	onClick: () => void;
	value: number;
}) => (
	<span
		onClick={disabled === false ? onClick : undefined}
		className={`${paginationNumberStyle} select-none px-2 py-1 text-white sm:mx-[4px] md:mx-[5px] lg:mx-[6px] ${
			disabled
				? 'bg-gray-500 cursor-not-allowed'
				: active
				? 'bg-red-600 cursor-pointer'
				: 'bg-primary-500 cursor-pointer hover:bg-red-600'
		}`}
	>
		{value}
	</span>
);

const Arrow = ({
	direction,
	disabled,
	onClick,
}: {
	direction: 'left' | 'right';
	disabled: boolean;
	onClick: () => void;
}) => (
	<span
		onClick={disabled === false ? onClick : undefined}
		className={
			paginationNumberStyle +
			` ${
				disabled
					? 'bg-gray-500 cursor-not-allowed text-white'
					: ' border-primary-500 cursor-pointer text-primary-500 hover:bg-primary-500 hover:text-white'
			}` +
			' border select-none sm:mx-[4px] md:mx-[5px] p-1'
		}
	>
		{direction === 'left' ? (
			<FaChevronLeft className="select-none text-tiny" />
		) : (
			<FaChevronRight className="select-none text-tiny" />
		)}
	</span>
);

interface PaginateType extends PaginationType {
	disabled: boolean;
	onChange: (pageNo: number) => void;
}

const Pagination: FC<PaginateType> = ({
	current = 1,
	disabled = false,
	maxPages = 7,
	pageSize = 50,
	totalItems,
	onChange,
}) => {
	const { changePage, currentPage, pages, totalPages } = usePagination({
		totalItems,
		current,
		pageSize,
		maxPages,
	});

	return (
		<div className="flex font-calibri items-center justify-center">
			{!pages.includes(1) && (
				<Arrow
					disabled={disabled}
					onClick={() => {
						const value = currentPage - 1 <= 0 ? 1 : currentPage - 1;
						if (currentPage !== value && disabled == false) {
							changePage(value);
							onChange(value);
						}
					}}
					direction="left"
				/>
			)}
			{pages.map((page) => (
				<PageNumber
					active={page === currentPage}
					disabled={disabled}
					key={page}
					onClick={() => {
						if (page !== currentPage && disabled === false) {
							changePage(page);
							onChange(page);
						}
					}}
					value={page}
				/>
			))}
			{!pages.includes(totalPages) && (
				<Arrow
					disabled={disabled}
					onClick={() => {
						const value =
							currentPage + 1 >= totalPages ? totalPages : currentPage + 1;
						if (currentPage !== value && disabled === false) {
							changePage(value);
							onChange(value);
						}
					}}
					direction="right"
				/>
			)}
		</div>
	);
};

export default Pagination;
