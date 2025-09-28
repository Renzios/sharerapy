import { getPatients } from '../../lib/data/patients';

// Mock Supabase with proper chaining
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));

jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock console.error
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Date for consistent age calculations
const MOCK_TODAY = new Date('2025-09-28');
const originalDate = global.Date;

describe('Patient Data Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date constructor to return consistent "today" date
    global.Date = jest.fn(() => MOCK_TODAY) as any;
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.now = jest.fn(() => MOCK_TODAY.getTime());
    // Allow new Date(string) calls to work normally
    global.Date = jest.fn((dateString?: string | number | Date) => {
      if (dateString) {
        return new originalDate(dateString);
      }
      return MOCK_TODAY;
    }) as any;
    Object.setPrototypeOf(global.Date, originalDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.Date = originalDate;
  });

  describe('getPatients', () => {
    it('should fetch patients with country data and calculate ages correctly', async () => {
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

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(mockSelect).toHaveBeenCalledWith('*, country:countries(*)');
      
      expect(result).toHaveLength(2);
      
      // Check John Doe (born 1990-01-15, test date 2025-09-28)
      expect(result[0]).toMatchObject({
        id: '123e4567-e89b-12d3-a456-426614174000',
        first_name: 'John',
        last_name: 'Doe',
        birthdate: '1990-01-15',
        age: {
          years: 35,
          months: 8 // From Jan to Sep = 8 months
        },
        country: {
          id: 1,
          name: 'United States',
          code: 'US'
        }
      });

      // Check Jane Smith (born 1985-05-10, test date 2025-09-28)
      expect(result[1]).toMatchObject({
        id: '456e7890-e89b-12d3-a456-426614174001',
        first_name: 'Jane',
        last_name: 'Smith',
        birthdate: '1985-05-10',
        age: {
          years: 40,
          months: 4 // From May to Sep = 4 months
        },
        country: {
          id: 2,
          name: 'Canada',
          code: 'CA'
        }
      });
    });

    it('should calculate age correctly for a patient born this year', async () => {
      // Arrange - Patient born in current year
      const mockPatientData = [
        {
          id: '789e1234-e89b-12d3-a456-426614174002',
          first_name: 'Baby',
          last_name: 'Patient',
          birthdate: '2025-03-15',
          sex: 'Male',
          contact_number: '+1111111111',
          country_id: 1,
          country: { id: 1, name: 'United States', code: 'US' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - Born March 15, 2025, test date Sept 28, 2025
      expect(result[0].age).toEqual({
        years: 0,
        months: 6 // March to September = 6 months
      });
    });

    it('should calculate age correctly for birthday not yet reached this year', async () => {
      // Arrange - Patient whose birthday hasn't occurred yet this year
      const mockPatientData = [
        {
          id: '321e4567-e89b-12d3-a456-426614174003',
          first_name: 'Future',
          last_name: 'Birthday',
          birthdate: '1990-12-25', // Birthday is December 25, current date is Sept 28
          sex: 'Female',
          contact_number: '+2222222222',
          country_id: 1,
          country: { id: 1, name: 'United States', code: 'US' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - Born Dec 25, 1990, test date Sept 28, 2025
      // Birthday hasn't occurred yet this year, so should be 34 years
      expect(result[0].age).toEqual({
        years: 34,
        months: 9 // Dec to Sept of next year = 9 months
      });
    });

    it('should calculate age correctly for same day birthday', async () => {
      // Arrange - Patient born on same day and month
      const mockPatientData = [
        {
          id: '654e7890-e89b-12d3-a456-426614174004',
          first_name: 'Same',
          last_name: 'Day',
          birthdate: '2000-09-28', // Same month and day as test date
          sex: 'Male',
          contact_number: '+3333333333',
          country_id: 1,
          country: { id: 1, name: 'United States', code: 'US' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - Born Sept 28, 2000, test date Sept 28, 2025 = exactly 25 years
      expect(result[0].age).toEqual({
        years: 25,
        months: 0
      });
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
      expect(result[0]).toMatchObject({
        first_name: 'No',
        last_name: 'Country',
        country: null,
        age: {
          years: 30,
          months: 3 // June to September = 3 months
        }
      });
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
    });

    it('should handle Supabase error', async () => {
      // Arrange
      const mockError = { 
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR'
      };
      mockSelect.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(getPatients()).rejects.toEqual(mockError);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
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
          country: { id: 1, name: 'United States', code: 'US' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - Should not throw, but age calculation will be NaN
      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Invalid');
      // Age calculation with invalid date should result in NaN values
      expect(isNaN(result[0].age.years)).toBe(true);
      expect(isNaN(result[0].age.months)).toBe(true);
    });

    it('should handle multiple patients with different age scenarios', async () => {
      // Arrange
      const mockPatientData = [
        {
          id: '1',
          first_name: 'Child',
          last_name: 'Patient',
          birthdate: '2020-01-01',
          sex: 'Male',
          contact_number: '+1000000001',
          country_id: 1,
          country: { id: 1, name: 'Country1', code: 'C1' }
        },
        {
          id: '2',
          first_name: 'Adult',
          last_name: 'Patient',
          birthdate: '1975-12-31',
          sex: 'Female',
          contact_number: '+1000000002',
          country_id: 2,
          country: { id: 2, name: 'Country2', code: 'C2' }
        },
        {
          id: '3',
          first_name: 'Senior',
          last_name: 'Patient',
          birthdate: '1940-06-15',
          sex: 'Male',
          contact_number: '+1000000003',
          country_id: 3,
          country: { id: 3, name: 'Country3', code: 'C3' }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert
      expect(result).toHaveLength(3);
      
      // Child (born 2020-01-01, test date 2025-09-28)
      expect(result[0].age.years).toBe(5);
      expect(result[0].age.months).toBe(8);
      
      // Adult (born 1975-12-31, test date 2025-09-28) - birthday not reached
      expect(result[1].age.years).toBe(49);
      expect(result[1].age.months).toBe(9);
      
      // Senior (born 1940-06-15, test date 2025-09-28)
      expect(result[2].age.years).toBe(85);
      expect(result[2].age.months).toBe(3);
    });

    it('should preserve all original patient properties', async () => {
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
          additional_field: 'extra_data',
          country: {
            id: 1,
            name: 'Test Country',
            code: 'TC',
            currency: 'USD'
          }
        }
      ];

      mockSelect.mockResolvedValue({ data: mockPatientData, error: null });

      // Act
      const result = await getPatients();

      // Assert - All original properties should be preserved
      expect(result[0]).toMatchObject({
        id: '999e8888-e89b-12d3-a456-426614174007',
        first_name: 'Full',
        last_name: 'Data',
        birthdate: '1990-01-01',
        sex: 'Male',
        contact_number: '+9999999999',
        country_id: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        additional_field: 'extra_data',
        age: {
          years: 35,
          months: 8
        },
        country: {
          id: 1,
          name: 'Test Country',
          code: 'TC',
          currency: 'USD'
        }
      });
    });
  });
});