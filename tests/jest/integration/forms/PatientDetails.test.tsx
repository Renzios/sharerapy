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

function Wrapper({ disabled = false }: { disabled?: boolean }) {
  const countryOptions = useMemo<SelectOption[]>(
    () => [
      { value: "1", label: "Philippines" },
      { value: "2", label: "South Korea" },
    ],
    []
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
    <div>
      <h1>Patient Details</h1>
      <PatientDetails
        countryOptions={countryOptions}
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
        disabled={disabled}
      />
    </div>
  );
}

describe("PatientDetails form", () => {
  describe("Rendering", () => {
    it("renders heading and all labeled fields", () => {
      render(<Wrapper />);

      expect(
        screen.getByRole("heading", { name: /patient details/i })
      ).toBeInTheDocument();

      expect(screen.getByLabelText("Country")).toBeInTheDocument();
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Birthday")).toBeInTheDocument();
      expect(screen.getByLabelText("Sex")).toBeInTheDocument();
      expect(screen.getByLabelText("Contact Number")).toBeInTheDocument();
    });

    it("renders placeholders and required attributes correctly", () => {
      render(<Wrapper />);

      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // Placeholders
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
      expect(country.required).toBe(true);
      expect(first.required).toBe(true);
      expect(last.required).toBe(true);
      expect(birth.required).toBe(true);
      expect(sex.required).toBe(true);
      expect(phone.required).toBe(true);
    });

    it("renders all provided options for country and sex", () => {
      render(<Wrapper />);
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;

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
    it("allows typing into inputs and selecting options", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

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

    it("respects disabled state and prevents user input when disabled", async () => {
      const { rerender } = render(<Wrapper />);
      const user = userEvent.setup();

      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // Initial state: not disabled
      expect(first.disabled).toBe(false);
      expect(last.disabled).toBe(false);
      expect(birth.disabled).toBe(false);
      expect(sex.disabled).toBe(false);
      expect(country.disabled).toBe(false);
      expect(phone.disabled).toBe(false);

      // Type some values
      await user.type(first, "John");
      await user.type(last, "Doe");
      expect(first.value).toBe("John");
      expect(last.value).toBe("Doe");

      // Now render with disabled=true
      rerender(
        <Wrapper disabled={true} />
      );

      const firstDisabled = screen.getByLabelText("First Name") as HTMLInputElement;
      const lastDisabled = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birthDisabled = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sexDisabled = screen.getByLabelText("Sex") as HTMLSelectElement;
      const countryDisabled = screen.getByLabelText("Country") as HTMLSelectElement;
      const phoneDisabled = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // All fields should now be disabled
      expect(firstDisabled.disabled).toBe(true);
      expect(lastDisabled.disabled).toBe(true);
      expect(birthDisabled.disabled).toBe(true);
      expect(sexDisabled.disabled).toBe(true);
      expect(countryDisabled.disabled).toBe(true);
      expect(phoneDisabled.disabled).toBe(true);
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

      const country = screen.getByLabelText("Country") as HTMLSelectElement;
      const first = screen.getByLabelText("First Name") as HTMLInputElement;
      const last = screen.getByLabelText("Last Name") as HTMLInputElement;
      const birth = screen.getByLabelText("Birthday") as HTMLInputElement;
      const sex = screen.getByLabelText("Sex") as HTMLSelectElement;
      const phone = screen.getByLabelText("Contact Number") as HTMLInputElement;

      // Names from component props
      expect(country.name).toBe("country_id");
      expect(first.name).toBe("first_name");
      expect(last.name).toBe("last_name");
      expect(birth.name).toBe("birthdate");
      expect(sex.name).toBe("sex");
      expect(phone.name).toBe("contact_number");

      // IDs from instanceId or name
      expect(country.id).toBe("country-select");
      expect(sex.id).toBe("sex-select");
      expect(first.id).toBe("first_name");
      expect(last.id).toBe("last_name");
      expect(birth.id).toBe("birthdate");
      expect(phone.id).toBe("contact_number");

      // Labels correctly associated
      expect((screen.getByText("Country") as HTMLLabelElement).htmlFor).toBe(
        "country-select"
      );
      const sexLabel = sex.labels?.[0] as HTMLLabelElement | undefined;
      expect(sexLabel?.htmlFor).toBe("sex-select");
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
  });
});