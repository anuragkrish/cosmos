import type { z } from 'zod';
import type React from 'react';

/**
 * A single editable field in a template. The editor panel is generated
 * entirely from these descriptors, so adding a control to a template never
 * requires touching the UI — only the template's field list.
 */
export type FieldControl =
	| { key: string; label: string; type: 'text'; group?: string }
	| { key: string; label: string; type: 'textarea'; group?: string }
	| { key: string; label: string; type: 'color'; group?: string }
	| { key: string; label: string; type: 'image'; group?: string }
	| { key: string; label: string; type: 'boolean'; group?: string }
	| {
			key: string;
			label: string;
			type: 'number';
			min?: number;
			max?: number;
			step?: number;
			group?: string;
	  }
	| {
			key: string;
			label: string;
			type: 'list';
			/** Fields for each item in the list. */
			itemFields: FieldControl[];
			/** Label shown on each collapsed row (e.g. "Item"). */
			itemLabel?: string;
			group?: string;
	  };

/**
 * A renderable asset template. Everything the preview, the editor and the
 * Still-render endpoint need is described here, so a new asset type is added
 * by appending one entry to the registry.
 */
export interface TemplateDefinition<Props extends Record<string, unknown>> {
	/** Stable id — also the Remotion composition id. */
	id: string;
	/** Human label shown in the UI. */
	name: string;
	/** Short format descriptor, e.g. "Story · 1080×1920". */
	formatLabel: string;
	width: number;
	height: number;
	/** The Remotion component rendering this template. */
	component: React.FC<Props>;
	/** Zod schema validating the template's props. */
	schema: z.ZodType<Props>;
	/** Default/sample values. */
	defaultProps: Props;
	/** Editor controls, in display order. */
	fields: FieldControl[];
}
