import dynamic from 'next/dynamic';

const StoriesStudio = dynamic(
	() =>
		import('@/components/asset-studio/StoriesStudio').then(
			m => m.StoriesStudio,
		),
	{ ssr: false },
);

export default function CampaignStoriesPage() {
	return <StoriesStudio />;
}
