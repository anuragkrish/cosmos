import { Html, Head, Main, NextScript } from 'next/document';
import { InlineFontFace, PreloadFontLinks } from '@headout/eevee';

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<PreloadFontLinks />
				<InlineFontFace />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
