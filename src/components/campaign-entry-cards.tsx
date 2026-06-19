import Link from 'next/link';
import { CampaignPagePreviewCard } from '@/components/campaign-page-preview';

const CARDS = [
	{
		badge: '01',
		href: '/campaign/posts',
		image: '/campaign/card-posts.png',
		title: 'Campaign Posts',
		description:
			'Carousel & single posts, captioned and ready for social feeds.',
	},
	{
		badge: '02',
		href: '/campaign/stories',
		image: '/campaign/card-stories.png',
		title: 'Campaign Stories',
		description: 'Vertical, tappable moments built for Instagram & TikTok.',
	},
	{
		badge: '03',
		href: '/campaign/ads',
		image: '/campaign/card-ads.png',
		title: 'Campaign Ads',
		description:
			'One creative, auto-sized for Meta, Google & display networks.',
	},
];

interface CampaignEntryCardsProps {
	prompt?: string;
}

export function CampaignEntryCards({ prompt }: CampaignEntryCardsProps) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: '22px',
				}}
			>
				{CARDS.map(card => (
					<Link
						key={card.href}
						href={card.href}
						style={{
							position: 'relative',
							borderRadius: '24px',
							overflow: 'hidden',
							cursor: 'pointer',
							height: '430px',
							display: 'block',
							textDecoration: 'none',
						}}
					>
						{/* Background image */}
						<div
							aria-hidden
							style={{
								position: 'absolute',
								inset: 0,
								backgroundImage: `url(${card.image})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
							}}
						/>

						{/* Gradient overlay */}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background:
									'linear-gradient(to top, rgba(12,8,5,0.92) 0%, rgba(12,8,5,0.55) 34%, rgba(12,8,5,0.05) 60%, rgba(12,8,5,0) 100%)',
							}}
						/>

						{/* Number badge */}
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
								background: 'var(--color-white-a16)',
								backdropFilter: 'blur(6px)',
								border: '1px solid var(--color-white-a20)',
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
									color: 'var(--color-white-a85)',
									marginTop: '6px',
									marginBottom: 0,
								}}
							>
								{card.description}
							</p>
						</div>
					</Link>
				))}
			</div>

			{prompt && <CampaignPagePreviewCard prompt={prompt} />}
		</div>
	);
}
