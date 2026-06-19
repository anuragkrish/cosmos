'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
	ChevronDownIcon,
	SparklesIcon,
	InfoIcon,
	ExternalLinkIcon,
	XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductDecision } from '@/lib/types';
import type { SearchContentTourGroup } from '@/lib/campaign-api';
import type {
	RecommendResponse,
	CompetitorSource,
} from '@/pages/api/recommend';

// ─── TanStack Table meta ─────────────────────────────────────────────────────
declare module '@tanstack/react-table' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface TableMeta<TData extends RowData> {
		decisions: Map<number, ProductDecision>;
		decide: (id: number, decision: ProductDecision) => void;
		selected: Set<number>;
		toggleSelect: (id: number) => void;
		aiPicks: number[];
		openInfo: (id: number) => void;
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

// ─── AI insight popup (rendered via portal) ──────────────────────────────────

function AiInsightPopup({
	id,
	rank,
	reason,
	source,
	onClose,
}: {
	id: number;
	rank: number;
	reason?: string;
	source?: CompetitorSource;
	onClose: () => void;
}) {
	const sourceDomain = source
		? new URL(source.url).hostname.replace('www.', '')
		: null;

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [onClose]);

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 9999,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'rgba(0,0,0,0.35)',
			}}
			onClick={onClose}
		>
			<div
				role='dialog'
				aria-modal='true'
				onClick={e => e.stopPropagation()}
				style={{
					background: '#fff',
					borderRadius: 14,
					padding: '20px 22px',
					width: 340,
					boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
					border: '1px solid rgba(124,58,237,0.12)',
				}}
			>
				{/* header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 14,
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<span
							style={{
								fontSize: '10px',
								fontWeight: 700,
								padding: '2px 7px',
								borderRadius: 99,
								background:
									'linear-gradient(135deg, #7c3aed, #4f46e5)',
								color: '#fff',
								letterSpacing: '0.02em',
							}}
						>
							#{rank} AI Pick
						</span>
						{sourceDomain && (
							<span
								style={{
									fontSize: '10px',
									fontWeight: 600,
									padding: '2px 7px',
									borderRadius: 99,
									background: '#f3f0ff',
									color: '#5b21b6',
								}}
							>
								{sourceDomain}
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						aria-label='Close'
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							color: '#9ca3af',
							padding: 2,
							display: 'flex',
							borderRadius: 4,
						}}
					>
						<XIcon style={{ width: 15, height: 15 }} />
					</button>
				</div>

				{/* reason */}
				{reason && (
					<p
						style={{
							fontSize: '13px',
							lineHeight: 1.6,
							color: '#111827',
							margin: 0,
							marginBottom: source ? 14 : 0,
						}}
					>
						{reason}
					</p>
				)}

				{/* competitor source link */}
				{source && (
					<a
						href={source.url}
						target='_blank'
						rel='noopener noreferrer'
						style={{
							display: 'flex',
							alignItems: 'flex-start',
							gap: 8,
							padding: '10px 12px',
							borderRadius: 9,
							background: '#f8f5ff',
							border: '1px solid rgba(124,58,237,0.15)',
							textDecoration: 'none',
						}}
					>
						<ExternalLinkIcon
							style={{
								width: 13,
								height: 13,
								color: '#7c3aed',
								flexShrink: 0,
								marginTop: 2,
							}}
						/>
						<div>
							<div
								style={{
									fontSize: '11px',
									fontWeight: 600,
									color: '#5b21b6',
									marginBottom: 2,
								}}
							>
								{sourceDomain}
							</div>
							<div
								style={{
									fontSize: '11px',
									color: '#6d28d9',
									lineHeight: 1.4,
									wordBreak: 'break-word',
								}}
							>
								{source.title}
							</div>
						</div>
					</a>
				)}
			</div>
		</div>
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
		cell: ({ row, table }) => {
			const imageUrl = row.original.medias?.[0]?.url;
			const { aiPicks, openInfo } = table.options.meta!;
			const rank = aiPicks.indexOf(row.original.id);
			const isAiPick = rank !== -1;
			return (
				<div style={{ position: 'relative', display: 'inline-flex' }}>
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
						{imageUrl && (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={imageUrl}
								alt=''
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						)}
					</div>
					{isAiPick && (
						<>
							{/* rank badge */}
							<span
								style={{
									position: 'absolute',
									top: -5,
									right: -5,
									fontSize: '9px',
									fontWeight: 700,
									lineHeight: 1,
									padding: '2px 4px',
									borderRadius: 4,
									background:
										'linear-gradient(135deg, #7c3aed, #4f46e5)',
									color: '#fff',
									whiteSpace: 'nowrap',
									boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
								}}
							>
								#{rank + 1}
							</span>
							{/* info icon */}
							<button
								onClick={() => openInfo(row.original.id)}
								aria-label='Why recommended'
								style={{
									position: 'absolute',
									bottom: -5,
									right: -5,
									width: 16,
									height: 16,
									borderRadius: '50%',
									background:
										'linear-gradient(135deg, #7c3aed, #4f46e5)',
									border: 'none',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
									padding: 0,
								}}
							>
								<InfoIcon
									style={{
										width: 9,
										height: 9,
										color: '#fff',
										strokeWidth: 2.5,
									}}
								/>
							</button>
						</>
					)}
				</div>
			);
		},
	},
	{
		id: 'product',
		accessorKey: 'displayName',
		header: 'Product',
		size: 300,
		minSize: 200,
		maxSize: 320,
		cell: ({ row }) => (
			<div style={{ width: 280, minWidth: 0 }}>
				<div
					className='font-medium line-clamp-2'
					style={{
						fontSize: '14px',
						color: 'var(--color-semantic-surface-dark-black)',
						lineHeight: 1.35,
					}}
				>
					{row.original.displayName}
				</div>
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
			const isTagged = decision === 'accepted';
			return (
				<div className='flex items-center justify-end pr-2'>
					<button
						aria-label={`tag-${row.original.id}`}
						onClick={() => decide(row.original.id, 'accepted')}
						className={cn(
							'inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap',
							isTagged
								? 'bg-[var(--color-semantic-surface-dark-success-1)] text-white'
								: 'border border-[var(--color-semantic-dividers-dark)] text-[var(--color-semantic-text-grey-3)] hover:bg-[var(--color-semantic-surface-light-grey-3)] hover:text-[var(--color-semantic-text-grey-2)]',
						)}
					>
						<CheckIcon className='h-3 w-3' />
						{isTagged ? 'Tagged' : 'Tag'}
					</button>
				</div>
			);
		},
	},
];

