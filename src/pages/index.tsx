import { Button, Text } from '@headout/eevee';
import Head from 'next/head';
import { css } from '@headout/pixie/css';
import { useBoundStore } from '@/stores/store';

export default function Home() {
	const { count, incrementCount, decrementCount } = useBoundStore(
		state => state,
	);

	const containerStyles = css({
		minHeight: '[100vh]',
		padding: 'space.8',
		backgroundColor: 'colors.semantic.background.default',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 'space.8',
	});

	const headerStyles = css({
		textAlign: 'center',
		display: 'flex',
		flexDirection: 'column',
		gap: 'space.4',
	});

	return (
		<>
			<Head>
				<title>AI Template with Addition Calculator</title>
				<meta
					name='description'
					content='Next.js application with addition calculator using Headout Design System'
				/>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className={containerStyles}>
				<div className={headerStyles}>
					<Text
						textStyle={'display.extraLarge'}
						color='semantic.text.primary'
					>
						Welcome to AI Template!
					</Text>
					<Text
						textStyle={'display.medium'}
						color='semantic.text.secondary'
					>
						{"This uses Next.js and Headout's Eevee design system."}
					</Text>
				</div>
				<Text textStyle={'heading.medium'}>Count: {count}</Text>
				<hr />
				<Button
					as='button'
					primaryText='Increment Count'
					onClick={incrementCount}
				/>
				<Button
					as='button'
					primaryText='Decrement Count'
					onClick={decrementCount}
				/>
			</div>
		</>
	);
}
