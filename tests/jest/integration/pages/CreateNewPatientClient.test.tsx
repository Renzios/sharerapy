import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateNewPatientClient from "@/components/client-pages/create-edit/CreateNewPatientClient";
import { createPatient, updatePatient } from "@/lib/actions/patients";

// Mock actions
jest.mock("@/lib/actions/patients", () => ({
  createPatient: jest.fn(),
  updatePatient: jest.fn(),
}));

// Mock useBackNavigation hook
const mockHandleBackClick = jest.fn();
jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: () => ({
    handleBackClick: mockHandleBackClick,
  }),
}));

// Mock validateContactNumber utility
jest.mock("@/lib/utils/frontendHelpers", () => ({
  validateContactNumber: jest.fn((contact: string) => /^[0-9-]+$/.test(contact)),
}));

// Mock Button component
jest.mock("@/components/general/Button", () => {
  const Component = ({
    children,
    onClick,
    type,
    variant,
    className,
    disabled,
    id,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
    variant?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
  }) => (
    <button
      onClick={onClick}
      type={type as "button" | "submit" | "reset"}
      data-variant={variant}
      className={className}
      disabled={disabled}
      id={id}
      data-testid={id}
    >
      {children}
    </button>
  );
  Component.displayName = "Button";
  return Component;
});

// Mock Toast component
jest.mock("@/components/general/Toast", () => {
  const Component = ({
    message,
    type,
    isVisible,
    onClose,
  }: {
    message: string;
    type: string;
    isVisible: boolean;
    onClose: () => void;
  }) =>
    isVisible ? (
      <div data-testid="toast" data-type={type}>
        {message}
        <button onClick={onClose} data-testid="toast-close">
          Close
        </button>
      </div>
    ) : null;
  Component.displayName = "Toast";
  return Component;
});

// Mock ConfirmationModal component
jest.mock("@/components/general/ConfirmationModal", () => {
  const Component = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    confirmButtonID,
    cancelButtonID,
  }: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonID: string;
    cancelButtonID: string;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button id={confirmButtonID} onClick={onConfirm}>
          {confirmText}
        </button>
        <button id={cancelButtonID} onClick={onCancel}>
          {cancelText}
        </button>
      </div>
    ) : null;
  Component.displayName = "ConfirmationModal";
  return Component;
});

