import { serve } from 'inngest/vercel';
import { inngest } from '../../src/lib/inngest-client';
import { generateAudiobook } from '../../inngest/audiobook-generation';

// Serve the Inngest API endpoint
export default serve({
  client: inngest,
  functions: [
    generateAudiobook,
  ],
});
