import dynamic from 'next/dynamic';

const PostStudio = dynamic(
	() =>
		import('@/components/asset-studio/PostStudio').then(m => m.PostStudio),
	{ ssr: false },
);

export default function CampaignPostsPage() {
	return <PostStudio />;
}
