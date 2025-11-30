import React, { useMemo, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientDetails from "@/components/forms/PatientDetails";
import type { Tables } from "@/lib/types/database.types";

type SelectOption = { value: string; label: string };


type InputProps = {
  label?: string;
  name?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
};

type SelectProps = {
  label?: string;
  instanceId?: string;
  options?: SelectOption[];
  value?: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

// Mock Input as a standard input with accessible label
jest.mock("@/components/general/Input", () => ({
  __esModule: true,
  default: (props: InputProps) => {
    const {
      label,
      name,
      value,
      onChange,
      required,
      maxLength,
      type = "text",
      placeholder,
      disabled,
    } = props;
    const id = name || "input-id";
    return (
      <div>
        {label && (
          <label htmlFor={id} style={{ display: "block" }}>
            {label}
          </label>
        )}
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    );
  },
}));

// Mock Select as a native select for easy interaction
jest.mock("@/components/general/Select", () => ({
  __esModule: true,
  default: (props: SelectProps) => {
    const {
      label,
      instanceId,
      options = [],
      value,
      onChange,
      placeholder,
      name,
      required,
      disabled,
    } = props;
    const id = instanceId || name || "select-id";
    const currentValue = value?.value ?? "";
    return (
      <div>
        {label && (
          <label htmlFor={id} style={{ display: "block" }}>
            {label}
          </label>
        )}
        <select
          id={id}
          name={name}
          required={required}
          value={currentValue}
          disabled={disabled}
          onChange={(e) => {
            const opt =
              options.find((o: SelectOption) => o.value === e.target.value) ||
              null;
            onChange(opt);
          }}
        >
          <option value="" disabled>
            {placeholder || "Select..."}
          </option>
          {options.map((o: SelectOption) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
}));

function Wrapper() {
  // Stabilize arrays across renders to avoid triggering child effects repeatedly
  const patients = useMemo<Tables<"patients">[]>(
    () => [
      {
        id: "1",
        first_name: "Lorenzo",
        last_name: "Nery",
        birthdate: "1990-05-10",
        sex: "Male",
        contact_number: "67",
        country_id: 1,
      } as unknown as Tables<"patients">,
      {
        id: "2",
        first_name: "Leaf",
        last_name: "Sy",
        birthdate: "1985-12-20",
        sex: "Female",
        contact_number: "987654",
        country_id: 2,
      } as unknown as Tables<"patients">,
    ],
    []
  );

  const patientOptions = useMemo<SelectOption[]>(
    () => [
      { value: "1", label: "Lorenzo Nery" },
      { value: "2", label: "Leaf Sy" },
    ],
    []
  );

  const countryOptions = useMemo<SelectOption[]>(
    () => [
      { value: "1", label: "Philippines" },
      { value: "2", label: "South Korea" },
    ],
    []
  );

  const [selectedPatient, setSelectedPatient] = useState<SelectOption | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [selectedSex, setSelectedSex] = useState<SelectOption | null>(null);
  const [contactNumber, setContactNumber] = useState<string>("");

  return (
    <PatientDetails
      patients={patients}
      patientOptions={patientOptions}
      countryOptions={countryOptions}
      selectedPatient={selectedPatient}
      setSelectedPatient={setSelectedPatient}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      birthday={birthday}
      setBirthday={setBirthday}
      selectedSex={selectedSex}
      setSelectedSex={setSelectedSex}
      contactNumber={contactNumber}
      setContactNumber={setContactNumber}
    />
  );
}

describe("PatientDetails form", () => {
  describe("Rendering", () => {
    it("renders heading and all labeled fields", () => {
      render(<Wrapper />);

      expect(
        screen.getByRole("heading", { name: /patient details/i })
      ).toBeInTheDocument();

      expect(screen.getByLabelText("Choose Patient")).toBeInTheDocument();
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Birthday")).toBeInTheDocument();
      expect(screen.getByLabelText("Sex")).toBeInTheDocument();
      expect(screen.getByLabelText("Contact Number")).toBeInTheDocument();
    });

    it("renders placeholders and required attributes correctly", () => {
      render(<Wrapper />);

      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // Placeholders
      expect(
        (choose.querySelector("option[value='']") as HTMLOptionElement).textContent
      ).toBe("Select patient...");
      expect(
        (country.querySelector("option[value='']") as HTMLOptionElement).textContent
      ).toBe("Select country...");
      expect(
        (sex.querySelector("option[value='']") as HTMLOptionElement).textContent
      ).toBe("Sex");

      expect(first.placeholder).toBe("Enter first name");
      expect(last.placeholder).toBe("Enter last name");
      expect(phone.placeholder).toBe("Enter contact number");

      // Required flags
      expect(choose.required).toBe(false);
      expect(country.required).toBe(true);
      expect(first.required).toBe(true);
      expect(last.required).toBe(true);
      expect(birth.required).toBe(true);
      expect(sex.required).toBe(true);
      expect(phone.required).toBe(true);
    });

    it("renders all provided options and prepends 'New Patient'", () => {
      render(<Wrapper />);
      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;

      // Choose Patient: placeholder + New Patient + 2 provided options = 4 total
      expect(choose.options.length).toBe(4);
      expect(choose.options[1].value).toBe("new");
      expect(choose.options[1].text).toBe("New Patient");
      expect(choose.options[2].value).toBe("1");
      expect(choose.options[2].text).toBe("Lorenzo Nery");
      expect(choose.options[3].value).toBe("2");
      expect(choose.options[3].text).toBe("Leaf Sy");

      // Country options include placeholder
      expect(country.options.length).toBe(3);
      expect(country.options[1].value).toBe("1");
      expect(country.options[1].text).toBe("Philippines");
      expect(country.options[2].value).toBe("2");
      expect(country.options[2].text).toBe("South Korea");

      // Sex options include placeholder
      expect(sex.options.length).toBe(3);
      expect(sex.options[1].value).toBe("Male");
      expect(sex.options[2].value).toBe("Female");
    });
  });

  describe("User Interaction", () => {
    it("allows typing into inputs and selecting options when 'New Patient' or none selected", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // Select New Patient to ensure fields enabled and cleared
      await user.selectOptions(choose, "new");

      await user.type(first, "Alice");
      await user.type(last, "Wonderland");
      await user.type(birth, "2000-01-01");
      await user.selectOptions(sex, "Female");
      await user.selectOptions(country, "2");
      await user.type(phone, "555-0000");

      expect(first.value).toBe("Alice");
      expect(last.value).toBe("Wonderland");
      expect(birth.value).toBe("2000-01-01");
      expect(sex.value).toBe("Female");
      expect(country.value).toBe("2");
      expect(phone.value).toBe("555-0000");
    });

    it("autofills and disables fields after selecting existing patient", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      await user.selectOptions(choose, "1");
      // Patient "Lorenzo Nery" selected
      expect(first.value).toBe("Lorenzo");
      expect(last.value).toBe("Nery");
      expect(birth.value).toBe("1990-05-10");
      expect(sex.value).toBe("Male");
      expect(country.value).toBe("1");
      expect(phone.value).toBe("67");

      expect(first.disabled).toBe(true);
      expect(last.disabled).toBe(true);
      expect(birth.disabled).toBe(true);
      expect(sex.disabled).toBe(true);
      expect(country.disabled).toBe(true);
      expect(phone.disabled).toBe(true);

      // Attempt to change disabled fields should have no effect
      await user.type(first, "X");
      await user.type(last, "Y");
      await user.type(phone, "Z");
      expect(first.value).toBe("Lorenzo");
      expect(last.value).toBe("Nery");
      expect(phone.value).toBe("67");
    });

    it("re-enables and clears fields when switching back to 'New Patient'", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      await user.selectOptions(choose, "2");
      expect(first.disabled).toBe(true);

      await user.selectOptions(choose, "new");

      expect(first.disabled).toBe(false);
      expect(last.disabled).toBe(false);
      expect(birth.disabled).toBe(false);
      expect(sex.disabled).toBe(false);
      expect(country.disabled).toBe(false);
      expect(phone.disabled).toBe(false);

      expect(first.value).toBe("");
      expect(last.value).toBe("");
      expect(birth.value).toBe("");
      expect(sex.value).toBe("");
      expect(country.value).toBe("");
      expect(phone.value).toBe("");
    });

    it("allows selecting the same patient option multiple times without error", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();
      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;

      await user.selectOptions(choose, "1");
      expect(choose.value).toBe("1");
      await user.selectOptions(choose, "1");
      expect(choose.value).toBe("1");
    });

    it("allows switching between different existing patients without error", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
        await user.selectOptions(choose, "1");
        expect(choose.value).toBe("1");
        await user.selectOptions(choose, "2");
        expect(choose.value).toBe("2");
    });

    it("supports non-latin characters in text inputs", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();
      const first = screen.getByLabelText("First Name") as HTMLInputElement;

      const nonLatinName = "张伟";
      await user.type(first, nonLatinName);
      expect(first.value).toBe(nonLatinName);
      
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const nonLatinLastName = "Олександрович";
      await user.type(last, nonLatinLastName);
      expect(last.value).toBe(nonLatinLastName);
    });
  });

  describe("Props Handling", () => {
    it("assigns name and id attributes correctly for inputs and selects", () => {
      render(<Wrapper />);

      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // Names from component props
      expect(choose.name).toBe("patient_id");
      expect(country.name).toBe("country_id");
      expect(first.name).toBe("first_name");
      expect(last.name).toBe("last_name");
      expect(birth.name).toBe("birthdate");
      expect(sex.name).toBe("sex");
      expect(phone.name).toBe("contact_number");

      // IDs from instanceId or name (when instanceId is not provided, falls back to name)
      expect(choose.id).toBe("patient_id");
      expect(country.id).toBe("country_id");
      expect(sex.id).toBe("sex");
      expect(first.id).toBe("first_name");
      expect(last.id).toBe("last_name");
      expect(birth.id).toBe("birthdate");
      expect(phone.id).toBe("contact_number");

      // Labels correctly associated
      expect((screen.getByText("Choose Patient") as HTMLLabelElement).htmlFor).toBe(
        "patient_id"
      );
      expect((screen.getByText("Country") as HTMLLabelElement).htmlFor).toBe(
        "country_id"
      );
      // Use the control's associated label to avoid matching the "Sex" placeholder option
      const sexLabel = sex.labels?.[0] as HTMLLabelElement | undefined;
      expect(sexLabel?.htmlFor).toBe("sex");
      expect((screen.getByText("First Name") as HTMLLabelElement).htmlFor).toBe(
        "first_name"
      );
      expect((screen.getByText("Last Name") as HTMLLabelElement).htmlFor).toBe(
        "last_name"
      );
      expect((screen.getByText("Birthday") as HTMLLabelElement).htmlFor).toBe(
        "birthdate"
      );
      expect(
        (screen.getByText("Contact Number") as HTMLLabelElement).htmlFor
      ).toBe("contact_number");
    });

    it("disables/enables fields based on selected patient state", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const choose = screen.getByLabelText("Choose Patient") as HTMLSelectElement;
      const inputs = {
        country: screen.getByLabelText("Country") as HTMLSelectElement,
        first: screen.getByLabelText("First Name") as HTMLInputElement,
        last: screen.getByLabelText("Last Name") as HTMLInputElement,
        birth: screen.getByLabelText("Birthday") as HTMLInputElement,
        sex: screen.getByLabelText("Sex") as HTMLSelectElement,
        phone: screen.getByLabelText("Contact Number") as HTMLInputElement,
      };

      // Initially enabled (no selection)
      expect(inputs.first.disabled).toBe(false);

      // Select existing -> disabled
      await user.selectOptions(choose, "2");
      expect(inputs.first.disabled).toBe(true);
      expect(inputs.last.disabled).toBe(true);
      expect(inputs.birth.disabled).toBe(true);
      expect(inputs.sex.disabled).toBe(true);
      expect(inputs.country.disabled).toBe(true);
      expect(inputs.phone.disabled).toBe(true);

      // Select "New Patient" -> enabled
      await user.selectOptions(choose, "new");
      expect(inputs.first.disabled).toBe(false);
      expect(inputs.last.disabled).toBe(false);
      expect(inputs.birth.disabled).toBe(false);
      expect(inputs.sex.disabled).toBe(false);
      expect(inputs.country.disabled).toBe(false);
      expect(inputs.phone.disabled).toBe(false);
    });
  });
});