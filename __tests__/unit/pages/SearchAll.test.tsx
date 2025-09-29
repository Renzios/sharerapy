import { render, screen } from '@testing-library/react';
import SearchAll from '@/app/(with-sidebar)/search/page';

describe('Search All Page', () => {
  it('renders without crashing', () => {
    render(<SearchAll />);
    
    // Should contain some content - use getAllByText since there are multiple
    const content = screen.getAllByText(/hello/i);
    expect(content.length).toBeGreaterThan(0);
  });

  it('displays expected content', () => {
    render(<SearchAll />);
    
    // Check for the main content using text content match
    const primaryText = screen.getByText((content) => {
      return content.includes('HELLOO');
    });
    expect(primaryText).toBeInTheDocument();
  });
});