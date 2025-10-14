import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

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