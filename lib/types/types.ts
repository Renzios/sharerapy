import { Enums } from '@/lib/types/database.types';

export type ReadParameters = {
    column?: string,
    ascending?: boolean,

    countryID?: number,
    sex?: Enums<'sex'>,
    clinicID?: number,
    languageID?: number,
    typeID?: number,
    typeIDs?: number[],
    startDate?: string,
    endDate?: string,
    therapistID?: string,

    page?: number,
    pageSize?: number
}