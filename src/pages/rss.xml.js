import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

// 确保 base 末尾带斜杠,用于拼接 RSS item 的 link
const base = import.meta.env.BASE_URL.endsWith('/')
	? import.meta.env.BASE_URL
	: import.meta.env.BASE_URL + '/';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `${base}blog/${post.id}/`,
		})),
	});
}
