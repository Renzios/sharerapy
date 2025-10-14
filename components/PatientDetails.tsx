"use client";

import React, { useEffect } from "react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Tables } from "@/lib/types/database.types";

interface SelectOption {
  value: string;
  label: string;
}

interface PatientDetailsProps {
  patients: Tables<"patients">[];
  patientOptions: SelectOption[];
  countryOptions: SelectOption[];
  // Controlled state props
  selectedPatient: SelectOption | null;
  setSelectedPatient: (value: SelectOption | null) => void;
  selectedCountry: SelectOption | null;
  setSelectedCountry: (value: SelectOption | null) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  birthday: string;
  setBirthday: (value: string) => void;
  selectedSex: SelectOption | null;
  setSelectedSex: (value: SelectOption | null) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
}

export default function PatientDetails({
  patients,
  patientOptions,
  countryOptions,
  selectedPatient,
  setSelectedPatient,
  selectedCountry,
  setSelectedCountry,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  birthday,
  setBirthday,
  selectedSex,
  setSelectedSex,
  contactNumber,
  setContactNumber,
}: PatientDetailsProps) {
  const sexOptions: SelectOption[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  // Add "New Patient" option at the beginning of patient options
  const patientOptionsWithNew = [
    { value: "new", label: "New Patient" },
    ...patientOptions,
  ];

  // Check if an existing patient is selected (not "New Patient")
  const isExistingPatientSelected = Boolean(
    selectedPatient && selectedPatient.value !== "new"
  );

  // Auto-fill patient details when a patient is selected
  useEffect(() => {
    if (selectedPatient && selectedPatient.value !== "new") {
      const patient = patients.find((p) => p.id === selectedPatient.value);
      if (patient) {
        setFirstName(patient.first_name || "");
        setLastName(patient.last_name || "");
        setBirthday(patient.birthdate || "");
        setSelectedSex(
          patient.sex ? { value: patient.sex, label: patient.sex } : null
        );
        setContactNumber(patient.contact_number || "");
        setSelectedCountry(
          patient.country_id
            ? countryOptions.find(
                (c) => c.value === patient.country_id.toString()
              ) || null
            : null
        );
      }
    } else if (selectedPatient?.value === "new" || !selectedPatient) {
      // Clear fields when "New Patient" is selected or nothing is selected
      setFirstName("");
      setLastName("");
      setBirthday("");
      setSelectedSex(null);
      setContactNumber("");
      setSelectedCountry(null);
    }
  }, [
    selectedPatient,
    patients,
    countryOptions,
    setFirstName,
    setLastName,
    setBirthday,
    setSelectedSex,
    setContactNumber,
    setSelectedCountry,
  ]);

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
            options={patientOptionsWithNew}
            value={selectedPatient}
            onChange={(option) => setSelectedPatient(option)}
            placeholder="Select patient..."
            name="patient_id"
          />
          <Select
            label="Country"
            instanceId="patient-country"
            options={countryOptions}
            value={selectedCountry}
            onChange={(option) => setSelectedCountry(option)}
            placeholder="Select country..."
            required={true}
            name="country_id"
            disabled={isExistingPatientSelected}
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
            name="first_name"
            disabled={isExistingPatientSelected}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required={true}
            name="last_name"
            disabled={isExistingPatientSelected}
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
              name="birthdate"
              disabled={isExistingPatientSelected}
            />
            <Select
              label="Sex"
              instanceId="patient-sex"
              options={sexOptions}
              value={selectedSex}
              onChange={(option) => setSelectedSex(option)}
              placeholder="Sex"
              required={true}
              name="sex"
              disabled={isExistingPatientSelected}
            />
          </div>
          <Input
            label="Contact Number"
            type="tel"
            placeholder="Enter contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required={true}
            name="contact_number"
            disabled={isExistingPatientSelected}
          />
        </div>
      </div>
    </div>
  );
}
