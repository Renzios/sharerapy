// Test fixtures and mock data
export const mockPatientData = {
  validPatient: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    birthdate: '1990-01-15',
    sex: 'Male',
    contact_number: '+1234567890',
    country_id: 1,
  },
  
  patientWithCountry: {
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
  },

  invalidPatient: {
    first_name: '',
    last_name: 'Invalid',
    birthdate: 'invalid-date',
    sex: 'Unknown',
    contact_number: 'invalid-phone',
    country_id: null,
  }
};

export const mockFormData = {
  createPatientForm: (data: Record<string, string | number | null>) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null) {
        formData.append(key, value.toString());
      }
    });
    return formData;
  }
};

export const mockSupabaseResponses = {
  success: { data: mockPatientData.validPatient, error: null },
  error: { data: null, error: { message: 'Database error', code: '500' } },
  empty: { data: [], error: null },
};