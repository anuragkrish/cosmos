/**
 * AppHeader — shared navigation bar across the Chat and Results screens.
 *
 * Matches the Campaign Studio design:
 * - Chat screen:   "Headout" + "COSMOS" pill  +  "New campaign" black pill CTA
 * - Results screen: "Headout" + "Campaign Studio" pill  +  "＋ New brief" text link
 *
 * Eevee tokens used for all styling (no shadows — left as design default).
 */

import type { ReactNode } from 'react';

interface AppHeaderProps {
	/** Pill label next to the wordmark */
	label?: string;
	/** Slot for the right-side action — passed as JSX from the parent screen */
	action?: ReactNode;
	/** Makes the header sticky (Results screen) vs. relative (Chat screen) */
	sticky?: boolean;
}

export function AppHeader({
	label = 'COSMOS',
	action,
	sticky = false,
}: AppHeaderProps) {
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
				<span className='text-[15px] font-semibold text-[var(--color-semantic-text-grey-1)]'>
					Headout
				</span>
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

			{/* Right — action slot */}
			{action && <div>{action}</div>}
		</header>
	);
}
