'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
	type ColumnDef,
	type RowData,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
	CheckIcon,
	XIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductDecision } from '@/lib/types';
import type { SearchContentTourGroup } from '@/lib/campaign-api';

// ─── TanStack Table meta ─────────────────────────────────────────────────────
declare module '@tanstack/react-table' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface TableMeta<TData extends RowData> {
		decisions: Map<number, ProductDecision>;
		decide: (id: number, decision: ProductDecision) => void;
		selected: Set<number>;
		toggleSelect: (id: number) => void;
	}
}

const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price);
}

function formatCount(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	return n.toLocaleString();
}

function getDuration(tg: SearchContentTourGroup): string | null {
	const d = tg.descriptors?.find(x => x.code === 'DURATION');
	return d?.description ?? null;
}

// ─── Sortable header ─────────────────────────────────────────────────────────

function SortableHeader({
	label,
	sorted,
	onSort,
}: {
	label: string;
	sorted: false | 'asc' | 'desc';
	onSort: () => void;
}) {
	return (
		<button
			onClick={onSort}
			className='inline-flex items-center gap-1 cursor-pointer select-none group'
			style={{
				background: 'none',
				border: 'none',
				padding: 0,
				font: 'inherit',
				color: 'inherit',
			}}
		>
			{label}
			<span
				style={{
					color: sorted
						? 'var(--color-semantic-surface-dark-black)'
						: 'var(--color-semantic-icon-grey-disabled-2)',
					display: 'inline-flex',
				}}
			>
				{sorted === 'asc' ? (
					<ChevronUpIcon className='h-3.5 w-3.5' />
				) : sorted === 'desc' ? (
					<ChevronDownIcon className='h-3.5 w-3.5' />
				) : (
					<ChevronsUpDownIcon className='h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
				)}
			</span>
		</button>
	);
}

// ─── Column definitions ──────────────────────────────────────────────────────

