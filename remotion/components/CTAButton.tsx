import React from 'react';
import { DISPLAY_FONT_FAMILY } from '../fonts';

interface CTAButtonProps {
	label: string;
	/** Uniform scale applied to the reference (1200px-canvas) sizing. */
	scale?: number;
}

/** The white "Book now" pill, matching the design-system secondary button. */
export const CTAButton: React.FC<CTAButtonProps> = ({ label, scale = 1 }) => {
	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#FFFFFF',
				borderRadius: 8 * scale,
				paddingLeft: 35.467 * scale,
				paddingRight: 35.467 * scale,
				paddingTop: 19.507 * scale,
				paddingBottom: 23.053 * scale,
			}}
		>
			<span
				style={{
					fontFamily: DISPLAY_FONT_FAMILY,
					fontWeight: 500,
					fontSize: 35.47 * scale,
					letterSpacing: 0.8 * scale,
					lineHeight: `${42.56 * scale}px`,
					color: '#444444',
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</span>
		</div>
	);
};
