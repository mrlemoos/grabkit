/** Shared SEO constants and Starlight `head` entries for grabkit.dev. */

export const SITE_URL = 'https://grabkit.dev';

export const SITE_DESCRIPTION =
	'TypeScript HTTP client for explicit METHOD /path calls. JSON:API by default; plain JSON with format: "json". Tuple results and optional key casing.';

export const OG_IMAGE_URL = `${SITE_URL}/og.png`;

export const OG_IMAGE_ALT = 'Grabkit: TypeScript HTTP client documentation';

const softwareApplication = {
	'@context': 'https://schema.org',
	'@type': 'SoftwareApplication',
	name: 'grabkit',
	applicationCategory: 'DeveloperApplication',
	operatingSystem: 'Any',
	description: SITE_DESCRIPTION,
	url: SITE_URL,
	downloadUrl: 'https://www.npmjs.com/package/grabkit',
	license: 'https://www.apache.org/licenses/LICENSE-2.0',
	programmingLanguage: 'TypeScript',
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'USD',
	},
};

const webSite = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'Grabkit',
	url: SITE_URL,
	description: SITE_DESCRIPTION,
	inLanguage: 'en-GB',
};

/** Global `<head>` tags merged on every page (page frontmatter can override matching tags). */
export const globalSeoHead = [
	{
		tag: 'meta' as const,
		attrs: {
			property: 'og:image',
			content: OG_IMAGE_URL,
		},
	},
	{
		tag: 'meta' as const,
		attrs: {
			property: 'og:image:alt',
			content: OG_IMAGE_ALT,
		},
	},
	{
		tag: 'meta' as const,
		attrs: {
			property: 'og:image:width',
			content: '1200',
		},
	},
	{
		tag: 'meta' as const,
		attrs: {
			property: 'og:image:height',
			content: '630',
		},
	},
	{
		tag: 'meta' as const,
		attrs: {
			name: 'twitter:image',
			content: OG_IMAGE_URL,
		},
	},
	{
		tag: 'meta' as const,
		attrs: {
			name: 'twitter:image:alt',
			content: OG_IMAGE_ALT,
		},
	},
	{
		tag: 'script' as const,
		attrs: { type: 'application/ld+json' },
		content: JSON.stringify(softwareApplication),
	},
	{
		tag: 'script' as const,
		attrs: { type: 'application/ld+json' },
		content: JSON.stringify(webSite),
	},
	{
		tag: 'script' as const,
		attrs: {
			defer: true,
			src: 'https://cloud.umami.is/script.js',
			'data-website-id': '989481bc-3a85-4fd9-bb86-a22c158b7124',
		},
	},
];
