import { createClient } from '@/lib/supabase/server';

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