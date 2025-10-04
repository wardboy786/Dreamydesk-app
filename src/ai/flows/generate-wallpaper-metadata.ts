
'use server';

/**
 * @fileOverview A flow to generate metadata for uploaded wallpapers using generative AI.
 *
 * - generateWallpaperMetadata - A function that suggests a title, description, tags, and category for an image.
 * - GenerateWallpaperMetadataInput - The input type for the generateWallpaperMetadata function.
 * - GenerateWallpaperMetadataOutput - The return type for the generateWallpaperMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWallpaperMetadataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a wallpaper, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  existingCategories: z.array(z.string()).describe('A list of existing categories to choose from.'),
});
export type GenerateWallpaperMetadataInput = z.infer<typeof GenerateWallpaperMetadataInputSchema>;

const GenerateWallpaperMetadataOutputSchema = z.object({
  title: z.string().describe('A simple, highly accurate, SEO-friendly title that a user would search for (e.g., "4K Lord Shiva Wallpaper").'),
  description: z.string().describe('A short, SEO-friendly description for the wallpaper, including relevant keywords (e.g., "A beautiful 4K wallpaper of Lord Shiva, perfect for expressing divine spirituality on your desktop.").'),
  tags: z.array(z.string()).describe("An array of 5-10 simple, accurate, and popular search terms a user might search for (e.g., 'mahadev', 'shiv', 'shiva', 'hindu god', 'spiritual')."),
  category: z.string().describe('The most relevant category for the wallpaper from the provided list.'),
});
export type GenerateWallpaperMetadataOutput = z.infer<typeof GenerateWallpaperMetadataOutputSchema>;

export async function generateWallpaperMetadata(input: GenerateWallpaperMetadataInput): Promise<GenerateWallpaperMetadataOutput> {
  return generateWallpaperMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWallpaperMetadataPrompt',
  input: {schema: GenerateWallpaperMetadataInputSchema},
  output: {schema: GenerateWallpaperMetadataOutputSchema},
  prompt: `You are an SEO expert for a wallpaper website. Your primary goal is to generate simple, searchable, and highly accurate metadata that matches what a regular user would search for on Google.

  **Crucial Rule:** Your top priority is to use simple, direct, and popular search terms. While you should still avoid obvious copyrighted brands (like Nike), it is okay to use names of well-known figures, characters, or concepts if they are central to the wallpaper (e.g., "Lord Shiva", "Goku", "Eiffel Tower").

  Follow these rules:
  - **Title:** Create a simple and highly accurate title that a user would search for. Include common prefixes like "4K" if the resolution is high. For example, for an image of Lord Shiva, a good title is "4K Lord Shiva Wallpaper".
  - **Description:** Write a 1-2 sentence, SEO-friendly description. Naturally include keywords related to the image's subject, style, and mood. For example: "A beautiful 4K wallpaper of Lord Shiva, perfect for expressing divine spirituality on your desktop."
  - **Tags:** Provide 5-10 simple and accurate search terms. Think about what a user would type into Google. Include synonyms and related concepts. For example, for an image of Mahadev (Shiva), good tags would be: 'mahadev', 'shiv', 'shiva', 'mahakal', 'hindu god', 'god', 'spiritual'.
  - **Category:** Choose the single most fitting category from this list: {{{json existingCategories}}}

  Analyze the following wallpaper and generate SEO-optimized metadata that will help it rank well in search results.
  {{media url=photoDataUri}}
  `,
});

const generateWallpaperMetadataFlow = ai.defineFlow(
  {
    name: 'generateWallpaperMetadataFlow',
    inputSchema: GenerateWallpaperMetadataInputSchema,
    outputSchema: GenerateWallpaperMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
