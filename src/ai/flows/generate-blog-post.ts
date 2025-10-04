
'use server';

/**
 * @fileOverview A flow to generate a blog post about wallpapers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Wallpaper } from '@/lib/types';

const BlogPostInputSchema = z.object({
  topic: z.string().describe('The main topic or title for the blog post.'),
  wallpapers: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    aiHint: z.string(),
  })).describe('A list of wallpapers to be featured in the blog post.'),
});
export type BlogPostInput = z.infer<typeof BlogPostInputSchema>;

const BlogPostOutputSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly title for the blog post.'),
  excerpt: z.string().describe('A short, compelling summary (1-2 sentences) of the blog post to be used as a preview.'),
  content: z.string().describe('The full content of the blog post in Markdown format. It should be engaging, well-structured with headings, lists, and paragraphs. It must naturally incorporate and reference the provided wallpapers.'),
});
export type BlogPostOutput = z.infer<typeof BlogPostOutputSchema>;

export async function generateBlogPost(input: BlogPostInput): Promise<BlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: { schema: BlogPostInputSchema },
  output: { schema: BlogPostOutputSchema },
  prompt: `You are an expert content creator and SEO specialist for a wallpaper website called DreamyDesk. Your task is to write an engaging, high-quality blog post based on a given topic and a selection of wallpapers.

  **Topic:** {{{topic}}}

  **Wallpapers to Feature:**
  You MUST intelligently weave these wallpapers into the blog post. Refer to them naturally within the text.
  {{{json wallpapers}}}

  **Instructions:**
  1.  **Title:** Create a catchy, SEO-friendly title based on the topic.
  2.  **Excerpt:** Write a short, compelling summary (1-2 sentences) for the blog post preview.
  3.  **Content:**
      - Write the full blog post in **Markdown format**.
      - The tone should be engaging, friendly, and inspiring.
      - Structure the content logically with headings (e.g., ##), paragraphs, and bullet points or numbered lists where appropriate.
      - **Crucially, you must embed references to the provided wallpapers within the content.** For each wallpaper you want to include, use the following special Markdown syntax: **\`![{{WALLPAPER_TITLE}}]({{WALLPAPER_ID}})\`**. For example, to include a wallpaper titled "Cosmic Dream" with ID "xyz123", you would write: \`![Cosmic Dream](xyz123)\`.
      - Discuss why each wallpaper fits the theme of the blog post. Use their titles and descriptions as inspiration.
      - The blog post should be substantial enough to be considered valuable content (at least 300-500 words).
      - Conclude with a friendly call to action, encouraging users to check out the wallpapers or browse the site.

  Generate the blog post now based on the provided topic and wallpapers.
  `,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: BlogPostInputSchema,
    outputSchema: BlogPostOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
