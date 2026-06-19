'use client';

import { useId } from 'react';
import type { FieldControl } from '../../../remotion/types';

type Props = Record<string, unknown>;

interface ControlPanelProps {
	fields: FieldControl[];
	values: Props;
	onChange: (key: string, value: unknown) => void;
}

/** Renders a single editable control based on its descriptor. */
function Control({
	field,
	value,
	onChange,
}: {
	field: FieldControl;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const id = useId();
	const label = (
		<label
			htmlFor={id}
			className='text-xs font-medium text-[var(--color-semantic-text-grey-3)]'
		>
			{field.label}
		</label>
	);

	switch (field.type) {
		case 'text':
			return (
				<div className='flex flex-col gap-1.5'>
					{label}
					<input
						id={id}
						type='text'
						value={String(value ?? '')}
						onChange={e => onChange(e.target.value)}
						className='rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-3 py-2 text-sm text-[var(--color-semantic-surface-dark-black)] outline-none focus:border-[var(--color-semantic-text-disabled)]'
					/>
				</div>
			);
		case 'textarea':
			return (
				<div className='flex flex-col gap-1.5'>
					{label}
					<textarea
						id={id}
						rows={2}
						value={String(value ?? '')}
						onChange={e => onChange(e.target.value)}
						className='resize-none rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-3 py-2 text-sm text-[var(--color-semantic-surface-dark-black)] outline-none focus:border-[var(--color-semantic-text-disabled)]'
					/>
				</div>
			);
		case 'number':
			return (
				<div className='flex flex-col gap-1.5'>
					{label}
					<div className='flex items-center gap-3'>
						<input
							id={id}
							type='range'
							min={field.min}
							max={field.max}
							step={field.step}
							value={Number(value ?? 0)}
							onChange={e => onChange(Number(e.target.value))}
							className='flex-1 accent-[var(--color-semantic-surface-dark-black)]'
						/>
						<span className='w-10 text-right text-sm tabular-nums text-[var(--color-semantic-text-grey-3)]'>
							{Number(value ?? 0).toFixed(1)}
						</span>
					</div>
				</div>
			);
		case 'color':
			return (
				<div className='flex flex-col gap-1.5'>
					{label}
					<div className='flex items-center gap-2'>
						<input
							id={id}
							type='color'
							value={String(value ?? '#000000')}
							onChange={e => onChange(e.target.value)}
							className='h-8 w-10 cursor-pointer rounded border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] p-0.5'
						/>
						<input
							type='text'
							value={String(value ?? '')}
							onChange={e => onChange(e.target.value)}
							className='w-24 rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-2 py-1.5 text-xs uppercase text-[var(--color-semantic-text-grey-3)] outline-none focus:border-[var(--color-semantic-text-disabled)]'
						/>
					</div>
				</div>
			);
		case 'boolean':
			return (
				<label className='flex cursor-pointer items-center justify-between gap-3'>
					<span className='text-xs font-medium text-[var(--color-semantic-text-grey-3)]'>
						{field.label}
					</span>
					<input
						type='checkbox'
						checked={Boolean(value)}
						onChange={e => onChange(e.target.checked)}
						className='h-4 w-4 accent-[var(--color-semantic-surface-dark-black)]'
					/>
				</label>
			);
		case 'image': {
			const strVal = String(value ?? '');
			const isDataUrl = strVal.startsWith('data:');
			return (
				<div className='flex flex-col gap-1.5'>
					{label}
					{isDataUrl ? (
						<div className='flex items-center gap-2 rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-2)] px-3 py-2'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={strVal}
								alt=''
								className='h-8 w-8 shrink-0 rounded object-cover'
							/>
							<span className='min-w-0 flex-1 truncate text-xs text-[var(--color-semantic-text-grey-3)]'>
								Custom image
							</span>
							<button
								type='button'
								onClick={() => onChange('')}
								className='text-[11px] text-[var(--color-semantic-text-disabled)] hover:text-[var(--color-semantic-surface-dark-black)]'
							>
								✕
							</button>
						</div>
					) : (
						<input
							id={id}
							type='text'
							placeholder='Image URL'
							value={strVal}
							onChange={e => onChange(e.target.value)}
							className='rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-3 py-2 text-sm text-[var(--color-semantic-surface-dark-black)] outline-none focus:border-[var(--color-semantic-text-disabled)]'
						/>
					)}
					<label className='cursor-pointer text-xs text-[var(--color-semantic-text-disabled)] hover:text-[var(--color-semantic-surface-dark-black)]'>
						{isDataUrl
							? 'Replace with another file'
							: 'or upload a file'}
						<input
							type='file'
							accept='image/*'
							className='hidden'
							onChange={e => {
								const file = e.target.files?.[0];
								if (!file) return;
								const reader = new FileReader();
								reader.onload = () => {
									onChange(reader.result as string);
									e.target.value = '';
								};
								reader.readAsDataURL(file);
							}}
						/>
					</label>
				</div>
			);
		}
		case 'list': {
			const items = Array.isArray(value)
				? (value as Record<string, unknown>[])
				: [];

			const makeDefaultItem = (): Record<string, unknown> => {
				const item: Record<string, unknown> = {};
				for (const f of field.itemFields) {
					if (f.type === 'boolean') item[f.key] = false;
					else if (f.type === 'number') item[f.key] = 0;
					else item[f.key] = '';
				}
				return item;
			};

			return (
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-medium text-[var(--color-semantic-text-grey-3)]'>
							{field.label}
						</span>
						<button
							type='button'
							onClick={() =>
								onChange([...items, makeDefaultItem()])
							}
							className='rounded border border-[var(--color-semantic-dividers-dark)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-semantic-text-disabled)] hover:border-[var(--color-semantic-text-disabled)] hover:text-[var(--color-semantic-surface-dark-black)]'
						>
							+ {field.itemLabel ?? 'item'}
						</button>
					</div>
					{items.map((item, idx) => (
						<div
							key={idx}
							className='rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-2)] p-3'
						>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-[11px] font-semibold text-[var(--color-semantic-text-disabled)]'>
									{field.itemLabel ?? 'Item'} {idx + 1}
								</span>
								<button
									type='button'
									onClick={() =>
										onChange(
											items.filter((_, i) => i !== idx),
										)
									}
									className='text-[11px] text-red-400 hover:text-red-600'
								>
									Remove
								</button>
							</div>
							<div className='flex flex-col gap-2'>
								{field.itemFields.map(subField => (
									<Control
										key={subField.key}
										field={subField}
										value={item[subField.key]}
										onChange={v => {
											const next = items.map((it, i) =>
												i === idx
													? {
															...it,
															[subField.key]: v,
														}
													: it,
											);
											onChange(next);
										}}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			);
		}
		default:
			return null;
	}
}

/** A grouped, data-driven panel of every editable field for a template. */
export function ControlPanel({ fields, values, onChange }: ControlPanelProps) {
	const groups = fields.reduce<Record<string, FieldControl[]>>(
		(acc, field) => {
			const group = field.group ?? 'General';
			(acc[group] ??= []).push(field);
			return acc;
		},
		{},
	);

	return (
		<div className='flex flex-col gap-6'>
			{Object.entries(groups).map(([group, groupFields]) => (
				<div key={group} className='flex flex-col gap-3'>
					<h3 className='text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--color-semantic-text-disabled)]'>
						{group}
					</h3>
					{groupFields.map(field => (
						<Control
							key={field.key}
							field={field}
							value={values[field.key]}
							onChange={v => onChange(field.key, v)}
						/>
					))}
				</div>
			))}
		</div>
	);
}
