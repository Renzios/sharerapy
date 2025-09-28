import { getPatients } from '@/lib/data/patients';

// Mock Supabase with proper chaining
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock console.error
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Patient Data Retrieval Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPatients', () => {
    it('should fetch patients with country data and calculate ages', async () => {
      // Arrange
      const mockPatientData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          first_name: 'John',
          last_name: 'Doe',
          birthdate: '1990-01-15',
          sex: 'Male',
          contact_number: '+1234567890',
          country_id: 1,
          country: {
            id: 1,
            name: 'United States',
            code: 'US'
          }
        },
        {
          id: '456e7890-e89b-12d3-a456-426614174001',
          first_name: 'Jane',
          last_name: 'Smith',
          birthdate: '1985-05-10',
          sex: 'Female',
          contact_number: '+0987654321',
          country_id: 2,
          country: {
            id: 2,
            name: 'Canada',
            code: 'CA'
          }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - Database interaction
      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(mockSelect).toHaveBeenCalledWith('*, country:countries(*)');
      
      // Assert - Result structure
      expect(result).toHaveLength(2);
      
      // Assert - First patient data
      expect(result[0].id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result[0].first_name).toBe('John');
      expect(result[0].last_name).toBe('Doe');
      expect(result[0].birthdate).toBe('1990-01-15');
      expect(result[0].sex).toBe('Male');
      expect(result[0].contact_number).toBe('+1234567890');
      expect(result[0].country_id).toBe(1);
      
      // Assert - Country data join
      expect(result[0].country).toBeDefined();
      expect(result[0].country.name).toBe('United States');
      expect(result[0].country.code).toBe('US');
      
      // Assert - Age calculation exists
      expect(result[0].age).toBeDefined();
      expect(typeof result[0].age.years).toBe('number');
      expect(typeof result[0].age.months).toBe('number');
      
      // Assert - Second patient 
      expect(result[1].first_name).toBe('Jane');
      expect(result[1].country.name).toBe('Canada');
      expect(result[1].age).toBeDefined();
    });

    it('should handle empty patient list', async () => {
      // Arrange
      mockSelect.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await getPatients();

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(mockSelect).toHaveBeenCalledWith('*, country:countries(*)');
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle Supabase database error', async () => {
      // Arrange
      const mockError = { 
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
        details: 'Network timeout'
      };
      mockSelect.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(getPatients()).rejects.toEqual(mockError);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });

    it('should handle patients with null country data', async () => {
      // Arrange
      const mockPatientData = [
        {
          id: '987e6543-e89b-12d3-a456-426614174005',
          first_name: 'No',
          last_name: 'Country',
          birthdate: '1995-06-20',
          sex: 'Female',
          contact_number: '+4444444444',
          country_id: null,
          country: null
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('No');
      expect(result[0].last_name).toBe('Country');
      expect(result[0].country).toBeNull();
      expect(result[0].age).toBeDefined();
      expect(typeof result[0].age.years).toBe('number');
      expect(typeof result[0].age.months).toBe('number');
    });

    it('should preserve all patient properties and add age calculation', async () => {
      // Arrange
      const mockPatientData = [
        {
          id: '999e8888-e89b-12d3-a456-426614174007',
          first_name: 'Full',
          last_name: 'Data',
          birthdate: '1990-01-01',
          sex: 'Male',
          contact_number: '+9999999999',
          country_id: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          country: {
            id: 1,
            name: 'Test Country',
            code: 'TC'
          }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - All original properties preserved
      expect(result[0].id).toBe('999e8888-e89b-12d3-a456-426614174007');
      expect(result[0].first_name).toBe('Full');
      expect(result[0].last_name).toBe('Data');
      expect(result[0].birthdate).toBe('1990-01-01');
      expect(result[0].sex).toBe('Male');
      expect(result[0].contact_number).toBe('+9999999999');
      expect(result[0].country_id).toBe(1);
      expect(result[0].created_at).toBe('2025-01-01T00:00:00Z');
      expect(result[0].updated_at).toBe('2025-01-01T00:00:00Z');
      
      // Assert - Country join preserved
      expect(result[0].country.name).toBe('Test Country');
      expect(result[0].country.code).toBe('TC');
      
      // Assert - Age calculation added
      expect(result[0].age).toBeDefined();
      expect(result[0].age.years).toBeGreaterThanOrEqual(0);
      expect(result[0].age.months).toBeGreaterThanOrEqual(0);
      expect(result[0].age.months).toBeLessThan(12);
    });

    it('should calculate reasonable ages for different birthdates', async () => {
      // Arrange - Test with various ages
      const mockPatientData = [
        {
          id: '1',
          first_name: 'Young',
          last_name: 'Patient',
          birthdate: '2020-01-01', // Should be around 5 years old
          sex: 'Male',
          contact_number: '+1111111111',
          country_id: 1,
          country: { id: 1, name: 'Country1', code: 'C1' }
        },
        {
          id: '2',
          first_name: 'Adult',
          last_name: 'Patient',
          birthdate: '1985-06-15', // Should be around 40 years old
          sex: 'Female',
          contact_number: '+2222222222',
          country_id: 2,
          country: { id: 2, name: 'Country2', code: 'C2' }
        },
        {
          id: '3',
          first_name: 'Senior',
          last_name: 'Patient',
          birthdate: '1945-12-25', // Should be around 80 years old
          sex: 'Male',
          contact_number: '+3333333333',
          country_id: 3,
          country: { id: 3, name: 'Country3', code: 'C3' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert
      expect(result).toHaveLength(3);
      
      // Verify all patients have age calculations
      result.forEach((patient, index) => {
        expect(patient.age).toBeDefined();
        expect(typeof patient.age.years).toBe('number');
        expect(typeof patient.age.months).toBe('number');
        
        // Ages should be reasonable (not negative or impossibly high)
        expect(patient.age.years).toBeGreaterThanOrEqual(0);
        expect(patient.age.years).toBeLessThan(120);
        expect(patient.age.months).toBeGreaterThanOrEqual(0);
        expect(patient.age.months).toBeLessThan(12);
      });
      
      // Young patient should have lower age
      expect(result[0].age.years).toBeLessThan(10);
      
      // Adult patient should have middle age
      expect(result[1].age.years).toBeGreaterThan(30);
      expect(result[1].age.years).toBeLessThan(50);
      
      // Senior patient should have higher age
      expect(result[2].age.years).toBeGreaterThan(70);
    });

    it('should handle invalid birthdate gracefully', async () => {
      // Arrange
      const mockPatientData = [
        {
          id: '111e2222-e89b-12d3-a456-426614174006',
          first_name: 'Invalid',
          last_name: 'Date',
          birthdate: 'invalid-date-string',
          sex: 'Male',
          contact_number: '+5555555555',
          country_id: 1,
          country: { id: 1, name: 'Test Country', code: 'TC' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - Should not crash, but age calculation may be invalid
      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Invalid');
      expect(result[0].birthdate).toBe('invalid-date-string');
      expect(result[0].age).toBeDefined();
      
      // Invalid date should result in NaN for age calculations
      const ageYears = result[0].age.years;
      const ageMonths = result[0].age.months;
      expect(isNaN(ageYears) || typeof ageYears === 'number').toBe(true);
      expect(isNaN(ageMonths) || typeof ageMonths === 'number').toBe(true);
    });
  });
});