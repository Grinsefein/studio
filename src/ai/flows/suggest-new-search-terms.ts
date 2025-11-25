// src/ai/flows/suggest-new-search-terms.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting new search terms based on existing OSINT data.
 *
 * It exports:
 * - `suggestNewSearchTerms`: An async function that takes OSINT data and returns suggested search terms.
 * - `SuggestNewSearchTermsInput`: The input type for the `suggestNewSearchTerms` function.
 * - `SuggestNewSearchTermsOutput`: The output type for the `suggestNewSearchTerms` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewSearchTermsInputSchema = z.object({
  existingData: z
    .string()
    .describe(
      'The existing OSINT data to analyze for suggesting new search terms.'
    ),
});
export type SuggestNewSearchTermsInput = z.infer<
  typeof SuggestNewSearchTermsInputSchema
>;

const SuggestNewSearchTermsOutputSchema = z.object({
  suggestedSearchTerms: z
    .array(z.string())
    .describe('An array of suggested search terms.'),
});
export type SuggestNewSearchTermsOutput = z.infer<
  typeof SuggestNewSearchTermsOutputSchema
>;

export async function suggestNewSearchTerms(
  input: SuggestNewSearchTermsInput
): Promise<SuggestNewSearchTermsOutput> {
  return suggestNewSearchTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewSearchTermsPrompt',
  input: {schema: SuggestNewSearchTermsInputSchema},
  output: {schema: SuggestNewSearchTermsOutputSchema},
  prompt: `You are an expert OSINT (Open Source Intelligence) analyst. Your task is to analyze the provided existing OSINT data and suggest new search terms that can broaden the investigation.

Existing Data:
{{existingData}}

Based on this data, suggest 5 new search terms that could uncover additional relevant information. Consider related names, locations, organizations, activities, or any other relevant keywords. Return the terms as a JSON array.

Output the search terms as JSON array:
`,
});

const suggestNewSearchTermsFlow = ai.defineFlow(
  {
    name: 'suggestNewSearchTermsFlow',
    inputSchema: SuggestNewSearchTermsInputSchema,
    outputSchema: SuggestNewSearchTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
