import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-queries.ts';
import '@/ai/flows/suggest-new-search-terms.ts';
import '@/ai/flows/summarize-target-profile.ts';