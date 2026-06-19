/**
 * StudioHeader — shared header for all three campaign studio routes.
 *
 * Replaces the duplicated inline <header> in AssetStudio.tsx / PostStudio.tsx.
 * Matches the Campaign Studio design (Screen 3):
 *   ← Back  |  [title]          [Download …]
 *
 * Eevee tokens used; no shadows.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

interface StudioHeaderProps {
	/** Studio title, e.g. "Campaign Posts — Asset Studio" */
	title: string;
	/** Right-side download / action button */
	action: ReactNode;
}

export function StudioHeader({ title, action }: StudioHeaderProps) {
	return (
		<header
			className='
        flex items-center justify-between
        px-8 py-4
        border-b border-[var(--color-semantic-dividers-dark)]
        bg-[var(--color-white-a85)]
        backdrop-blur-sm
        sticky top-0 z-10
      '
		>
			{/* Left — back link + title */}
			<div className='flex items-center gap-4'>
				<Link
					href='/'
					className='
            flex items-center gap-1.5
            text-[14px] font-light text-[var(--color-semantic-text-grey-3)]
            hover:text-[var(--color-semantic-surface-dark-black)]
            transition-colors
          '
				>
					← Back
				</Link>
				<span
					className='text-[16px] font-semibold text-[var(--color-semantic-surface-dark-black)]'
					style={{ fontFamily: 'var(--font-hd)' }}
				>
					{title}
				</span>
			</div>

			{/* Right — action slot (Download button etc.) */}
			<div>{action}</div>
		</header>
	);
}
