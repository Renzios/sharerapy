/** @jest-environment node */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local early so tests can access keys if needed
import { config } from 'dotenv';
config({ path: '.env.local' });

// Provide a deterministic mock of the OpenAI SDK for CI by default.
// Set USE_REAL_OPENAI=1 in the environment to call the real SDK instead.
jest.mock('openai', () => {
  if (process.env.USE_REAL_OPENAI === '1' || process.env.USE_REAL_OPENAI === 'true') {
    return jest.requireActual('openai');
  }

  class OpenAIMock {
    responses: { create: (payload?: unknown) => Promise<{ output_text: string }>; };
    constructor() {
      this.responses = {
        create: async () => ({ output_text: 'This is a sample pdf converted to markdown\n\n# Title\n\nThis is a sample pdf' }),
      };
    }
  }

  // Return a module-compatible export that works for both CJS and ESM imports
  const exported = OpenAIMock as unknown as { default: typeof OpenAIMock };
  exported.default = OpenAIMock;
  return exported;
});

import * as parseMod from '@/lib/actions/parse';

const hasKey = !!process.env.OPENAI_API_KEY;

(hasKey ? describe : describe.skip)('parseFile integration', () => {
  // Resolve parseFile export in a typesafe way (supporting named or default exports)
  const maybe = parseMod as unknown;
  let parseFile: (file: File) => Promise<string>;
  if (typeof maybe === 'function') {
    parseFile = maybe as (file: File) => Promise<string>;
  } else {
    const pm = maybe as { parseFile?: (file: File) => Promise<string>; default?: { parseFile?: (file: File) => Promise<string> } };
    parseFile = pm.parseFile || pm.default?.parseFile as (file: File) => Promise<string>;
  }

  it('calls OpenAI and returns markdown containing the expected phrase', async () => {
    const samplePath = path.join(__dirname, '..', 'files', 'sample.pdf');
    const pdfBuffer = fs.readFileSync(samplePath);

    // Create a File object in Node (jest.setup.js provides a minimal File polyfill)
    const file = new File([pdfBuffer], 'sample.pdf', { type: 'application/pdf' });

    const result = await parseFile(file);

    expect(typeof result).toBe('string');
    expect(result.toLowerCase()).toContain('this is a sample pdf');
  }, 30000);
});
