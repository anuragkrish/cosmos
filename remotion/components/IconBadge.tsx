import React from 'react';
import { Img, staticFile } from 'remotion';

interface IconBadgeProps {
	/** Path to the badge image (full badge including circle + icon). */
	src: string;
	/** Diameter of the badge in pixels. Default: 112. */
	size?: number;
	/** Left position (canvas px). Pass null to center horizontally. */
	left?: number | null;
	/** Top position (canvas px). */
	top: number;
}

/**
 * Circular icon badge used at the top of Guide slides. The src is a full
 * composite image (circle background + icon), matching what Figma exports.
 */
export const IconBadge: React.FC<IconBadgeProps> = ({
	src,
	size = 112,
	left = null,
	top,
}) => {
	const style: React.CSSProperties = {
		position: 'absolute',
		width: size,
		height: size,
		top,
	};

	if (left === null) {
		// Center horizontally in a 1080px canvas
		style.left = (1080 - size) / 2;
	} else {
		style.left = left;
	}

	return (
		<div style={style}>
			<Img src={src} style={{ width: '100%', height: '100%' }} />
		</div>
	);
};

/** Pre-resolved badge src helpers */
export const BADGE = {
	arrow: staticFile('templates/posts/badge-arrow.svg'),
	walk: staticFile('templates/posts/badge-walk.svg'),
	sparkles: staticFile('templates/posts/badge-sparkles.svg'),
	closing: staticFile('templates/posts/badge-closing.svg'),
};
