import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { Blob as NodeBlob } from 'buffer'

// Basic polyfills for Node.js globals in jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Mock Next.js navigation for component tests
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

// Use Node's built-in Blob and provide a minimal File polyfill.
// This avoids depending on an external package in CI.
const BlobImpl = global.Blob || NodeBlob;

if (!global.File) {
  class FilePoly extends BlobImpl {
    constructor(parts = [], filename = 'file', options = {}) {
      super(parts, options);
      this.name = filename;
      this.lastModified = (options && options.lastModified) || Date.now();
    }
  }
  // eslint-disable-next-line no-global-assign
  global.File = FilePoly;
}

global.Blob = global.Blob || BlobImpl;
