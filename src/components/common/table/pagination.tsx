import { PaginationType, Select, usePagination } from 'kite-react-tailwind';
import React from 'react';
import {
	FaAngleDoubleLeft,
	FaAngleDoubleRight,
	FaChevronLeft,
	FaChevronRight,
} from 'react-icons/fa';

import { Button, PageButton } from './components';
// import { usePagination } from "../../../hooks";

export type PaginationProps = PaginationType & {
	disabled?: boolean;
	onChange?: (pageNumber: number) => void;
	onSizeChange?: (size: number) => void;
	pageSizes?: number[];
};

function Pagination({
	disabled = false,
	onChange,
	pageSizes = [5, 10, 25, 50, 100, 200, 400, 500, 800, 1000],
	onSizeChange,
	...props
}: PaginationProps) {
	const { changePage, currentPage, pages, pageSize, totalPages } =
		usePagination({
			...props,
			pageSize: props.pageSize || 5,
		});

	const canPreviousPage = React.useMemo(() => currentPage > 1, [currentPage]);
	const canNextPage = React.useMemo(
		() => currentPage < totalPages,
		[currentPage, totalPages]
	);

	const goToPage = React.useCallback(
		(pageNumber = 1) => {
			if (!disabled && currentPage !== pageNumber) {
				changePage(pageNumber);
				if (onChange) onChange(pageNumber);
			}
		},
		[currentPage, changePage, disabled, onChange]
	);

	const previousPage = React.useCallback(() => {
		const value = currentPage - 1 <= 0 ? 1 : currentPage - 1;
		goToPage(value);
	}, [currentPage, goToPage]);

	const nextPage = React.useCallback(() => {
		const value = currentPage + 1 >= totalPages ? totalPages : currentPage + 1;
		goToPage(value);
	}, [currentPage, goToPage, totalPages]);

	return (
		<div className="flex items-center justify-between py-3">
			<div className="flex flex-1 justify-between sm:hidden">
				<Button onClick={previousPage} disabled={!canPreviousPage || disabled}>
					Previous
				</Button>
				<Button onClick={nextPage} disabled={!canNextPage || disabled}>
					Next
				</Button>
			</div>
			<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
				<div className="flex gap-x-2 items-center">
					<p className="text-sm text-gray-700 tracking-wider w-full md:text-base">
						Page <span className="font-medium">{currentPage}</span> of{' '}
						<span className="font-medium">{totalPages}</span>
					</p>
					<div className="min-w-[200px] mx-2">
						<Select
							disabled={disabled}
							onChange={({ target: { value } }) => {
								if (onSizeChange) onSizeChange(+value);
							}}
							options={pageSizes.map((pageSize) => ({
								title: `Show ${pageSize}`,
								value: pageSize.toString(),
							}))}
							value={pageSize.toString()}
						/>
					</div>
				</div>
				<div>
					<nav
						className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
						aria-label="Pagination"
					>
						<PageButton
							className="rounded-l-md"
							onClick={() => goToPage(1)}
							disabled={!canPreviousPage || disabled}
						>
							<span className="sr-only">First</span>
							<FaAngleDoubleLeft
								className="text-xs md:text-sm"
								aria-hidden="true"
							/>
						</PageButton>
						<PageButton
							onClick={previousPage}
							disabled={!canPreviousPage || disabled}
						>
							<span className="sr-only">Previous</span>
							<FaChevronLeft className="text-xs" aria-hidden="true" />
						</PageButton>
						<div className="hidden lg:flex lg:items-center">
							{pages.map((page, index) => (
								<PageButton
									active={page === currentPage}
									className="px-3"
									disabled={disabled}
									key={index}
									onClick={() => goToPage(page)}
								>
									{page}
								</PageButton>
							))}
						</div>
						<PageButton onClick={nextPage} disabled={!canNextPage || disabled}>
							<span className="sr-only">Next</span>
							<FaChevronRight className="text-xs" aria-hidden="true" />
						</PageButton>
						<PageButton
							className="rounded-r-md"
							onClick={() => goToPage(totalPages)}
							disabled={!canNextPage || disabled}
						>
							<span className="sr-only">Last</span>
							<FaAngleDoubleRight
								className="text-xs md:text-sm"
								aria-hidden="true"
							/>
						</PageButton>
					</nav>
				</div>
			</div>
		</div>
	);
}

export default Pagination;
