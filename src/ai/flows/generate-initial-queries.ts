'use server';

/**
 * @fileOverview A flow to generate initial search queries based on a target subject.
 *
 * - generateInitialQueries - A function that generates initial search queries.
 * - GenerateInitialQueriesInput - The input type for the generateInitialQueries function.
 * - GenerateInitialQueriesOutput - The return type for the generateInitialQueries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialQueriesInputSchema = z.object({
  subject: z.string().describe('The target subject for generating search queries.'),
});
export type GenerateInitialQueriesInput = z.infer<
  typeof GenerateInitialQueriesInputSchema
>;

const GenerateInitialQueriesOutputSchema = z.object({
  queries: z
    .array(z.string())
    .describe('An array of initial search queries related to the subject.'),
});
export type GenerateInitialQueriesOutput = z.infer<
  typeof GenerateInitialQueriesOutputSchema
>;

export async function generateInitialQueries(
  input: GenerateInitialQueriesInput
): Promise<GenerateInitialQueriesOutput> {
  return generateInitialQueriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialQueriesPrompt',
  input: {schema: GenerateInitialQueriesInputSchema},
  output: {schema: GenerateInitialQueriesOutputSchema},
  prompt: `You are an expert OSINT (Open Source Intelligence) analyst.
  Your task is to generate a list of initial search queries based on the provided subject.
  These queries will be used to gather information from various open sources.

  Subject: {{{subject}}}

  Instructions:
  1.  Generate diverse search queries to uncover a wide range of information related to the subject.
  2.  Consider different aspects of the subject, such as personal details, professional background, interests, and potential online presence.
  3.  Include queries that could reveal social media accounts, public records, news articles, and other relevant online content.
  4.  Focus on generating specific and actionable search queries rather than broad or generic terms.
  
  Now, generate the initial search queries for the subject and return them as a JSON array of strings.`,
});

const generateInitialQueriesFlow = ai.defineFlow(
  {
    name: 'generateInitialQueriesFlow',
    inputSchema: GenerateInitialQueriesInputSchema,
    outputSchema: GenerateInitialQueriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
