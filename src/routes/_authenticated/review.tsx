import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/review')({
  staticData: { sitemap: false },
  beforeLoad: () => { throw redirect({ to: '/verify', replace: true }); },
  head: () => ({ meta: [{ title: 'Identity checks moved to Didit — KamiMatch' }, { name: 'description', content: 'KamiMatch identity verification is handled exclusively by Didit.' }, { property: 'og:title', content: 'Identity checks moved to Didit — KamiMatch' }, { property: 'og:description', content: 'Continue your private adult identity check with Didit.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'robots', content: 'noindex' }] }),
});
