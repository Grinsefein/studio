'use server';

import { generateInitialQueries } from '@/ai/flows/generate-initial-queries';
import { suggestNewSearchTerms } from '@/ai/flows/suggest-new-search-terms';
import { summarizeTargetProfile } from '@/ai/flows/summarize-target-profile';
import { z } from 'zod';

const startInvestigationSchema = z.object({
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
});

export async function startInvestigationAction(values: z.infer<typeof startInvestigationSchema>) {
  const validatedFields = startInvestigationSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid subject.',
      queries: [],
    };
  }
  
  try {
    const { subject } = validatedFields.data;
    const result = await generateInitialQueries({ subject });
    return { queries: result.queries };
  } catch (error) {
    return {
      error: 'Failed to generate initial queries. Please try again.',
      queries: [],
    };
  }
}

export async function getNewSuggestionsAction(existingData: string) {
    if (!existingData) {
        return {
            error: 'No data to analyze.',
            suggestedSearchTerms: [],
        }
    }
  try {
    const result = await suggestNewSearchTerms({ existingData });
    return { suggestedSearchTerms: result.suggestedSearchTerms };
  } catch (error) {
    return {
      error: 'Failed to get new suggestions. Please try again.',
      suggestedSearchTerms: [],
    };
  }
}

export async function getSummaryAction(aggregatedData: string) {
    if (!aggregatedData) {
        return {
            error: 'No data to summarize.',
            summary: null,
        }
    }
  try {
    const result = await summarizeTargetProfile({ aggregatedData });
    return { summary: result.summary };
  } catch (error) {
    return {
      error: 'Failed to generate summary. Please try again.',
      summary: null,
    };
  }
}
