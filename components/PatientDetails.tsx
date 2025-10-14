"use client";

import React, { useState } from "react";
import Input from "@/components/Input";
import Select from "@/components/Select";

interface SelectOption {
  value: string;
  label: string;
}

export default function PatientDetails() {
  const [selectedPatient, setSelectedPatient] = useState<SelectOption | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedSex, setSelectedSex] = useState<SelectOption | null>(null);
  const [contactNumber, setContactNumber] = useState("");

  // Sample options - replace with actual data
  const patientOptions: SelectOption[] = [
    { value: "patient1", label: "Patient 1" },
    { value: "patient2", label: "Patient 2" },
  ];

  const countryOptions: SelectOption[] = [
    { value: "ph", label: "Philippines" },
    { value: "us", label: "United States" },
    { value: "jp", label: "Japan" },
  ];

  const sexOptions: SelectOption[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
        Patient Details
      </h1>

      <div className="flex flex-col gap-y-8">
        {/* Row 1: Choose Patient and Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Choose Patient"
            instanceId="patient-select"
            options={patientOptions}
            value={selectedPatient}
            onChange={(option) => setSelectedPatient(option)}
            placeholder="Select patient..."
            name="patientId"
          />
          <Select
            label="Country"
            instanceId="patient-country"
            options={countryOptions}
            value={selectedCountry}
            onChange={(option) => setSelectedCountry(option)}
            placeholder="Select country..."
            required={true}
            name="country"
          />
        </div>

        {/* Row 2: First Name and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required={true}
            name="firstName"
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required={true}
            name="lastName"
          />
        </div>

        {/* Row 3: Birthday (spans 2 cols), Sex, and Contact Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required={true}
              name="birthday"
            />
            <Select
              label="Sex"
              instanceId="patient-sex"
              options={sexOptions}
              value={selectedSex}
              onChange={(option) => setSelectedSex(option)}
              placeholder="Select sex..."
              required={true}
              name="sex"
            />
          </div>
          <Input
            label="Contact Number"
            type="text"
            placeholder="Enter contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required={true}
            name="contactNumber"
          />
        </div>
      </div>
    </div>
  );
}
