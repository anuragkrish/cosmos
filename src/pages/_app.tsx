import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Newsreader } from 'next/font/google';
import { Agentation } from 'agentation';

const newsreader = Newsreader({
	variable: '--font-newsreader',
	subsets: ['latin'],
	style: ['normal', 'italic'],
	weight: ['400', '500'],
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<div
				className={newsreader.variable}
				style={{ display: 'contents' }}
			>
				<Component {...pageProps} />
				{process.env.NODE_ENV === 'development' && <Agentation />}
			</div>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
