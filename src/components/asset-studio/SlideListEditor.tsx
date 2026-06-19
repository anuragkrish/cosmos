'use client';

import { useState } from 'react';
import type { SlideTypeConfig } from '../../../remotion/manifest';

interface SlideListEditorProps {
	slides: Record<string, unknown>[];
	activeIndex: number;
	slideTypes: SlideTypeConfig[];
	onSelect: (index: number) => void;
	onChange: (slides: Record<string, unknown>[]) => void;
}

function GripIcon({ className }: { className?: string }) {
	return (
		<svg
			width='10'
			height='14'
			viewBox='0 0 10 14'
			fill='currentColor'
			className={className}
		>
			<circle cx='2' cy='2' r='1.2' />
			<circle cx='8' cy='2' r='1.2' />
			<circle cx='2' cy='7' r='1.2' />
			<circle cx='8' cy='7' r='1.2' />
			<circle cx='2' cy='12' r='1.2' />
			<circle cx='8' cy='12' r='1.2' />
		</svg>
	);
}

export function SlideListEditor({
	slides,
	activeIndex,
	slideTypes,
	onSelect,
	onChange,
}: SlideListEditorProps) {
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [overIndex, setOverIndex] = useState<number | null>(null);

	const moveSlide = (from: number, to: number) => {
		if (to < 0 || to >= slides.length) return;
		const next = [...slides];
		const [removed] = next.splice(from, 1);
		next.splice(to, 0, removed);
		onChange(next);
		if (from === activeIndex) onSelect(to);
		else if (from < activeIndex && to >= activeIndex)
			onSelect(activeIndex - 1);
		else if (from > activeIndex && to <= activeIndex)
			onSelect(activeIndex + 1);
	};

	const removeSlide = (index: number) => {
		const next = slides.filter((_, i) => i !== index);
		onChange(next);
		if (index <= activeIndex) onSelect(Math.max(0, activeIndex - 1));
	};

	const addSlide = (type: string) => {
		const config = slideTypes.find(st => st.type === type);
		if (!config) return;
		const next = [
			...slides,
			config.makeDefault() as Record<string, unknown>,
		];
		onChange(next);
		onSelect(next.length - 1);
	};

	const typeName = (slide: Record<string, unknown>) => {
		const t = slide.type as string;
		return slideTypes.find(st => st.type === t)?.name ?? t;
	};

	const handleDragStart = (e: React.DragEvent, idx: number) => {
		setDragIndex(idx);
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragEnter = (idx: number) => {
		setOverIndex(idx);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDrop = (e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (dragIndex !== null && dragIndex !== idx) {
			moveSlide(dragIndex, idx);
		}
		setDragIndex(null);
		setOverIndex(null);
	};

	const handleDragEnd = () => {
		setDragIndex(null);
		setOverIndex(null);
	};

	return (
		<div className='flex flex-col gap-2'>
			{slides.map((slide, idx) => {
				const isActive = idx === activeIndex;
				const isDragging = idx === dragIndex;
				const isOver =
					idx === overIndex &&
					dragIndex !== null &&
					dragIndex !== idx;
				return (
					<div
						key={idx}
						draggable
						onDragStart={e => handleDragStart(e, idx)}
						onDragEnter={() => handleDragEnter(idx)}
						onDragOver={handleDragOver}
						onDrop={e => handleDrop(e, idx)}
						onDragEnd={handleDragEnd}
						role='button'
						tabIndex={0}
						onClick={() => onSelect(idx)}
						onKeyDown={e => e.key === 'Enter' && onSelect(idx)}
						className={`flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
							isDragging
								? 'opacity-40'
								: isOver
									? 'border-[var(--color-semantic-surface-dark-black)] bg-[var(--color-semantic-surface-light-grey-2)]'
									: isActive
										? 'border-[var(--color-semantic-surface-dark-black)] bg-[var(--color-semantic-surface-dark-black)] text-[var(--color-semantic-surface-light-white)]'
										: 'border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] text-[var(--color-semantic-text-grey-3)] hover:border-[var(--color-semantic-text-disabled)]'
						}`}
					>
						<span className='cursor-grab active:cursor-grabbing shrink-0 text-[var(--color-semantic-icon-grey-disabled-2)]'>
							<GripIcon />
						</span>
						<span className='w-5 shrink-0 text-[11px] font-bold tabular-nums text-[var(--color-semantic-icon-grey-disabled-2)]'>
							{String(idx + 1).padStart(2, '0')}
						</span>
						<span className='flex-1 truncate text-xs'>
							{typeName(slide)}
						</span>
						<button
							type='button'
							aria-label='Remove slide'
							disabled={slides.length <= 1}
							onClick={e => {
								e.stopPropagation();
								removeSlide(idx);
							}}
							className={`rounded p-0.5 text-[10px] disabled:opacity-30 text-[var(--color-semantic-text-disabled)] hover:text-red-500 ${isActive ? 'hover:bg-[var(--color-semantic-text-grey-2)]' : 'hover:bg-red-50'}`}
						>
							✕
						</button>
					</div>
				);
			})}

			{/* Add slide buttons */}
			<div className='mt-1 flex flex-wrap gap-1.5'>
				{slideTypes.map(st => (
					<button
						key={st.type}
						type='button'
						onClick={() => addSlide(st.type)}
						className='rounded border border-dashed border-[var(--color-semantic-dividers-dark)] px-2.5 py-1 text-[11px] text-[var(--color-semantic-text-disabled)] hover:border-[var(--color-semantic-text-disabled)] hover:text-[var(--color-semantic-text-grey-3)]'
					>
						+ {st.name}
					</button>
				))}
			</div>
		</div>
	);
}
