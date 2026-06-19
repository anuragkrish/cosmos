import React from 'react';
import { Composition } from 'remotion';
import { TEMPLATES } from './registry';
import { ensureFonts } from './fonts';

/**
 * Registers one still composition per template. Fonts are awaited in
 * calculateMetadata so both the Studio/Player preview and the server-side
 * Still render have Halyard Display + Lexend Deca ready before the first frame.
 */
export const RemotionRoot: React.FC = () => {
	return (
		<>
			{TEMPLATES.map(template => (
				<Composition
					key={template.id}
					id={template.id}
					component={template.component as React.FC}
					durationInFrames={1}
					fps={30}
					width={template.width}
					height={template.height}
					defaultProps={template.defaultProps}
					calculateMetadata={async () => {
						await ensureFonts();
						return {};
					}}
				/>
			))}
		</>
	);
};