const columns: ColumnDef<SearchContentTourGroup>[] = [
	{
		id: 'select',
		header: ({ table }) => {
			const { selected, toggleSelect } = table.options.meta!;
			const rows = table.getRowModel().rows;
			const allSelected =
				rows.length > 0 && rows.every(r => selected.has(r.original.id));
			const someSelected = rows.some(r => selected.has(r.original.id));
			return (
				<Checkbox
					checked={allSelected}
					data-state={
						!allSelected && someSelected
							? 'indeterminate'
							: undefined
					}
					onCheckedChange={() => {
						if (allSelected) {
							rows.forEach(r => {
								if (selected.has(r.original.id))
									toggleSelect(r.original.id);
							});
						} else {
							rows.forEach(r => {
								if (!selected.has(r.original.id))
									toggleSelect(r.original.id);
							});
						}
					}}
					aria-label='select-all'
				/>
			);
		},
		cell: ({ row, table }) => {
			const { selected, toggleSelect } = table.options.meta!;
			return (
				<Checkbox
					checked={selected.has(row.original.id)}
					onCheckedChange={() => toggleSelect(row.original.id)}
					aria-label={`select-${row.original.id}`}
				/>
			);
		},
	},
	{
		id: 'thumbnail',
		header: '',
		cell: ({ row }) => {
			const imageUrl = row.original.medias?.[0]?.url;
			if (!imageUrl) return null;
			return (
				<div
					style={{
						width: 52,
						height: 40,
						borderRadius: 6,
						overflow: 'hidden',
						flexShrink: 0,
						background:
							'var(--color-semantic-surface-light-grey-3)',
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={imageUrl}
						alt=''
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				</div>
			);
		},
	},
	{
		id: 'product',
		accessorKey: 'displayName',
		header: 'Product',
		cell: ({ row }) => (
			<div>
				<div
					className='font-medium line-clamp-2'
					style={{
						fontSize: '14px',
						maxWidth: 320,
						color: 'var(--color-semantic-surface-dark-black)',
						lineHeight: 1.35,
					}}
				>
					{row.original.displayName}
				</div>
				{(row.original.combo || row.original.multiVariant) && (
					<span
						className='mt-0.5'
						style={{
							fontSize: '11px',
							color: 'var(--color-semantic-text-disabled)',
							display: 'block',
						}}
					>
						{[
							row.original.combo && 'Combo',
							row.original.multiVariant && 'Multi-variant',
						]
							.filter(Boolean)
							.join('  ·  ')}
					</span>
				)}
			</div>
		),
	},
	{
		id: 'city',
		accessorFn: row => row.primaryCity?.displayName ?? '',
		header: 'City',
		cell: ({ row }) => (
			<span
				style={{
					fontSize: '14px',
					color: 'var(--color-semantic-text-grey-3)',
					whiteSpace: 'nowrap',
				}}
			>
				{row.original.primaryCity?.displayName ?? '—'}
			</span>
		),
	},
	{
		id: 'category',
		header: 'Category',
		cell: ({ row }) => (
			<div style={{ minWidth: 120 }}>
				<div
					style={{
						fontSize: '14px',
						color: 'var(--color-semantic-text-grey-3)',
					}}
				>
					{row.original.primaryCategory?.displayName ?? '—'}
				</div>
				{row.original.primarySubCategory?.displayName && (
					<span
						className='mt-0.5'
						style={{
							fontSize: '11px',
							color: 'var(--color-semantic-text-disabled)',
							display: 'block',
						}}
					>
						{row.original.primarySubCategory.displayName}
					</span>
				)}
			</div>
		),
	},
	{
		id: 'duration',
		header: 'Duration',
		cell: ({ row }) => {
			const dur = getDuration(row.original);
			return (
				<span
					style={{
						fontSize: '13px',
						color: 'var(--color-semantic-text-grey-3)',
						whiteSpace: 'nowrap',
					}}
				>
					{dur ?? '—'}
				</span>
			);
		},
	},
	{
		id: 'price',
		accessorFn: row => row.listingPrice.finalPrice,
		header: ({ column }) => (
			<SortableHeader
				label='Price'
				sorted={column.getIsSorted()}
				onSort={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			/>
		),
		cell: ({ row }) => {
			const { finalPrice, currencyCode } = row.original.listingPrice;
			return (
				<span
					className='tabular-nums font-medium'
					style={{
						fontSize: '14px',
						color: 'var(--color-semantic-surface-dark-black)',
						whiteSpace: 'nowrap',
					}}
				>
					{formatPrice(finalPrice, currencyCode)}
				</span>
			);
		},
	},
	{
		id: 'discount',
		accessorFn: row => row.listingPrice.bestDiscount,
		header: ({ column }) => (
			<SortableHeader
				label='Discount'
				sorted={column.getIsSorted()}
				onSort={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			/>
		),
		cell: ({ row }) => {
			const { bestDiscount } = row.original.listingPrice;
			if (!bestDiscount)
				return (
					<span
						style={{
							fontSize: '13px',
							color: 'var(--color-semantic-text-disabled)',
						}}
					>
						—
					</span>
				);
			return (
				<span
					style={{
						fontSize: '11px',
						fontWeight: 600,
						color: '#fff',
						borderRadius: 'var(--radius-full)',
						padding: '2px 7px',
						backgroundColor:
							'var(--color-semantic-surface-dark-success-1)',
						whiteSpace: 'nowrap',
					}}
				>
					-{bestDiscount}%
				</span>
			);
		},
	},
	{
		id: 'rating',
		accessorFn: row => row.ratings.value,
		header: ({ column }) => (
			<SortableHeader
				label='Rating'
				sorted={column.getIsSorted()}
				onSort={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			/>
		),
		cell: ({ row }) => (
			<div
				className='flex items-center gap-1'
				style={{ whiteSpace: 'nowrap' }}
			>
				<span style={{ color: '#F59E0B', fontSize: '13px' }}>★</span>
				<span
					className='tabular-nums font-medium'
					style={{
						fontSize: '14px',
						color: 'var(--color-semantic-surface-dark-black)',
					}}
				>
					{row.original.ratings.value.toFixed(1)}
				</span>
			</div>
		),
	},
	{
		id: 'reviewCount',
		accessorFn: row => row.ratings.count,
		header: ({ column }) => (
			<SortableHeader
				label='Reviews'
				sorted={column.getIsSorted()}
				onSort={() =>
					column.toggleSorting(column.getIsSorted() === 'asc')
				}
			/>
		),
		cell: ({ row }) => (
			<span
				className='tabular-nums'
				style={{
					fontSize: '13px',
					color: 'var(--color-semantic-text-grey-3)',
					whiteSpace: 'nowrap',
				}}
			>
				{formatCount(row.original.ratings.count)}
			</span>
		),
	},
	{
		id: 'actions',
		header: () => <span className='sr-only'>Actions</span>,
		cell: ({ row, table }) => {
			const { decisions, decide } = table.options.meta!;
			const decision = decisions.get(row.original.id);
			const isAccepted = decision === 'accepted';
			const isDeclined = decision === 'declined';
			return (
				<div className='flex items-center gap-1 justify-end pr-1'>
					<button
						aria-label={`accept-${row.original.id}`}
						onClick={() => decide(row.original.id, 'accepted')}
						className={cn(
							'inline-flex items-center justify-center rounded-full h-7 w-7 transition-colors cursor-pointer',
							isAccepted
								? 'bg-[var(--color-semantic-surface-dark-success-1)] text-white'
								: 'text-[var(--color-semantic-icon-grey-disabled-2)] hover:bg-[var(--color-semantic-surface-light-grey-3)] hover:text-[var(--color-semantic-text-grey-2)]',
						)}
					>
						<CheckIcon className='h-3.5 w-3.5' />
					</button>
					<button
						aria-label={`decline-${row.original.id}`}
						onClick={() => decide(row.original.id, 'declined')}
						className={cn(
							'inline-flex items-center justify-center rounded-full h-7 w-7 transition-colors cursor-pointer',
							isDeclined
								? 'bg-[#DC2626] text-white'
								: 'text-[var(--color-semantic-icon-grey-disabled-2)] hover:bg-[var(--color-semantic-surface-light-grey-3)] hover:text-[var(--color-semantic-text-grey-2)]',
						)}
					>
						<XIcon className='h-3.5 w-3.5' />
					</button>
				</div>
			);
		},
	},
];

// ─── Component ───────────────────────────────────────────────────────────────

interface ProductTableProps {
	products: SearchContentTourGroup[];
	onDecisionsChange?: (acceptedIds: number[], declinedIds: number[]) => void;
}

export function ProductTable({
	products,
	onDecisionsChange,
}: ProductTableProps) {
	const [decisions, setDecisions] = useState<Map<number, ProductDecision>>(
		new Map(),
	);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [sorting, setSorting] = useState<SortingState>([]);

	const decide = useCallback((id: number, decision: ProductDecision) => {
		setDecisions(prev => {
			const next = new Map(prev);
			if (next.get(id) === decision) next.delete(id);
			else next.set(id, decision);
			return next;
		});
	}, []);

	const toggleSelect = useCallback((id: number) => {
		setSelected(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const bulkDecide = useCallback(
		(decision: ProductDecision) => {
			setDecisions(prev => {
				const next = new Map(prev);
				selected.forEach(id => next.set(id, decision));
				return next;
			});
			setSelected(new Set());
		},
		[selected],
	);

	useEffect(() => {
		if (!onDecisionsChange) return;
		const accepted = [...decisions.entries()]
			.filter(([, d]) => d === 'accepted')
			.map(([id]) => id);
		const declined = [...decisions.entries()]
			.filter(([, d]) => d === 'declined')
			.map(([id]) => id);
		onDecisionsChange(accepted, declined);
	}, [decisions, onDecisionsChange]);

	const scrollRef = useRef<HTMLDivElement>(null);
	const [overflowing, setOverflowing] = useState(false);
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const update = () => setOverflowing(el.scrollWidth > el.clientWidth);
		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const table = useReactTable({
		data: products,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: PAGE_SIZE, pageIndex: 0 } },
		meta: { decisions, decide, selected, toggleSelect },
	});

	const { pageIndex } = table.getState().pagination;
	const totalPages = table.getPageCount();
	const acceptedCount = [...decisions.values()].filter(
		d => d === 'accepted',
	).length;
	const declinedCount = [...decisions.values()].filter(
		d => d === 'declined',
	).length;
	const selectionCount = selected.size;

	return (
		<div className='flex flex-col'>
			{/* Summary / bulk action bar */}
			<div className='flex items-center justify-between mb-3 min-h-[28px]'>
				<div
					className='flex items-center gap-2.5'
					style={{
						fontSize: '13px',
						color: 'var(--color-semantic-text-grey-3)',
					}}
				>
					{selectionCount > 0 ? (
						<span
							className='font-medium'
							style={{
								color: 'var(--color-semantic-surface-dark-black)',
							}}
						>
							{selectionCount} selected
						</span>
					) : (
						<span>{products.length} products</span>
					)}
					{acceptedCount > 0 && selectionCount === 0 && (
						<>
							<div
								className='h-3.5 w-px'
								style={{
									background:
										'var(--color-semantic-dividers-dark)',
								}}
							/>
							<span
								className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium'
								style={{
									fontSize: '12px',
									background: 'rgba(7,136,66,0.09)',
									color: 'var(--color-semantic-surface-dark-success-1)',
								}}
							>
								<CheckIcon className='h-3 w-3' />
								{acceptedCount} accepted
							</span>
						</>
					)}
					{declinedCount > 0 && selectionCount === 0 && (
						<>
							<div
								className='h-3.5 w-px'
								style={{
									background:
										'var(--color-semantic-dividers-dark)',
								}}
							/>
							<span
								className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium'
								style={{
									fontSize: '12px',
									background: 'rgba(220,38,38,0.07)',
									color: '#DC2626',
								}}
							>
								<XIcon className='h-3 w-3' />
								{declinedCount} declined
							</span>
						</>
					)}
				</div>

				{/* Bulk actions — only visible when rows are selected */}
				{selectionCount > 0 && (
					<div className='flex items-center gap-2'>
						<button
							onClick={() => bulkDecide('accepted')}
							className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer'
							style={{
								background:
									'var(--color-semantic-surface-dark-success-1)',
								color: '#fff',
							}}
						>
							<CheckIcon className='h-3.5 w-3.5' />
							Accept {selectionCount}
						</button>
						<button
							onClick={() => bulkDecide('declined')}
							className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer'
							style={{
								background: 'rgba(220,38,38,0.09)',
								color: '#DC2626',
							}}
						>
							<XIcon className='h-3.5 w-3.5' />
							Decline {selectionCount}
						</button>
					</div>
				)}
			</div>

			{/* Table — horizontally scrollable with sticky actions column */}
			<div
				ref={scrollRef}
				className='overflow-x-auto rounded-lg'
				style={{
					border: '1px solid var(--color-semantic-dividers-dark)',
				}}
			>
				<Table className='[&_td]:px-4 [&_td]:py-3.5 [&_th]:px-4 [&_th]:h-11 [&_tr]:border-[var(--color-semantic-surface-light-grey-3)]'>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow
								key={headerGroup.id}
								className='hover:bg-transparent border-b'
								style={{
									background:
										'var(--color-semantic-surface-light-grey-1)',
								}}
							>
								{headerGroup.headers.map(header => (
									<TableHead
										key={header.id}
										className={cn(
											'font-medium text-[12px] whitespace-nowrap',
											header.column.id === 'actions' &&
												overflowing
												? 'sticky right-0 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)] w-0 pr-4 text-end'
												: header.column.id === 'actions'
													? 'w-0 pr-4 text-end'
													: '',
										)}
										style={{
											color: 'var(--color-semantic-text-grey-3)',
											background:
												header.column.id ===
													'actions' && overflowing
													? 'var(--color-semantic-surface-light-grey-1)'
													: undefined,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows.map(row => {
							const decision = decisions.get(row.original.id);
							const isAccepted = decision === 'accepted';
							const isDeclined = decision === 'declined';
							const isSelected = selected.has(row.original.id);
							return (
								<TableRow
									key={row.id}
									className='transition-colors'
									style={{
										opacity: isDeclined ? 0.4 : 1,
										boxShadow: isAccepted
											? 'inset 3px 0 0 var(--color-semantic-surface-dark-success-1)'
											: undefined,
										background: isSelected
											? 'rgba(0,0,0,0.02)'
											: isAccepted
												? 'rgba(7,136,66,0.025)'
												: undefined,
									}}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell
											key={cell.id}
											className={
												cell.column.id === 'actions' &&
												overflowing
													? 'sticky right-0 bg-background shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]'
													: ''
											}
											style={
												cell.column.id === 'actions' &&
												overflowing
													? {
															background:
																isAccepted
																	? 'rgba(7,136,66,0.025)'
																	: isSelected
																		? 'rgba(0,0,0,0.02)'
																		: 'var(--background)',
														}
													: undefined
											}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div
				className='flex items-center justify-between px-4 py-2.5 rounded-b-lg'
				style={{
					fontSize: '13px',
					color: 'var(--color-semantic-text-grey-3)',
					borderLeft: '1px solid var(--color-semantic-dividers-dark)',
					borderRight:
						'1px solid var(--color-semantic-dividers-dark)',
					borderBottom:
						'1px solid var(--color-semantic-dividers-dark)',
					borderTop: '1px solid var(--color-semantic-dividers-dark)',
					marginTop: -1,
					background: 'var(--color-semantic-surface-light-grey-1)',
				}}
			>
				<div className='flex items-center gap-1'>
					<button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-semantic-surface-light-grey-3)]'
						style={{ color: 'var(--color-semantic-text-grey-2)' }}
					>
						<ChevronLeftIcon className='h-3.5 w-3.5' />
						Prev
					</button>
					<button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-semantic-surface-light-grey-3)]'
						style={{ color: 'var(--color-semantic-text-grey-2)' }}
					>
						Next
						<ChevronRightIcon className='h-3.5 w-3.5' />
					</button>
				</div>

				<span style={{ color: 'var(--color-semantic-text-disabled)' }}>
					Page {pageIndex + 1} of {totalPages} &nbsp;·&nbsp;{' '}
					{products.length} results
				</span>
			</div>
		</div>
	);
}
