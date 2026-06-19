'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CampaignPagePreviewCard } from '@/components/campaign-page-preview';

// ── Icons ──────────────────────────────────────────────────────────────────

function PostsIcon() {
	return (
		<svg width='52' height='52' viewBox='0 0 52 52' fill='none'>
			<rect
				x='1'
				y='1'
				width='22'
				height='22'
				rx='3'
				stroke='white'
				strokeWidth='2'
				opacity='0.5'
			/>
			<rect
				x='29'
				y='1'
				width='22'
				height='22'
				rx='3'
				stroke='white'
				strokeWidth='2'
				opacity='0.35'
			/>
			<rect
				x='1'
				y='29'
				width='22'
				height='22'
				rx='3'
				stroke='white'
				strokeWidth='2'
				opacity='0.35'
			/>
			<rect
				x='29'
				y='29'
				width='22'
				height='22'
				rx='3'
				stroke='white'
				strokeWidth='2'
				opacity='0.2'
			/>
			<rect
				x='5'
				y='5'
				width='14'
				height='14'
				rx='1.5'
				fill='white'
				opacity='0.2'
			/>
		</svg>
	);
}

function StoriesIcon() {
	return (
		<svg width='34' height='56' viewBox='0 0 34 56' fill='none'>
			<rect
				x='1'
				y='1'
				width='32'
				height='54'
				rx='6'
				stroke='white'
				strokeWidth='2'
				opacity='0.5'
			/>
			<rect
				x='6'
				y='8'
				width='22'
				height='30'
				rx='2'
				fill='white'
				opacity='0.15'
			/>
			<circle cx='17' cy='46' r='3' fill='white' opacity='0.4' />
			<rect
				x='10'
				y='14'
				width='14'
				height='2'
				rx='1'
				fill='white'
				opacity='0.3'
			/>
			<rect
				x='12'
				y='19'
				width='10'
				height='2'
				rx='1'
				fill='white'
				opacity='0.2'
			/>
		</svg>
	);
}

function AdsIcon() {
	return (
		<svg width='56' height='44' viewBox='0 0 56 44' fill='none'>
			<rect
				x='1'
				y='1'
				width='54'
				height='42'
				rx='5'
				stroke='white'
				strokeWidth='2'
				opacity='0.5'
			/>
			<rect
				x='6'
				y='7'
				width='20'
				height='30'
				rx='2'
				fill='white'
				opacity='0.15'
			/>
			<rect
				x='30'
				y='7'
				width='20'
				height='12'
				rx='2'
				fill='white'
				opacity='0.2'
			/>
			<rect
				x='30'
				y='23'
				width='20'
				height='5'
				rx='1.5'
				fill='white'
				opacity='0.12'
			/>
			<rect
				x='30'
				y='32'
				width='12'
				height='5'
				rx='1.5'
				fill='white'
				opacity='0.12'
			/>
			<path
				d='M8 17l4 4 8-8'
				stroke='white'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				opacity='0.4'
			/>
		</svg>
	);
}

// ── Card config ────────────────────────────────────────────────────────────

interface CardConfig {
	badge: string;
	href: string;
	title: string;
	description: string;
	Icon: () => React.ReactElement;
	bg: string;
}

const CARDS: CardConfig[] = [
	{
		badge: '01',
		href: '/campaign/posts',
		title: 'Campaign Posts',
		description:
			'Carousel & single posts, captioned and ready for social feeds.',
		Icon: PostsIcon,
		bg: 'linear-gradient(135deg, #1a1528 0%, #2d1b4e 100%)',
	},
	{
		badge: '02',
		href: '/campaign/stories',
		title: 'Campaign Stories',
		description: 'Vertical, tappable moments built for Instagram & TikTok.',
		Icon: StoriesIcon,
		bg: 'linear-gradient(135deg, #0d1f2d 0%, #0f2d3a 100%)',
	},
	{
		badge: '03',
		href: '/campaign/ads',
		title: 'Campaign Ads',
		description:
			'One creative, auto-sized for Meta, Google & display networks.',
		Icon: AdsIcon,
		bg: 'linear-gradient(135deg, #1a1500 0%, #2a2010 100%)',
	},
];

// ── Single link card with hover ────────────────────────────────────────────

function LinkCard({ card }: { card: CardConfig }) {
	const [hovered, setHovered] = useState(false);

	return (
		<Link
			href={card.href}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				position: 'relative',
				borderRadius: '24px',
				overflow: 'hidden',
				cursor: 'pointer',
				height: '430px',
				display: 'block',
				textDecoration: 'none',
				background: card.bg,
				transform: hovered ? 'translateY(-2px)' : 'none',
				transition: 'transform 0.15s',
			}}
		>
			{/* Icon */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: hovered ? 0.5 : 0.35,
					transition: 'opacity 0.15s',
				}}
			>
				<card.Icon />
			</div>

			{/* Gradient overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'linear-gradient(to top, rgba(12,8,5,0.92) 0%, rgba(12,8,5,0.55) 34%, rgba(12,8,5,0.05) 60%, rgba(12,8,5,0) 100%)',
				}}
			/>

			{/* Badge */}
			<span
				style={{
					position: 'absolute',
					top: '18px',
					left: '18px',
					zIndex: 2,
					fontSize: '11px',
					fontWeight: 600,
					letterSpacing: '0.6px',
					textTransform: 'uppercase',
					color: '#fff',
					background: 'rgba(255,255,255,0.12)',
					backdropFilter: 'blur(6px)',
					border: '1px solid rgba(255,255,255,0.2)',
					borderRadius: '9999px',
					padding: '5px 12px',
				}}
			>
				{card.badge}
			</span>

			{/* Title + description */}
			<div
				style={{
					position: 'absolute',
					left: '24px',
					right: '24px',
					bottom: '24px',
					zIndex: 2,
				}}
			>
				<p
					style={{
						fontFamily: 'var(--font-hd)',
						fontWeight: 600,
						fontSize: '25px',
						color: '#fff',
						margin: 0,
					}}
				>
					{card.title}
				</p>
				<p
					style={{
						fontSize: '14px',
						fontWeight: 300,
						lineHeight: 1.5,
						color: 'rgba(255,255,255,0.75)',
						marginTop: '6px',
						marginBottom: 0,
					}}
				>
					{card.description}
				</p>
			</div>
		</Link>
	);
}

// ── Component ──────────────────────────────────────────────────────────────

interface CampaignEntryCardsProps {
	prompt?: string;
}

export function CampaignEntryCards({ prompt }: CampaignEntryCardsProps) {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 1fr)',
				gap: '22px',
			}}
		>
			{CARDS.map(card => (
				<LinkCard key={card.href} card={card} />
			))}

			{prompt && <CampaignPagePreviewCard prompt={prompt} />}
		</div>
	);
}
