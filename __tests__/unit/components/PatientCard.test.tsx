import { render, screen } from '@testing-library/react';
import PatientCard from '@/components/PatientCard';

describe('PatientCard Component', () => {
  const mockPatient = {
    id: 1,
    name: 'John Smith',
    contactNumber: '+1 (555) 123-4567',
    country: 'United States',
    sex: 'Male'
  };

  const mockPatientFemale = {
    id: 2,
    name: 'Sarah Johnson',
    contactNumber: '+44 20 7946 0958',
    country: 'United Kingdom',
    sex: 'Female'
  };

  it('renders without crashing', () => {
    render(<PatientCard patient={mockPatient} />);
    
    const card = screen.getByText(mockPatient.name).closest('div');
    expect(card).toBeInTheDocument();
  });

  it('displays patient name correctly', () => {
    render(<PatientCard patient={mockPatient} />);
    
    const patientName = screen.getByRole('heading', { name: mockPatient.name });
    expect(patientName).toBeInTheDocument();
  });

  it('displays patient contact number', () => {
    render(<PatientCard patient={mockPatient} />);
    
    const contactNumber = screen.getByText(mockPatient.contactNumber);
    expect(contactNumber).toBeInTheDocument();
  });

  it('displays patient country information', () => {
    render(<PatientCard patient={mockPatient} />);
    
    const countryLabel = screen.getByText('Country');
    const countryValue = screen.getByText(mockPatient.country);
    
    expect(countryLabel).toBeInTheDocument();
    expect(countryValue).toBeInTheDocument();
  });

  it('displays patient sex information', () => {
    render(<PatientCard patient={mockPatient} />);
    
    const sexLabel = screen.getByText('Sex');
    const sexValue = screen.getByText(mockPatient.sex);
    
    expect(sexLabel).toBeInTheDocument();
    expect(sexValue).toBeInTheDocument();
  });



  it('renders different patient data correctly', () => {
    render(<PatientCard patient={mockPatientFemale} />);
    
    expect(screen.getByRole('heading', { name: mockPatientFemale.name })).toBeInTheDocument();
    expect(screen.getByText(mockPatientFemale.contactNumber)).toBeInTheDocument();
    expect(screen.getByText(mockPatientFemale.country)).toBeInTheDocument();
    expect(screen.getByText(mockPatientFemale.sex)).toBeInTheDocument();
  });

  it('handles long patient names correctly', () => {
    const longNamePatient = {
      ...mockPatient,
      name: 'Dr. Elizabeth Alexandra Montgomery-Smith'
    };
    
    render(<PatientCard patient={longNamePatient} />);
    
    const patientName = screen.getByRole('heading', { name: longNamePatient.name });
    expect(patientName).toBeInTheDocument();
  });

  it('handles international contact numbers', () => {
    const internationalPatient = {
      ...mockPatient,
      contactNumber: '+81 3-3234-5678',
      country: 'Japan'
    };
    
    render(<PatientCard patient={internationalPatient} />);
    
    expect(screen.getByText(internationalPatient.contactNumber)).toBeInTheDocument();
    expect(screen.getByText(internationalPatient.country)).toBeInTheDocument();
  });

  it('displays all required information fields', () => {
    render(<PatientCard patient={mockPatient} />);
    
    // Check that all required fields are present
    expect(screen.getByRole('heading', { name: mockPatient.name })).toBeInTheDocument();
    expect(screen.getByText(mockPatient.contactNumber)).toBeInTheDocument();
    
    // Check that both labels and values are present
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText(mockPatient.country)).toBeInTheDocument();
    expect(screen.getByText('Sex')).toBeInTheDocument();
    expect(screen.getByText(mockPatient.sex)).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    render(<PatientCard patient={mockPatient} />);
    
    const card = screen.getByText(mockPatient.name).closest('div');
    expect(card).toBeInTheDocument();
  });

  it('maintains semantic HTML structure', () => {
    render(<PatientCard patient={mockPatient} />);
    
    // Patient name should be an h1 (main heading for the card)
    const patientName = screen.getByRole('heading', { level: 1, name: mockPatient.name });
    expect(patientName).toBeInTheDocument();
    
    // Section labels should be h2 elements
    const countryHeading = screen.getByRole('heading', { level: 2, name: 'Country' });
    const sexHeading = screen.getByRole('heading', { level: 2, name: 'Sex' });
    expect(countryHeading).toBeInTheDocument();
    expect(sexHeading).toBeInTheDocument();
  });
});