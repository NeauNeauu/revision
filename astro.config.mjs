import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGlossary from './src/lib/remark-glossary.mjs';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  integrations: [mdx()],
  markdown: { processor: unified({ remarkPlugins: [remarkMath, remarkGlossary], rehypePlugins: [rehypeKatex] }) },
});
