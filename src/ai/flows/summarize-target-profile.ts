'use server';
/**
 * @fileOverview Target profile summarization flow.
 *
 * - summarizeTargetProfile - A function that summarizes the aggregated target data.
 * - SummarizeTargetProfileInput - The input type for the summarizeTargetProfile function.
 * - SummarizeTargetProfileOutput - The return type for the summarizeTargetProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTargetProfileInputSchema = z.object({
  aggregatedData: z
    .string()
    .describe('The aggregated data collected about the target.'),
});
export type SummarizeTargetProfileInput = z.infer<typeof SummarizeTargetProfileInputSchema>;

const SummarizeTargetProfileOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the target profile.'),
});
export type SummarizeTargetProfileOutput = z.infer<typeof SummarizeTargetProfileOutputSchema>;

export async function summarizeTargetProfile(input: SummarizeTargetProfileInput): Promise<SummarizeTargetProfileOutput> {
  return summarizeTargetProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTargetProfilePrompt',
  input: {schema: SummarizeTargetProfileInputSchema},
  output: {schema: SummarizeTargetProfileOutputSchema},
  prompt: `You are an expert OSINT analyst. Please summarize the following aggregated data to create a comprehensive profile of the target:\n\nData: {{{aggregatedData}}}`,
});

const summarizeTargetProfileFlow = ai.defineFlow(
  {
    name: 'summarizeTargetProfileFlow',
    inputSchema: SummarizeTargetProfileInputSchema,
    outputSchema: SummarizeTargetProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
