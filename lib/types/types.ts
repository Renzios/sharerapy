import { Database } from '@/lib/types/database.types';

export type Patient = Database['public']['Tables']['patients']['Row'];
export type Therapist = Database['public']['Tables']['therapists']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];