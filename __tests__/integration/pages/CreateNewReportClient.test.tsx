import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateNewReportClient from "@/components/client-pages/CreateNewReportClient";
import type { Tables } from "@/lib/types/database.types";

// Local mock prop types to avoid using `any` which violates ESLint rules
interface Option {
  value: string;
  label: string;
}

interface PatientDetailsMockProps {
  setSelectedPatient?: (opt: Option) => void;
  setSelectedCountry?: (opt: Option) => void;
  setFirstName?: (v: string) => void;
  setLastName?: (v: string) => void;
  setBirthday?: (v: string) => void;
  setSelectedSex?: (opt: Option) => void;
  setContactNumber?: (v: string) => void;
}

interface ReportDetailsMockProps {
  setTitle?: (v: string) => void;
  setDescription?: (v: string) => void;
  setSelectedLanguage?: (opt: Option) => void;
  setSelectedTherapyType?: (opt: Option) => void;
}

interface EditorMockProps {
  value?: string;
  onChange?: (v: string) => void;
}

interface ToastMockProps {
  isVisible?: boolean;
  message?: string;
  onClose?: () => void;
}

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
    usePathname: jest.fn(),
  };
});

jest.mock("@/lib/actions/patients", () => ({
  createPatient: jest.fn(),
}));

jest.mock("@/lib/actions/reports", () => ({
  createReport: jest.fn(),
}));

// Mock child components used by the CreateNewReportClient to keep tests deterministic
jest.mock("@/components/forms/PatientDetails", () => {
  // mock implementation keeps an internal selected value and exposes a hidden input
  const Component = (props: PatientDetailsMockProps) => {
    const [selectedValue, setSelectedValue] = React.useState("new");

    return (
      <div data-testid="patient-details">
        {/* hidden input mirrors the patient selection so FormData picks it up reliably */}
        <input type="hidden" name="patient_id" value={selectedValue} />

        <select
          name="patient_id"
          data-testid="patient-select"
          value={selectedValue}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedValue(v);
            props.setSelectedPatient?.({ value: v, label: v });
          }}
        >
          <option value="new">Create New</option>
          <option value="pat-1">pat-1</option>
        </select>

        <select
          name="country_id"
          data-testid="country-select"
          onChange={(e) => props.setSelectedCountry?.({ value: e.target.value, label: e.target.value })}
        >
          <option value="">-</option>
          <option value="country1">Country1</option>
        </select>

        <input name="first_name" data-testid="first-name" onChange={(e) => props.setFirstName?.(e.target.value)} />
        <input name="last_name" data-testid="last-name" onChange={(e) => props.setLastName?.(e.target.value)} />
        <input name="birthdate" data-testid="birthdate" type="date" onChange={(e) => props.setBirthday?.(e.target.value)} />

        <select name="sex" data-testid="sex-select" onChange={(e) => props.setSelectedSex?.({ value: e.target.value, label: e.target.value })}>
          <option value="">-</option>
          <option value="M">M</option>
        </select>

        <input name="contact_number" data-testid="contact-number" onChange={(e) => props.setContactNumber?.(e.target.value)} />
      </div>
    );
  };
  Component.displayName = "PatientDetails";
  return Component;
});

jest.mock("@/components/forms/ReportDetails", () => {
  const Component = (props: ReportDetailsMockProps) => (
    <div data-testid="report-details">
      <input name="title" data-testid="title" onChange={(e) => props.setTitle?.(e.target.value)} />
      <input name="description" data-testid="description" onChange={(e) => props.setDescription?.(e.target.value)} />

      <select name="language_id" data-testid="language-select" onChange={(e) => props.setSelectedLanguage?.({ value: e.target.value, label: e.target.value })}>
        <option value="1">English</option>
      </select>
      <select name="type_id" data-testid="type-select" onChange={(e) => props.setSelectedTherapyType?.({ value: e.target.value, label: e.target.value })}>
        <option value="2">Assessment</option>
      </select>
    </div>
  );
  Component.displayName = "ReportDetails";
  return Component;
});

