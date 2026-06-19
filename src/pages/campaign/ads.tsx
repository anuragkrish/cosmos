import dynamic from 'next/dynamic';

const AssetStudio = dynamic(
	() =>
		import('@/components/asset-studio/AssetStudio').then(
			m => m.AssetStudio,
		),
	{ ssr: false },
);

export default function CampaignAdsPage() {
	return <AssetStudio />;
}
