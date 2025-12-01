"use client";

import Input from "@/components/general/Input";
import Select, { Option } from "@/components/general/Select";

interface PatientDetailsProps {
  countryOptions: Option[];
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  birthday: string;
  setBirthday: (value: string) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
  selectedCountry: Option | null;
  setSelectedCountry: (value: Option | null) => void;
  selectedSex: Option | null;
  setSelectedSex: (value: Option | null) => void;
  disabled?: boolean;
  ids?: {
    firstNameInputId?: string;
    lastNameInputId?: string;
    countrySelectId?: string;
    birthdayInputId?: string;
    sexSelectId?: string;
    contactNumberInputId?: string;
  };
}

export default function PatientDetails({
  countryOptions,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  birthday,
  setBirthday,
  contactNumber,
  setContactNumber,
  selectedCountry,
  setSelectedCountry,
  selectedSex,
  setSelectedSex,
  disabled = false,
  ids,
}: PatientDetailsProps) {
  const sexOptions: Option[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  return (
    <div className="flex flex-col gap-y-10">
      {/* Row 1: Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          placeholder="Enter first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required={true}
          name="first_name"
          disabled={disabled}
          id={ids?.firstNameInputId}
        />
        <Input
          label="Last Name"
          type="text"
          placeholder="Enter last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required={true}
          name="last_name"
          disabled={disabled}
          id={ids?.lastNameInputId}
        />
      </div>

      {/* Row 2: Country & Birthday */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Country"
          instanceId="country-select"
          options={countryOptions}
          value={selectedCountry}
          onChange={(option) => setSelectedCountry(option as Option | null)}
          placeholder="Select country..."
          required={true}
          name="country_id"
          disabled={disabled}
          id={ids?.countrySelectId}
        />
        <Input
          label="Birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required={true}
          name="birthdate"
          disabled={disabled}
          id={ids?.birthdayInputId}
        />
      </div>

      {/* Row 3: Sex & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Sex"
          id={ids?.sexSelectId}
          instanceId={ids?.sexSelectId || "sex-select"}
          options={sexOptions}
          value={selectedSex}
          onChange={(option) => setSelectedSex(option as Option | null)}
          placeholder="Sex"
          required={true}
          name="sex"
          disabled={disabled}
        />
        <Input
          label="Contact Number"
          type="tel"
          placeholder="Enter contact number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required={true}
          name="contact_number"
          disabled={disabled}
          id={ids?.contactNumberInputId}
        />
      </div>
    </div>
  );
}