jest.mock("@/components/blocknote/DynamicEditor", () => ({
  Editor: (props: EditorMockProps) => (
    <div>
      <textarea data-testid="editor" value={props.value} onChange={(e) => props.onChange?.(e.target.value)} />
      {/* helper to set a valid non-empty editor content */}
      <button
        data-testid="set-editor"
        onClick={() => props.onChange?.('[{"type":"p","content":[{"text":"Hello"}]}]')}
      >
        set-editor
      </button>
    </div>
  ),
}));

jest.mock("@/components/forms/FileUpload", () => {
  const Component = (_props: unknown) => <div data-testid="file-upload">file-upload</div>;
  Component.displayName = "FileUpload";
  return Component;
});

jest.mock("@/components/general/Toast", () => {
  const Component = (props: ToastMockProps) => (
    <div data-testid="toast" data-visible={props.isVisible}>
      {props.message}
    </div>
  );
  Component.displayName = "Toast";
  return Component;
});

import { createPatient } from "@/lib/actions/patients";
import { createReport } from "@/lib/actions/reports";

describe("CreateNewReportClient integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createPatient as jest.Mock).mockResolvedValue({ id: "new-pat-id" });
    (createReport as jest.Mock).mockResolvedValue({ success: true });
  });

  // Helper to fill all required fields except the ones specified in `omit`
  const fillRequired = async (omit: string[] = []) => {
    if (!omit.includes("country-select"))
      fireEvent.change(screen.getByTestId("country-select"), { target: { value: "country1" } });
    if (!omit.includes("first-name"))
      fireEvent.change(screen.getByTestId("first-name"), { target: { value: "John" } });
    if (!omit.includes("last-name"))
      fireEvent.change(screen.getByTestId("last-name"), { target: { value: "Doe" } });
    if (!omit.includes("birthdate"))
      fireEvent.change(screen.getByTestId("birthdate"), { target: { value: "2000-01-01" } });
    if (!omit.includes("sex-select"))
      fireEvent.change(screen.getByTestId("sex-select"), { target: { value: "M" } });
    if (!omit.includes("contact-number"))
      fireEvent.change(screen.getByTestId("contact-number"), { target: { value: "09171234567" } });

    if (!omit.includes("title"))
      fireEvent.change(screen.getByTestId("title"), { target: { value: "My Report" } });
    if (!omit.includes("description"))
      fireEvent.change(screen.getByTestId("description"), { target: { value: "Short desc" } });
    if (!omit.includes("language-select"))
      fireEvent.change(screen.getByTestId("language-select"), { target: { value: "1" } });
    if (!omit.includes("type-select"))
      fireEvent.change(screen.getByTestId("type-select"), { target: { value: "2" } });

    // Editor
    if (!omit.includes("editor")) {
      fireEvent.click(screen.getByTestId("set-editor"));
      await waitFor(() =>
        expect(screen.getByTestId("editor")).toHaveValue(
          '[{"type":"p","content":[{"text":"Hello"}]}]'
        )
      );
    }
  };

  it("submits when creating a new patient and a report", async () => {
  const patients: Tables<"patients">[] = [];
    const patientOptions = [{ value: "new", label: "Create New" }];
    const countryOptions = [{ value: "country1", label: "Country1" }];
    const languageOptions = [{ value: "1", label: "English" }];
    const typeOptions = [{ value: "2", label: "Assessment" }];

    render(
      <CreateNewReportClient
        patients={patients}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );

    // Fill patient details (select 'new' is default but we still set fields)
    fireEvent.change(screen.getByTestId("country-select"), { target: { value: "country1" } });
    fireEvent.change(screen.getByTestId("first-name"), { target: { value: "John" } });
    fireEvent.change(screen.getByTestId("last-name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByTestId("birthdate"), { target: { value: "2000-01-01" } });
    fireEvent.change(screen.getByTestId("sex-select"), { target: { value: "M" } });
    fireEvent.change(screen.getByTestId("contact-number"), { target: { value: "09171234567" } });

    // Fill report details
    fireEvent.change(screen.getByTestId("title"), { target: { value: "My Report" } });
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Short desc" } });
    fireEvent.change(screen.getByTestId("language-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("type-select"), { target: { value: "2" } });

    // Set editor content using mock helper
    fireEvent.click(screen.getByTestId("set-editor"));

    // Submit the form by clicking the Submit button rendered by the real Button component
    const submitBtn = screen.getByText(/submit/i);
    fireEvent.click(submitBtn);

    // Wait for createPatient and createReport to be called
    await waitFor(() => expect(createPatient).toHaveBeenCalled());
    await waitFor(() => expect(createReport).toHaveBeenCalled());

  // Inspect the FormData passed to createReport
    const reportFormData = (createReport as jest.Mock).mock.calls[0][0] as FormData;
    expect(reportFormData.get("title")).toBe("My Report");
    expect(reportFormData.get("description")).toBe("Short desc");
    // editor content should be the JSON string we set in the mock Editor
    expect(reportFormData.get("content")).toContain('"text":"Hello"');
  });

  it("submits when selecting an existing patient and creating a report", async () => {
    const patients: Tables<"patients">[] = [
      {
        id: "pat-1",
        first_name: "Existing",
        last_name: "Patient",
        name: "Existing Patient",
        birthdate: "1990-05-05",
        contact_number: "09170000000",
        country_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sex: "Male",
      },
    ];
    const patientOptions = [{ value: "new", label: "Create New" }, { value: "pat-1", label: "Existing Patient" }];
    const countryOptions = [{ value: "country1", label: "Country1" }];
    const languageOptions = [{ value: "1", label: "English" }];
    const typeOptions = [{ value: "2", label: "Assessment" }];
    render(
      <CreateNewReportClient
        patients={patients}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );
    // Select existing patient
    fireEvent.change(screen.getByTestId("patient-select"), { target: { value: "pat-1" } });
    // Fill report details
    fireEvent.change(screen.getByTestId("title"), { target: { value: "Report for Existing" } });
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Existing patient report" } });
    fireEvent.change(screen.getByTestId("language-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("type-select"), { target: { value: "2" } });
    // Set editor content using mock helper
    fireEvent.click(screen.getByTestId("set-editor"));

    // Submit the form
    const submitBtn = screen.getByText(/submit/i);
    fireEvent.click(submitBtn);
    // Wait for createReport to be called (createPatient should not be called)
    await waitFor(() => expect(createReport).toHaveBeenCalled());
    expect(createPatient).not.toHaveBeenCalled();

    // Inspect the FormData passed to createReport
    const reportFormData = (createReport as jest.Mock).mock.calls[0][0] as FormData;
    expect(reportFormData.get("title")).toBe("Report for Existing");
    expect(reportFormData.get("description")).toBe("Existing patient report");
    expect(reportFormData.get("content")).toContain('"text":"Hello"');

    // patient_id should be the existing patient's ID
    expect(reportFormData.get("patient_id")).toBe("pat-1");

    });

    it("supports non-latin characters in patient and report details", async () => {
    const patients: Tables<"patients">[] = [];
    const patientOptions = [{ value: "new", label: "Create New" }];
    const countryOptions = [{ value: "country1", label: "Country1" }];
    const languageOptions = [{ value: "1", label: "English" }];
    const typeOptions = [{ value: "2", label: "Assessment" }];
    render(
      <CreateNewReportClient
        patients={patients}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );
    // Fill patient details with non-latin characters
    fireEvent.change(screen.getByTestId("first-name"), { target: { value: "张伟" } });
    fireEvent.change(screen.getByTestId("last-name"), { target: { value: "李" } });
    fireEvent.change(screen.getByTestId("contact-number"), { target: { value: "09179876543" } });
    fireEvent.change(screen.getByTestId("country-select"), { target: { value: "country1" } });
    fireEvent.change(screen.getByTestId("birthdate"), { target: { value: "2000-01-01" } });
    fireEvent.change(screen.getByTestId("sex-select"), { target: { value: "M" } });
    

    // Fill report details with non-latin characters
    fireEvent.change(screen.getByTestId("title"), { target: { value: "报告标题" } });
    fireEvent.change(screen.getByTestId("description"), { target: { value: "这是一个描述。" } });
    fireEvent.change(screen.getByTestId("language-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("type-select"), { target: { value: "2" } });
    // Set editor content using mock helper
    fireEvent.click(screen.getByTestId("set-editor"));
    // Submit the form
    const submitBtn = screen.getByText(/submit/i);
    fireEvent.click(submitBtn);
    // Wait for createPatient and createReport to be called
    await waitFor(() => expect(createPatient).toHaveBeenCalled());
    await waitFor(() => expect(createReport).toHaveBeenCalled());
    // Inspect the FormData passed to createPatient
    const patientFormData = (createPatient as jest.Mock).mock.calls[0][0] as FormData;
    expect(patientFormData.get("first_name")).toBe("张伟");
    expect(patientFormData.get("last_name")).toBe("李");
    expect(patientFormData.get("contact_number")).toBe("09179876543");
    // Inspect the FormData passed to createReport
    const reportFormData = (createReport as jest.Mock).mock.calls[0][0] as FormData;
    expect(reportFormData.get("title")).toBe("报告标题");
    expect(reportFormData.get("description")).toBe("这是一个描述。");
    expect(reportFormData.get("content")).toContain('"text":"Hello"');

    // patient_id should be the new patient's ID
    expect(reportFormData.get("patient_id")).toBe("new-pat-id");
  });

  // Validation toast tests for missing required fields
  const renderDefault = (patients: Tables<"patients">[] = []) => {
    const patientOptions = [{ value: "new", label: "Create New" }];
    const countryOptions = [{ value: "country1", label: "Country1" }];
    const languageOptions = [{ value: "1", label: "English" }];
    const typeOptions = [{ value: "2", label: "Assessment" }];
    render(
      <CreateNewReportClient
        patients={patients}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );
  };

  it("shows country required toast when country is missing", async () => {
    renderDefault();
    await fillRequired(["country-select"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please select patient's country");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows first name required toast when missing", async () => {
    renderDefault();
    await fillRequired(["first-name"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter patient's first name");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows last name required toast when missing", async () => {
    renderDefault();
    await fillRequired(["last-name"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter patient's last name");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows birthday required toast when missing", async () => {
    renderDefault();
    await fillRequired(["birthdate"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please select patient's birthday");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows sex required toast when missing", async () => {
    renderDefault();
    await fillRequired(["sex-select"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please select patient's sex");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows contact number required toast when missing", async () => {
    renderDefault();
    await fillRequired(["contact-number"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter patient's contact number");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows report title required toast when missing", async () => {
    renderDefault();
    await fillRequired(["title"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter report title");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows report description required toast when missing", async () => {
    renderDefault();
    await fillRequired(["description"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter report description");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows language required toast when missing", async () => {
    renderDefault();
    await fillRequired(["language-select"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please select report language");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows therapy type required toast when missing", async () => {
    renderDefault();
    await fillRequired(["type-select"]);
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please select therapy type");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows editor content required toast when content is empty", async () => {
    renderDefault();
    await fillRequired(["editor"]);

    fireEvent.click(screen.getByText(/submit/i));

    const toast = await screen.findByTestId("toast");

    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter report content");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows toast when editor content is invalid JSON", async () => {
    renderDefault();
    // fill other required fields but leave editor so we can set an invalid value
    await fillRequired(["editor"]);

    // set editor to invalid JSON
    fireEvent.change(screen.getByTestId("editor"), { target: { value: "not-a-json" } });

    fireEvent.click(screen.getByText(/submit/i));

    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    // parse error should show the generic 'Please enter report content' error per component behavior
    expect(toast).toHaveTextContent("Please enter report content");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows invalid format toast when editor JSON is not an array", async () => {
    renderDefault();
    await fillRequired(["editor"]);

    // JSON that parses but is not an array
    fireEvent.change(screen.getByTestId("editor"), { target: { value: JSON.stringify({ foo: "bar" }) } });

    fireEvent.click(screen.getByText(/submit/i));

    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Invalid report content format");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("shows toast when editor JSON is an array but contains only empty blocks", async () => {
    renderDefault();
    await fillRequired(["editor"]);

    const emptyBlocks = JSON.stringify([
      { type: "p", content: [{ text: "" }] },
      { type: "p", content: [{ text: "" }] },
    ]);

    fireEvent.change(screen.getByTestId("editor"), { target: { value: emptyBlocks } });

    fireEvent.click(screen.getByText(/submit/i));

    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Please enter report content");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("calls createReport on successful submission and does not show a local success/error toast (redirects)", async () => {
    const patients: Tables<"patients">[] = [];
    const patientOptions = [{ value: "new", label: "Create New" }];
    const countryOptions = [{ value: "country1", label: "Country1" }];
    const languageOptions = [{ value: "1", label: "English" }];
    const typeOptions = [{ value: "2", label: "Assessment" }];
    render(
      <CreateNewReportClient
        patients={patients}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );

    // Fill minimal required fields
    fireEvent.change(screen.getByTestId("first-name"), { target: { value: "John" } });
    fireEvent.change(screen.getByTestId("last-name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByTestId("birthdate"), { target: { value: "2000-01-01" } });
    fireEvent.change(screen.getByTestId("sex-select"), { target: { value: "M" } });
    fireEvent.change(screen.getByTestId("contact-number"), { target: { value: "09171234567" } });
    fireEvent.change(screen.getByTestId("country-select"), { target: { value: "country1" } });

    fireEvent.change(screen.getByTestId("title"), { target: { value: "My Report" } });
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Short desc" } });
    fireEvent.change(screen.getByTestId("language-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("type-select"), { target: { value: "2" } });

    // Set editor content directly
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '[{"type":"p","content":[{"text":"Hello"}]}]' },
    });

    await waitFor(() =>
      expect(screen.getByTestId("editor")).toHaveValue(
        '[{"type":"p","content":[{"text":"Hello"}]}]'
      )
    );

    // Submit the form
    const submitBtn = screen.getByText(/submit/i);
    fireEvent.click(submitBtn);

    // createReport should be called. The component triggers a redirect on success
    await waitFor(() => expect(createReport).toHaveBeenCalled());

  });

  it("shows an error toast when birthdate is in the future", async () => {
    renderDefault();
    await fillRequired();
    // Set birthdate to a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateStr = futureDate.toISOString().split("T")[0];
    fireEvent.change(screen.getByTestId("birthdate"), { target: { value: futureDateStr } });
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");
    expect(toast).toHaveAttribute("data-visible", "true");
    expect(toast).toHaveTextContent("Birthday cannot be in the future");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("should not create a report when the contact number is not a number", async () => {
    renderDefault();
    await fillRequired();
    // Set contact number to a non-numeric value
    fireEvent.change(screen.getByTestId("contact-number"), { target: { value: "invalid-number" } });
    fireEvent.click(screen.getByText(/submit/i));
    const toast = await screen.findByTestId("toast");

    await waitFor(() => expect(createReport).not.toHaveBeenCalled());
  });

  it("clears the forms when Clear Form button is clicked", async () => {
    renderDefault();
    await fillRequired();
    // Click the Clear Form button
    const clearBtn = screen.getByText(/clear form/i);
    fireEvent.click(clearBtn);
    // Assert all fields are reset
    expect(screen.getByTestId("patient-select")).toHaveValue("new");
    expect(screen.getByTestId("country-select")).toHaveValue("");
    expect(screen.getByTestId("first-name")).toHaveValue("");
    expect(screen.getByTestId("last-name")).toHaveValue("");
    expect(screen.getByTestId("birthdate")).toHaveValue("");
    expect(screen.getByTestId("sex-select")).toHaveValue("");
    expect(screen.getByTestId("contact-number")).toHaveValue("");
    expect(screen.getByTestId("title")).toHaveValue("");
    expect(screen.getByTestId("description")).toHaveValue("");
    expect(screen.getByTestId("language-select")).toHaveValue("1");
    expect(screen.getByTestId("type-select")).toHaveValue("2");
    expect(screen.getByTestId("editor")).toHaveValue("");
  });
});
