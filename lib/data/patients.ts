import { createClient } from '@/lib/supabase/server';

/**
 * Fetches all patients from the database along with their associated country.
 * It calculates the age of each patient in years and months.
 * @returns A promise that resolves to an array of patients, each with an `age` object and `country` data.
 * @throws Will throw an error if the database query fails.
 */
export async function getPatients() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients')
        .select('*, country:countries(*)');
    
    if (error) {
        console.error(error);
        throw error;
    }

    const patients = data.map((patient) => {
        const today = new Date();
        const birthdate = new Date(patient.birthdate);

        let years = today.getFullYear() - birthdate.getFullYear();
        let months = today.getMonth() - birthdate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birthdate.getDate())) {
            years--;
            months += 12;
        }
        
        return { ...patient, age: { years, months } };
    });

    return patients;
}

/**
 * Fetches a single patient from the database by their UUID.
 *
 * This function retrieves a specific patient record from the `patients` table,
 * joins the associated `countries` data, and calculates the patient's age.
 *
 * @param id - The UUID of the patient to fetch.
 * @returns A promise that resolves to a single patient object with age and country,
 *          or `null` if no patient is found with the given ID.
 * @throws Will throw an error if the Supabase query fails.
 */
export async function getPatient(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients')
        .select('*, country:countries(*)')
        .eq('id', id)
        .single();

    if (error) {
        console.error(error);
        throw error;
    }

    if (!data) {
        return null;
    }

    const today = new Date();
    const birthdate = new Date(data.birthdate);

    let years = today.getFullYear() - birthdate.getFullYear();
    let months = today.getMonth() - birthdate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthdate.getDate())) {
        years--;
        months += 12;
    }

    return { ...data, age: { years, months } };
}