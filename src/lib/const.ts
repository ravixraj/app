import type { MetaTagsProps } from 'svelte-meta-tags';

export const SITE_URL = 'https://freebieapi.vercel.app';
export const SITE_NAME = 'FreeAPI';
export const SITE_DESCRIPTION =
	'A full-featured client application for FreeAPI with authentication, todo management, social media, and e-commerce capabilities.';

export const defaultOgImage = '/og-image.png';

export function createBaseMetaTags(): MetaTagsProps {
	return {
		title: SITE_NAME,
		titleTemplate: `%s | ${SITE_NAME}`,
		description: SITE_DESCRIPTION,
		canonical: SITE_URL,
		openGraph: {
			type: 'website',
			locale: 'en_US',
			url: SITE_URL,
			siteName: SITE_NAME,
			images: [
				{
					url: `${SITE_URL}${defaultOgImage}`,
					width: 1200,
					height: 630,
					alt: SITE_NAME
				}
			]
		},
		twitter: {
			creator: '@eravitw',
			site: SITE_URL,
			cardType: 'summary_large_image' as const
		}
	};
}

export function createPageMetaTags(config: {
	title: string;
	description?: string;
	canonical?: string;
	ogImage?: string;
}): MetaTagsProps {
	return {
		title: config.title,
		description: config.description ?? SITE_DESCRIPTION,
		canonical: config.canonical ? `${SITE_URL}${config.canonical}` : undefined,
		openGraph: {
			type: 'website',
			locale: 'en_US',
			url: SITE_URL,
			siteName: SITE_NAME,
			title: config.title,
			description: config.description,
			images: config.ogImage
				? [
						{
							url: config.ogImage,
							width: 1200,
							height: 630,
							alt: config.title
						}
					]
				: undefined
		}
	};
}
