import { render } from '@testing-library/react';
import CreateNewReportPage from '@/app/(with-sidebar)/reports/new/page';

describe('Create New Report Page', () => {
  it('renders without crashing', () => {
    render(<CreateNewReportPage />);
    
    // Page renders successfully even if empty
    const container = document.body;
    expect(container).toBeInTheDocument();
  });
});