import React from 'react';
import { Img, staticFile } from 'remotion';
import { WORDMARK_FONT_FAMILY } from '../fonts';

interface BrandLockupProps {
	line1: string;
	line2: string;
	color: string;
	showByHeadout: boolean;
	parisSize: number;
	ticketsSize: number;
	ticketsTracking: number;
	lineHeight: number;
	logoHeight: number;
	gap: number;
}

const BY_HEADOUT_ASPECT = 168.496 / 64.9956;

/**
 * The "PARIS / TICKETS" wordmark, optionally paired with the "by headout"
 * lockup separated by its built-in divider rule.
 */
export const BrandLockup: React.FC<BrandLockupProps> = ({
	line1,
	line2,
	color,
	showByHeadout,
	parisSize,
	ticketsSize,
	ticketsTracking,
	lineHeight,
	logoHeight,
	gap,
}) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap }}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
					color,
					lineHeight: `${lineHeight}px`,
					fontFamily: WORDMARK_FONT_FAMILY,
				}}
			>
				<span style={{ fontWeight: 700, fontSize: parisSize }}>
					{line1}
				</span>
				<span
					style={{
						fontWeight: 400,
						fontSize: ticketsSize,
						letterSpacing: ticketsTracking,
					}}
				>
					{line2}
				</span>
			</div>
			{showByHeadout ? (
				<Img
					src={staticFile('templates/by-headout.svg')}
					style={{
						height: logoHeight,
						width: logoHeight * BY_HEADOUT_ASPECT,
					}}
				/>
			) : null}
		</div>
	);
};
