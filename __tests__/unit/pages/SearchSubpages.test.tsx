import { render } from '@testing-library/react';
import SearchPatientsPage from '@/app/(with-sidebar)/search/patients/page';
import SearchTherapistsPage from '@/app/(with-sidebar)/search/therapists/page';

// Mock next/navigation for dynamic imports
jest.mock('next/navigation', () => ({
  usePathname: () => '/search/patients',
}));

describe('Search Subpages', () => {
  describe('Search Patients Page', () => {
    it('renders without crashing', () => {
      render(<SearchPatientsPage />);
      
      const container = document.body;
      expect(container).toBeInTheDocument();
    });
  });

  describe('Search Therapists Page', () => {
    it('renders without crashing', () => {
      render(<SearchTherapistsPage />);
      
      const container = document.body;
      expect(container).toBeInTheDocument();
    });
  });
});