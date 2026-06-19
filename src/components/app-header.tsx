'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AppHeaderProps {
	label?: string;
	action?: ReactNode;
	sticky?: boolean;
}

const NAV_LINKS = [
	{ href: '/', label: 'New Campaign' },
	{ href: '/previous-campaigns', label: 'Previous Campaigns' },
];

export function AppHeader({
	label = 'COSMOS',
	action,
	sticky = false,
}: AppHeaderProps) {
	const router = useRouter();

	return (
		<header
			className={`
        flex items-center justify-between
        px-8 py-4
        border-b border-[var(--color-semantic-dividers-dark)]
        bg-[var(--color-semantic-surface-light-white)]
        z-10
        ${sticky ? 'sticky top-0' : 'relative'}
      `}
		>
			{/* Left — wordmark + pill */}
			<div className='flex items-center gap-3'>
				<img
					src='https://cdn-imgix-open.headout.com/logo/svg/Headout_purps.svg?w=229.5&h=36&fm=svg&crop=faces&auto=compress%2Cformat&fit=min'
					alt='Headout'
					style={{ height: '22px', width: 'auto' }}
				/>
				<span
					className='
            text-[12px] font-medium text-[var(--color-semantic-text-grey-1)]
            border border-[var(--color-semantic-dividers-dark)]
            rounded-[var(--radius-full)]
            px-3 py-[6px] pt-[5px]
            bg-[var(--color-semantic-surface-light-white)]
            leading-none
            tracking-[0.4px] uppercase
          '
					style={{ borderWidth: '0.625px' }}
				>
					{label}
				</span>
			</div>

			{/* Center — nav links */}
			<nav className='flex items-center gap-1'>
				{NAV_LINKS.map(link => {
					const isActive = router.pathname === link.href;
					return (
						<Link
							key={link.href}
							href={link.href}
							style={{
								fontSize: '13px',
								fontWeight: isActive ? 500 : 400,
								color: isActive
									? 'var(--color-semantic-text-grey-1)'
									: 'var(--color-semantic-text-grey-3)',
								padding: '6px 12px',
								borderRadius: 'var(--radius-full)',
								textDecoration: 'none',
								background: isActive
									? 'var(--color-semantic-surface-light-grey-2)'
									: 'transparent',
								transition: 'background 0.12s, color 0.12s',
							}}
							onMouseEnter={e => {
								if (!isActive)
									(
										e.currentTarget as HTMLElement
									).style.background =
										'var(--color-semantic-surface-light-grey-1)';
							}}
							onMouseLeave={e => {
								if (!isActive)
									(
										e.currentTarget as HTMLElement
									).style.background = 'transparent';
							}}
						>
							{link.label}
						</Link>
					);
				})}
			</nav>

			{/* Right — action slot */}
			{action && <div>{action}</div>}
		</header>
	);
}