// ─── Component ───────────────────────────────────────────────────────────────

interface ProductTableProps {
	products: SearchContentTourGroup[];
	query?: string;
	onDecisionsChange?: (acceptedIds: number[]) => void;
}

export function ProductTable({
	products,
	query,
	onDecisionsChange,
}: ProductTableProps) {
	const [decisions, setDecisions] = useState<Map<number, ProductDecision>>(
		new Map(),
	);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [sorting, setSorting] = useState<SortingState>([]);
	const [aiPicks, setAiPicks] = useState<number[]>([]);
	const [aiReasons, setAiReasons] = useState<Record<number, string>>({});
	const [aiSources, setAiSources] = useState<
		Record<number, CompetitorSource>
	>({});
	const [aiContext, setAiContext] = useState<string>('');
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState<string | null>(null);
	const [openInfoId, setOpenInfoId] = useState<number | null>(null);

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

	const aiLoadingRef = useRef(false);
	const recommendWithAI = useCallback(async () => {
		if (!query || aiLoadingRef.current) return;
		aiLoadingRef.current = true;
		setAiLoading(true);
		setAiError(null);
		try {
			const slim = products.map(p => ({
				id: p.id,
				displayName: p.displayName,
				primaryCity: p.primaryCity,
				primaryCategory: p.primaryCategory,
				primarySubCategory: p.primarySubCategory,
				descriptors: p.descriptors,
				ratings: p.ratings,
			}));
			const res = await fetch('/api/recommend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query, products: slim }),
			});
			if (!res.ok) throw new Error(`API error ${res.status}`);
			const data = (await res.json()) as RecommendResponse;
			setAiPicks(data.recommendedIds);
			setAiReasons(data.reasons ?? {});
			setAiSources(data.sources ?? {});
			setAiContext(data.searchContext);
		} catch (e) {
			setAiError(
				e instanceof Error ? e.message : 'Recommendation failed',
			);
		} finally {
			aiLoadingRef.current = false;
			setAiLoading(false);
		}
	}, [query, products]);

	useEffect(() => {
		if (!onDecisionsChange) return;
		const accepted = [...decisions.entries()]
			.filter(([, d]) => d === 'accepted')
			.map(([id]) => id);
		onDecisionsChange(accepted);
	}, [decisions, onDecisionsChange]);

	// When AI picks are active, float them to the top of the product list.
	// useMemo is critical here — without it a new array is created every render,
	// TanStack's autoResetPageIndex sees a new data reference and calls setPageIndex,
	// which triggers a re-render, which creates another new array → infinite loop.
	const sortedProducts = useMemo(
		() =>
			aiPicks.length > 0
				? [
						...aiPicks
							.map(id => products.find(p => p.id === id))
							.filter((p): p is SearchContentTourGroup => !!p),
						...products.filter(p => !aiPicks.includes(p.id)),
					]
				: products,
		[aiPicks, products],
	);

	const scrollRef = useRef<HTMLDivElement>(null);

	const table = useReactTable({
		data: sortedProducts,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex: false,
		initialState: { pagination: { pageSize: PAGE_SIZE, pageIndex: 0 } },
		meta: {
			decisions,
			decide,
			selected,
			toggleSelect,
			aiPicks,
			openInfo: setOpenInfoId,
		},
	});

	// Jump to page 1 when AI picks arrive so recommended rows are visible
	useEffect(() => {
		if (aiPicks.length > 0) table.setPageIndex(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [aiPicks]);

	const { pageIndex } = table.getState().pagination;
	const totalPages = table.getPageCount();
	const taggedCount = [...decisions.values()].filter(
		d => d === 'accepted',
	).length;
	const selectionCount = selected.size;

	return (
		<div className='flex flex-col'>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
					{taggedCount > 0 && selectionCount === 0 && (
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
								{taggedCount} tagged
							</span>
						</>
					)}
				</div>

				{/* Right side: AI recommend button + bulk actions */}
				<div className='flex items-center gap-2'>
					{/* Recommend with AI — shown when no bulk selection is active */}
					{selectionCount === 0 && query && (
						<div className='flex flex-col items-end gap-1'>
							<button
								onClick={() => void recommendWithAI()}
								disabled={aiLoading}
								className='inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-[12px] font-medium transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
								style={
									aiPicks.length > 0
										? {
												background:
													'linear-gradient(135deg, #7c3aed, #4f46e5)',
												color: '#fff',
												boxShadow:
													'0 1px 6px rgba(124,58,237,0.35)',
											}
										: {
												background:
													'linear-gradient(135deg, #ede9fe, #e0e7ff)',
												color: '#5b21b6',
												border: '1px solid rgba(124,58,237,0.2)',
											}
								}
								title={aiContext || undefined}
							>
								{aiLoading ? (
									<>
										<span
											style={{
												display: 'inline-block',
												width: 10,
												height: 10,
												borderRadius: '50%',
												border: '1.5px solid currentColor',
												borderTopColor: 'transparent',
												animation:
													'spin 0.7s linear infinite',
											}}
										/>
										Analysing…
									</>
								) : (
									<>
										<SparklesIcon className='h-3 w-3' />
										{aiPicks.length > 0
											? `${aiPicks.length} AI picks · Redo`
											: 'Recommend with AI'}
									</>
								)}
							</button>
							{aiError && (
								<span
									style={{
										fontSize: '11px',
										color: '#DC2626',
									}}
								>
									{aiError}
								</span>
							)}
						</div>
					)}

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
								Tag {selectionCount}
							</button>
						</div>
					)}
				</div>
				{/* end right-side flex */}
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
											header.column.id === 'actions'
												? 'sticky right-0 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)] w-0 pr-2 text-end'
												: '',
										)}
										style={{
											color: 'var(--color-semantic-text-grey-3)',
											background:
												header.column.id === 'actions'
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
							const isSelected = selected.has(row.original.id);
							const isAiPick = aiPicks.includes(row.original.id);
							return (
								<TableRow
									key={row.id}
									className='transition-colors'
									style={{
										boxShadow: isAccepted
											? 'inset 3px 0 0 var(--color-semantic-surface-dark-success-1)'
											: isAiPick
												? 'inset 3px 0 0 #7c3aed'
												: undefined,
										background: isSelected
											? 'rgba(0,0,0,0.02)'
											: isAccepted
												? 'rgba(7,136,66,0.025)'
												: isAiPick
													? 'rgba(124,58,237,0.03)'
													: undefined,
									}}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell
											key={cell.id}
											className={
												cell.column.id === 'actions'
													? 'sticky right-0 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]'
													: ''
											}
											style={
												cell.column.id === 'actions'
													? {
															// Must be fully opaque — semi-transparent
															// backgrounds let scrolled content bleed
															// through the sticky cell.
															background:
																isAccepted
																	? '#f2fdf6'
																	: isAiPick
																		? '#f8f5ff'
																		: isSelected
																			? '#f9f9f9'
																			: '#ffffff',
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

			{/* AI insight popup — rendered via portal so it sits directly on body,
			    escaping any parent transform/filter stacking contexts */}
			{openInfoId !== null &&
				typeof document !== 'undefined' &&
				createPortal(
					<AiInsightPopup
						id={openInfoId}
						rank={aiPicks.indexOf(openInfoId) + 1}
						reason={aiReasons[openInfoId]}
						source={aiSources[openInfoId]}
						onClose={() => setOpenInfoId(null)}
					/>,
					document.body,
				)}
		</div>
	);
}
