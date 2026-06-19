'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import {
	getCollections,
	deleteCollection,
	type CollectionSummary,
} from '@/lib/campaign-api';

const BASE_SITE = 'https://poc-shv.deimos.dev-headout.com';

// ── Helpers ────────────────────────────────────────────────────────────────

function collectionUrl(c: CollectionSummary): string {
	const cid = c.collectionId ?? c.id;
	return `${BASE_SITE}/${c.urlSlug ?? c.name ?? cid}-c-${cid}`;
}

// ── Delete button with inline confirm ─────────────────────────────────────

function DeleteButton({
	onConfirm,
	loading,
}: {
	onConfirm: () => void;
	loading: boolean;
}) {
	const [confirming, setConfirming] = useState(false);

	if (loading) {
		return (
			<span
				style={{
					fontSize: '12px',
					color: 'var(--color-semantic-text-grey-3)',
					display: 'inline-flex',
					alignItems: 'center',
					gap: 6,
				}}
			>
				<span
					style={{
						width: 12,
						height: 12,
						border: '2px solid rgba(0,0,0,0.15)',
						borderTopColor: '#DC2626',
						borderRadius: '50%',
						display: 'inline-block',
						animation: 'spin 0.7s linear infinite',
					}}
				/>
				Deleting…
			</span>
		);
	}

	if (confirming) {
		return (
			<div className='flex items-center gap-1.5'>
				<span
					style={{
						fontSize: '12px',
						color: 'var(--color-semantic-text-grey-3)',
					}}
				>
					Delete?
				</span>
				<button
					onClick={() => {
						setConfirming(false);
						onConfirm();
					}}
					style={{
						fontSize: '12px',
						fontWeight: 600,
						color: '#fff',
						background: '#DC2626',
						border: 'none',
						borderRadius: 'var(--radius-6)',
						padding: '4px 10px',
						cursor: 'pointer',
					}}
				>
					Yes, delete
				</button>
				<button
					onClick={() => setConfirming(false)}
					style={{
						fontSize: '12px',
						color: 'var(--color-semantic-text-grey-3)',
						background: 'none',
						border: '1px solid var(--color-semantic-dividers-dark)',
						borderRadius: 'var(--radius-6)',
						padding: '4px 10px',
						cursor: 'pointer',
					}}
				>
					Cancel
				</button>
			</div>
		);
	}

	return (
		<button
			onClick={() => setConfirming(true)}
			style={{
				fontSize: '12px',
				fontWeight: 500,
				color: '#DC2626',
				background: 'rgba(220,38,38,0.07)',
				border: '1px solid rgba(220,38,38,0.18)',
				borderRadius: 'var(--radius-6)',
				padding: '5px 12px',
				cursor: 'pointer',
				transition: 'background 0.12s',
				whiteSpace: 'nowrap',
			}}
		>
			Delete
		</button>
	);
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PreviousCampaigns() {
	const [collections, setCollections] = useState<CollectionSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<Set<number | string>>(new Set());

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getCollections();
			setCollections(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Failed to load campaigns.',
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const handleDelete = useCallback(async (c: CollectionSummary) => {
		const cid = c.collectionId ?? c.id;
		setDeleting(prev => new Set(prev).add(cid));
		try {
			await deleteCollection(cid);
			setCollections(prev =>
				prev.filter(x => (x.collectionId ?? x.id) !== cid),
			);
		} catch {
			// keep item, let user retry
		} finally {
			setDeleting(prev => {
				const next = new Set(prev);
				next.delete(cid);
				return next;
			});
		}
	}, []);

	return (
		<div
			className='flex min-h-screen flex-col'
			style={{ background: 'var(--background)' }}
		>
			<style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

			<AppHeader sticky label='COSMOS' />

			<div
				className='mx-auto w-full max-w-[1100px] px-8 py-[48px]'
				style={{ animation: 'fadeIn 0.3s ease both' }}
			>
				<div className='flex items-center justify-between mb-[32px]'>
					<div>
						<h1
							className='text-[28px] font-semibold text-[var(--color-semantic-text-grey-1)]'
							style={{ fontFamily: 'var(--font-hd)' }}
						>
							Previous Campaigns
						</h1>
						<p className='mt-1 text-[14px] font-light text-[var(--color-semantic-text-grey-3)]'>
							All campaign collections created via Cosmos.
						</p>
					</div>
					{!loading && !error && (
						<span
							style={{
								fontSize: '13px',
								color: 'var(--color-semantic-text-grey-3)',
							}}
						>
							{collections.length} collection
							{collections.length !== 1 ? 's' : ''}
						</span>
					)}
				</div>

				{/* Loading */}
				{loading && (
					<div className='flex items-center justify-center py-[80px]'>
						<span
							style={{
								width: 20,
								height: 20,
								border: '2.5px solid var(--color-semantic-dividers-dark)',
								borderTopColor:
									'var(--color-semantic-text-grey-1)',
								borderRadius: '50%',
								display: 'inline-block',
								animation: 'spin 0.7s linear infinite',
							}}
						/>
					</div>
				)}

				{/* Error */}
				{error && !loading && (
					<div
						className='rounded-[var(--radius-12)] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-5 text-center'
						style={{ animation: 'fadeIn 0.3s ease both' }}
					>
						<p className='text-[14px] font-medium text-[#DC2626]'>
							{error}
						</p>
						<button
							onClick={() => void load()}
							className='mt-3 text-[13px] font-medium text-[#DC2626] underline cursor-pointer'
						>
							Try again
						</button>
					</div>
				)}

				{/* Empty */}
				{!loading && !error && collections.length === 0 && (
					<div
						className='flex flex-col items-center justify-center py-[80px] gap-3'
						style={{ animation: 'fadeIn 0.3s ease both' }}
					>
						<p
							className='text-[15px] font-light text-[var(--color-semantic-text-grey-3)]'
							style={{ fontFamily: 'var(--font-serif)' }}
						>
							No campaigns found.
						</p>
					</div>
				)}

				{/* Collection list */}
				{!loading && !error && collections.length > 0 && (
					<div
						className='rounded-[var(--radius-12)] overflow-hidden'
						style={{
							border: '1px solid var(--color-semantic-dividers-dark)',
							animation: 'fadeIn 0.35s ease both',
						}}
					>
						{collections.map((c, i) => {
							const cid = c.collectionId ?? c.id;
							const url = collectionUrl(c);
							const isDeleting = deleting.has(cid);
							return (
								<div
									key={String(cid)}
									className='flex items-center gap-4 px-5 py-4'
									style={{
										borderBottom:
											i < collections.length - 1
												? '1px solid var(--color-semantic-dividers-dark)'
												: 'none',
										background: isDeleting
											? 'var(--color-semantic-surface-light-grey-1)'
											: 'var(--color-semantic-surface-light-white)',
										opacity: isDeleting ? 0.6 : 1,
										transition:
											'opacity 0.2s, background 0.2s',
									}}
								>
									{/* Thumbnail */}
									{c.heroImageUrl ? (
										<div
											style={{
												width: 56,
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
												src={c.heroImageUrl}
												alt=''
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										</div>
									) : (
										<div
											style={{
												width: 56,
												height: 40,
												borderRadius: 6,
												flexShrink: 0,
												background:
													'var(--color-semantic-surface-light-grey-2)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<svg
												width='18'
												height='14'
												viewBox='0 0 18 14'
												fill='none'
											>
												<rect
													x='0.5'
													y='0.5'
													width='17'
													height='13'
													rx='1.5'
													stroke='var(--color-semantic-icon-grey-disabled-2)'
												/>
												<path
													d='M0.5 4.5h17'
													stroke='var(--color-semantic-icon-grey-disabled-2)'
												/>
											</svg>
										</div>
									)}

									{/* Info */}
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2'>
											<span
												style={{
													fontSize: '14px',
													fontWeight: 500,
													color: 'var(--color-semantic-text-grey-1)',
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													maxWidth: 320,
												}}
											>
												{c.displayName ??
													c.name ??
													`Collection ${c.id}`}
											</span>
											<span
												style={{
													fontSize: '11px',
													color: 'var(--color-semantic-text-grey-3)',
													background:
														'var(--color-semantic-surface-light-grey-2)',
													padding: '2px 8px',
													borderRadius:
														'var(--radius-full)',
													flexShrink: 0,
												}}
											>
												ID {String(cid)}
											</span>
											{c.city && (
												<span
													style={{
														fontSize: '11px',
														color: 'var(--color-semantic-text-grey-3)',
														flexShrink: 0,
													}}
												>
													{c.city}
												</span>
											)}
										</div>
										<a
											href={url}
											target='_blank'
											rel='noopener noreferrer'
											style={{
												fontSize: '12px',
												color: 'var(--color-semantic-text-grey-3)',
												textDecoration: 'none',
												display: 'block',
												marginTop: 2,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												maxWidth: 480,
											}}
											onMouseEnter={e =>
												((
													e.currentTarget as HTMLElement
												).style.textDecoration =
													'underline')
											}
											onMouseLeave={e =>
												((
													e.currentTarget as HTMLElement
												).style.textDecoration = 'none')
											}
										>
											{url}
										</a>
									</div>

									{/* View + Delete */}
									<div className='flex items-center gap-2 flex-shrink-0'>
										<a
											href={url}
											target='_blank'
											rel='noopener noreferrer'
											style={{
												fontSize: '12px',
												fontWeight: 500,
												color: 'var(--color-semantic-text-grey-2)',
												background:
													'var(--color-semantic-surface-light-white)',
												border: '1px solid var(--color-semantic-dividers-dark)',
												borderRadius: 'var(--radius-6)',
												padding: '5px 12px',
												textDecoration: 'none',
												display: 'inline-flex',
												alignItems: 'center',
												gap: 5,
												whiteSpace: 'nowrap',
											}}
										>
											<svg
												width='11'
												height='11'
												viewBox='0 0 12 12'
												fill='none'
												stroke='currentColor'
												strokeWidth='1.5'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8.5' />
											</svg>
											View
										</a>
										<DeleteButton
											loading={isDeleting}
											onConfirm={() =>
												void handleDelete(c)
											}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