// Mock PatientDetails component
jest.mock("@/components/forms/PatientDetails", () => {
  const Component = ({
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
    disabled,
    ids,
  }: any) => (
    <div data-testid="patient-details-form">
      <input
        data-testid="first-name-input"
        id={ids?.firstNameInputId}
        name="first_name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={disabled}
        placeholder="First Name"
      />
      <input
        data-testid="last-name-input"
        id={ids?.lastNameInputId}
        name="last_name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        disabled={disabled}
        placeholder="Last Name"
      />
      <input
        data-testid="birthday-input"
        id={ids?.birthdayInputId}
        name="birthdate"
        type="date"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        disabled={disabled}
      />
      <input
        data-testid="contact-number-input"
        id={ids?.contactNumberInputId}
        name="contact_number"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        disabled={disabled}
        placeholder="Contact Number"
      />
      <select
        data-testid="country-select"
        id={ids?.countrySelectId}
        name="country_id"
        value={selectedCountry?.value || ""}
        onChange={(e) => {
          const option = countryOptions.find(
            (opt: any) => opt.value === e.target.value
          );
          setSelectedCountry(option || null);
        }}
        disabled={disabled}
      >
        <option value="">Select Country</option>
        {countryOptions.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        data-testid="sex-select"
        id={ids?.sexSelectId}
        name="sex"
        value={selectedSex?.value || ""}
        onChange={(e) => {
          setSelectedSex(
            e.target.value ? { value: e.target.value, label: e.target.value } : null
          );
        }}
        disabled={disabled}
      >
        <option value="">Select Sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
  );
  Component.displayName = "PatientDetails";
  return Component;
});

describe("CreateNewPatientClient", () => {
  const defaultCountryOptions = [
    { value: "1", label: "Philippines" },
    { value: "2", label: "United States" },
    { value: "3", label: "Japan" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (createPatient as jest.Mock).mockResolvedValue({ success: true });
    (updatePatient as jest.Mock).mockResolvedValue({ success: true });
  });

  describe("Rendering - Create Mode", () => {
    it("renders create form with all fields", () => {
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      expect(screen.getByText("Create New Patient")).toBeInTheDocument();
      expect(screen.getByText("Enter details to register a patient.")).toBeInTheDocument();
      expect(screen.getByTestId("patient-details-form")).toBeInTheDocument();
      expect(screen.getByTestId("first-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("last-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("birthday-input")).toBeInTheDocument();
      expect(screen.getByTestId("contact-number-input")).toBeInTheDocument();
      expect(screen.getByTestId("country-select")).toBeInTheDocument();
      expect(screen.getByTestId("sex-select")).toBeInTheDocument();
    });

    it("renders Clear Form and Create buttons", () => {
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      expect(screen.getByText("Clear Form")).toBeInTheDocument();
      expect(screen.getByText("Create")).toBeInTheDocument();
    });

    it("does not render Back button in create mode", () => {
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });

    it("initializes with empty form fields", () => {
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      expect((screen.getByTestId("first-name-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("last-name-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("birthday-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("contact-number-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("country-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("sex-select") as HTMLSelectElement).value).toBe("");
    });
  });

  describe("Rendering - Edit Mode", () => {
    const initialData = {
      firstName: "John",
      lastName: "Doe",
      birthday: "1990-01-15",
      contactNumber: "09171234567",
      countryId: "1",
      sex: "Male",
    };

    it("renders edit form with title and description", () => {
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      expect(screen.getByText("Edit Patient")).toBeInTheDocument();
      expect(screen.getByText("Update patient details below.")).toBeInTheDocument();
    });

    it("renders Back button in edit mode", () => {
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      expect(screen.getByText("Back")).toBeInTheDocument();
    });

    it("renders Update button instead of Create", () => {
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      expect(screen.getByText("Update")).toBeInTheDocument();
      expect(screen.queryByText("Create")).not.toBeInTheDocument();
    });

    it("pre-fills form with initial data", () => {
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      expect((screen.getByTestId("first-name-input") as HTMLInputElement).value).toBe("John");
      expect((screen.getByTestId("last-name-input") as HTMLInputElement).value).toBe("Doe");
      expect((screen.getByTestId("birthday-input") as HTMLInputElement).value).toBe("1990-01-15");
      expect((screen.getByTestId("contact-number-input") as HTMLInputElement).value).toBe(
        "09171234567"
      );
      expect((screen.getByTestId("country-select") as HTMLSelectElement).value).toBe("1");
      expect((screen.getByTestId("sex-select") as HTMLSelectElement).value).toBe("Male");
    });

    it("supports non-latin characters in initial data", () => {
      const internationalData = {
        ...initialData,
        firstName: "田中",
        lastName: "太郎",
      };

      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={internationalData}
          patientId="patient-123"
        />
      );

      expect((screen.getByTestId("first-name-input") as HTMLInputElement).value).toBe("田中");
      expect((screen.getByTestId("last-name-input") as HTMLInputElement).value).toBe("太郎");
    });
  });

  describe("Form Validation", () => {
    it("shows error when first name is missing", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        const toast = screen.getByTestId("toast");
        expect(toast).toHaveTextContent("Please enter first name");
        expect(toast).toHaveAttribute("data-type", "error");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when last name is missing", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent("Please enter last name");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when country is not selected", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent("Please select a country");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when birthday is missing", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent("Please select a birthday");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when birthday is in the future", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split("T")[0];

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), futureDateString);

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent("Birthday cannot be in the future");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when sex is not selected", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent("Please select sex");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when contact number is missing", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent("Please enter contact number");
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("shows error when contact number has invalid characters", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");
      await user.type(screen.getByTestId("contact-number-input"), "abc123xyz");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toHaveTextContent(
          "Contact number can only contain numbers and dashes (-)"
        );
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("accepts valid contact number with dashes", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");
      await user.type(screen.getByTestId("contact-number-input"), "0917-123-4567");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(createPatient).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Create Mode", () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");
      await user.type(screen.getByTestId("contact-number-input"), "09171234567");
    };

    it("calls createPatient with form data on valid submission", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await fillValidForm(user);

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(createPatient).toHaveBeenCalled();
      });
    });

    it("disables form during submission", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await fillValidForm(user);

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      // Immediately check if button is disabled
      expect(submitButton).toBeDisabled();
    });

    it("supports non-latin characters in form submission", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "李");
      await user.type(screen.getByTestId("last-name-input"), "明");
      await user.selectOptions(screen.getByTestId("country-select"), "3");
      await user.type(screen.getByTestId("birthday-input"), "1985-05-20");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");
      await user.type(screen.getByTestId("contact-number-input"), "09001234567");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(createPatient).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Edit Mode", () => {
    const initialData = {
      firstName: "John",
      lastName: "Doe",
      birthday: "1990-01-15",
      contactNumber: "09171234567",
      countryId: "1",
      sex: "Male",
    };

    it("calls updatePatient with patientId and form data", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const firstNameInput = screen.getByTestId("first-name-input");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(updatePatient).toHaveBeenCalledWith("patient-123", expect.any(FormData));
      });

      expect(createPatient).not.toHaveBeenCalled();
    });

    it("does not call createPatient in edit mode", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(updatePatient).toHaveBeenCalled();
      });

      expect(createPatient).not.toHaveBeenCalled();
    });
  });

  describe("Clear Form Functionality", () => {
    it("clears all form fields when Clear Form is clicked", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");
      await user.type(screen.getByTestId("contact-number-input"), "09171234567");

      const clearButton = screen.getByTestId("create-patient-clear-form-btn");
      await user.click(clearButton);

      expect((screen.getByTestId("first-name-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("last-name-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("country-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("birthday-input") as HTMLInputElement).value).toBe("");
      expect((screen.getByTestId("sex-select") as HTMLSelectElement).value).toBe("");
      expect((screen.getByTestId("contact-number-input") as HTMLInputElement).value).toBe("");
    });
  });

  describe("Back Navigation in Edit Mode", () => {
    const initialData = {
      firstName: "John",
      lastName: "Doe",
      birthday: "1990-01-15",
      contactNumber: "09171234567",
      countryId: "1",
      sex: "Male",
    };

    it("navigates back immediately when no changes were made", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(mockHandleBackClick).toHaveBeenCalled();
      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
    });

    it("shows confirmation modal when unsaved changes exist", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const firstNameInput = screen.getByTestId("first-name-input");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();
      expect(mockHandleBackClick).not.toHaveBeenCalled();
    });

    it("navigates back when Leave is confirmed in modal", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const firstNameInput = screen.getByTestId("first-name-input");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      const confirmButton = screen.getByText("Leave");
      await user.click(confirmButton);

      expect(mockHandleBackClick).toHaveBeenCalled();
    });

    it("stays on page when Stay is clicked in modal", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const firstNameInput = screen.getByTestId("first-name-input");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      const cancelButton = screen.getByText("Stay");
      await user.click(cancelButton);

      expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
      expect(mockHandleBackClick).not.toHaveBeenCalled();
    });

    it("detects changes in any field", async () => {
      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      // Change contact number
      const contactInput = screen.getByTestId("contact-number-input");
      await user.clear(contactInput);
      await user.type(contactInput, "09189999999");

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
    });
  });

  describe("Toast Notifications", () => {
    it("shows and can close toast messages", async () => {
      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("toast")).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId("toast-close");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("shows error toast when createPatient fails", async () => {
      const errorMessage = "Network error";
      (createPatient as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const user = userEvent.setup();
      render(<CreateNewPatientClient countryOptions={defaultCountryOptions} />);

      await user.type(screen.getByTestId("first-name-input"), "John");
      await user.type(screen.getByTestId("last-name-input"), "Doe");
      await user.selectOptions(screen.getByTestId("country-select"), "1");
      await user.type(screen.getByTestId("birthday-input"), "1990-01-01");
      await user.selectOptions(screen.getByTestId("sex-select"), "Male");
      await user.type(screen.getByTestId("contact-number-input"), "09171234567");

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        const toast = screen.getByTestId("toast");
        expect(toast).toHaveTextContent("Error creating patient");
        expect(toast).toHaveAttribute("data-type", "error");
      });
    });

    it("shows error toast when updatePatient fails", async () => {
      const errorMessage = "Update failed";
      (updatePatient as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const initialData = {
        firstName: "John",
        lastName: "Doe",
        birthday: "1990-01-15",
        contactNumber: "09171234567",
        countryId: "1",
        sex: "Male",
      };

      const user = userEvent.setup();
      render(
        <CreateNewPatientClient
          countryOptions={defaultCountryOptions}
          mode="edit"
          initialData={initialData}
          patientId="patient-123"
        />
      );

      const submitButton = screen.getByTestId("create-patient-submit-btn");
      await user.click(submitButton);

      await waitFor(() => {
        const toast = screen.getByTestId("toast");
        expect(toast).toHaveTextContent("Error updating patient");
        expect(toast).toHaveAttribute("data-type", "error");
      });
    });
  });
});
