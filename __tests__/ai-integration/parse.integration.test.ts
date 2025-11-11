/** @jest-environment node */

import * as fs from 'fs';
import * as path from 'path';
import * as parseMod from '@/lib/actions/parse';

const hasKey = !!process.env.OPENAI_API_KEY;

(hasKey ? describe : describe.skip)('parseFile integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = parseMod;
  const parseFile = mod.parseFile || mod.default || mod;

  it('calls OpenAI and returns markdown containing the expected phrase', async () => {
    const samplePath = path.join(__dirname, '..', 'files', 'sample.pdf');
    const buf = fs.readFileSync(samplePath);
    const file = new File([buf], 'sample.pdf', { type: 'application/pdf' });

    const result = await parseFile(file);

    expect(typeof result).toBe('string');
    expect(result.toLowerCase()).toContain('this is a sample pdf');
  }, 30000);
});
