import { createPatient, updatePatient, deletePatient } from '@/lib/actions/patients';

// Mock Supabase with proper chaining to match actual usage
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockDelete = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock console.error 
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Patient Management Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockSelect.mockResolvedValue({ data: null, error: null });
    mockEq.mockReturnValue({ select: mockSelect });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPatient', () => {
    it('should create a patient successfully with valid data', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('first_name', 'John');
      formData.append('last_name', 'Doe');
      formData.append('birthdate', '1990-01-01');
      formData.append('sex', 'Male');
      formData.append('contact_number', '+1234567890');
      formData.append('country_id', '1');

      mockSelect.mockResolvedValue({ data: [{ id: '123' }], error: null });

      // Act
      await createPatient(formData);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(mockInsert).toHaveBeenCalledWith([{
        first_name: 'John',
        last_name: 'Doe',
        birthdate: '1990-01-01',
        sex: 'Male',
        contact_number: '+1234567890',
        country_id: 1, // Should be parsed to number
      }]);
      expect(mockSelect).toHaveBeenCalledWith();
    });

    it('should handle female patient creation', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('first_name', 'Jane');
      formData.append('last_name', 'Smith');
      formData.append('birthdate', '1985-05-15');
      formData.append('sex', 'Female');
      formData.append('contact_number', '+0987654321');
      formData.append('country_id', '2');

      mockSelect.mockResolvedValue({ data: [{ id: '456' }], error: null });

      // Act
      await createPatient(formData);

      // Assert
      expect(mockInsert).toHaveBeenCalledWith([{
        first_name: 'Jane',
        last_name: 'Smith',
        birthdate: '1985-05-15',
        sex: 'Female',
        contact_number: '+0987654321',
        country_id: 2,
      }]);
    });

    it('should handle missing country_id gracefully', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('first_name', 'John');
      formData.append('last_name', 'Doe');
      formData.append('birthdate', '1990-01-01');
      formData.append('sex', 'Male');
      formData.append('contact_number', '+1234567890');
      // No country_id provided

      mockSelect.mockResolvedValue({ data: [{ id: '789' }], error: null });

      // Act
      await createPatient(formData);

      // Assert
      expect(mockInsert).toHaveBeenCalledWith([{
        first_name: 'John',
        last_name: 'Doe',
        birthdate: '1990-01-01',
        sex: 'Male',
        contact_number: '+1234567890',
        country_id: NaN, // parseInt(null) returns NaN
      }]);
    });

    it('should handle Supabase error', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('first_name', 'John');
      formData.append('last_name', 'Doe');
      formData.append('birthdate', '1990-01-01');
      formData.append('sex', 'Male');
      formData.append('contact_number', '+1234567890');
      formData.append('country_id', '1');

      const mockError = { message: 'Database connection failed' };
      mockSelect.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert - The function should throw the error
      await expect(createPatient(formData)).rejects.toEqual(mockError);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updatePatient', () => {
    it('should update a patient successfully with valid data', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const formData = new FormData();
      formData.append('first_name', 'John');
      formData.append('last_name', 'Updated');
      formData.append('birthdate', '1990-01-01');
      formData.append('sex', 'Male');
      formData.append('contact_number', '+1111111111');
      formData.append('country_id', '3');

      mockEq.mockResolvedValue({ data: [{ id: patientId }], error: null });

      // Act
      await updatePatient(patientId, formData);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Updated',
        birthdate: '1990-01-01',
        sex: 'Male',
        contact_number: '+1111111111',
        country_id: 3,
      });
      expect(mockEq).toHaveBeenCalledWith('id', patientId);
    });

    it('should handle Supabase error during update', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const formData = new FormData();
      formData.append('first_name', 'John');

      const mockError = { message: 'Patient not found' };
      mockEq.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert - The function should throw the error
      await expect(updatePatient(patientId, formData)).rejects.toEqual(mockError);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });

    it('should update patient with partial data', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const formData = new FormData();
      formData.append('first_name', 'UpdatedName');
      formData.append('contact_number', '+9999999999');

      mockEq.mockResolvedValue({ data: [{ id: patientId }], error: null });

      // Act
      await updatePatient(patientId, formData);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'UpdatedName',
        last_name: null,
        birthdate: null,
        sex: null,
        contact_number: '+9999999999',
        country_id: NaN, // parseInt(null)
      });
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient successfully', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      mockEq.mockResolvedValue({ data: [{ id: patientId }], error: null });

      // Act
      await deletePatient(patientId);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('patients');
      expect(mockDelete).toHaveBeenCalledWith();
      expect(mockEq).toHaveBeenCalledWith('id', patientId);
    });

    it('should handle Supabase error during delete', async () => {
      // Arrange
      const patientId = '123e4567-e89b-12d3-a456-426614174000';
      const mockError = { message: 'Delete failed' };
      mockEq.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert - The function should throw the error
      await expect(deletePatient(patientId)).rejects.toEqual(mockError);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });

    it('should handle empty patient ID', async () => {
      // Arrange
      const patientId = '';
      mockEq.mockResolvedValue({ data: [], error: null });

      // Act
      await deletePatient(patientId);

      // Assert
      expect(mockEq).toHaveBeenCalledWith('id', '');
    });
  });
});