import { render } from '@testing-library/react';
import AIModePage from '@/app/ai-mode/page';

describe('AI Mode Page', () => {
  it('renders without crashing', () => {
    render(<AIModePage />);
    
    // Page renders successfully even if empty
    const container = document.body;
    expect(container).toBeInTheDocument();
  });
});