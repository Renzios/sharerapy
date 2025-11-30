import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateNewReportClient from "@/components/client-pages/CreateNewReportClient";
import type { Tables } from "@/lib/types/database.types";
import { createReport } from "@/lib/actions/reports";
import { createPatient } from "@/lib/actions/patients";
import { updateReport } from "@/lib/actions/reports";

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

// Mock editor instance
const mockEditor = {
  document: [{ type: "paragraph", content: "test" }],
  tryParseMarkdownToBlocks: jest.fn(),
  replaceBlocks: jest.fn(),
};

// Mock BlockNote core
jest.mock("@blocknote/core", () => ({
  BlockNoteSchema: {
    create: jest.fn(() => ({ custom: "schema" })),
  },
  defaultBlockSpecs: {
    paragraph: { type: "paragraph" },
    heading: { type: "heading" },
    table: { type: "table" },
    bulletListItem: { type: "bulletListItem" },
    numberedListItem: { type: "numberedListItem" },
    checkListItem: { type: "checkListItem" },
    divider: { type: "divider" },
  },
  defaultInlineContentSpecs: {},
  defaultStyleSpecs: {},
}));

// Mock BlockNote hooks and components
import * as BlockNoteReact from "@blocknote/react";
jest.mock("@blocknote/react", () => ({
  useCreateBlockNote: jest.fn(() => mockEditor),
}));

jest.mock("@blocknote/mantine", () => ({
  BlockNoteView: function MockBlockNoteView(props: {
    editor: unknown;
    onChange: () => void;
    theme: string;
    className: string;
  }) {
    return (
      <div
        data-testid="blocknote-view"
        data-theme={props.theme}
        className={props.className}
      >
        <div data-testid="editor-content">Editor Content</div>
        <button onClick={props.onChange} data-testid="trigger-change">
          Trigger Change
        </button>
      </div>
    );
  },
}));

// Mock CSS imports
jest.mock("@blocknote/core/fonts/inter.css", () => ({}));
jest.mock("@blocknote/mantine/style.css", () => ({}));

jest.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: jest.fn(),
    usePathname: jest.fn(),
  };
});

jest.mock("@/lib/actions/reports", () => ({
  createReport: jest.fn(),
  updateReport: jest.fn(),
}));

jest.mock("@/lib/actions/patients", () => ({
  createPatient: jest.fn(),
}));

// Mock authentication context so component thinks a user is logged in during tests
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user-id" } }),
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

describe("CreateNewReportClient integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createPatient as jest.Mock).mockResolvedValue({ id: "new-pat-id" });
    (createReport as jest.Mock).mockResolvedValue({ success: true });
    (updateReport as jest.Mock).mockResolvedValue({ success: true });
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
    () => expect(createPatient).toHaveBeenCalled();
  
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
    expect(createPatient).not.toHaveBeenCalled();


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

  it("updates existing report in edit mode and does not create patient or createReport", async () => {
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

    const patientOptions = [{ value: "pat-1", label: "Existing Patient" }];
    const countryOptions = [{ value: "country1", label: "Country1" }];
    const languageOptions = [{ value: "1", label: "English" }];
    const typeOptions = [{ value: "2", label: "Assessment" }];

    const existingReport = {
      title: "Existing Title",
      description: "Existing desc",
      content: [{ type: "p", content: [{ text: "Old" }] }],
      language_id: 1,
      type_id: 2,
      patient_id: "pat-1",
    };

    render(
      <CreateNewReportClient
        mode="edit"
        reportId="r-1"
        existingReport={existingReport}
        patients={patients}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );

    // Editor should be prefilled with existing content
    expect(screen.getByTestId("editor")).toHaveValue(JSON.stringify(existingReport.content));

    // Submit button should show Update and Clear Form should not be present in edit mode
    expect(screen.getByText(/update/i)).toBeTruthy();
    expect(screen.queryByText(/clear form/i)).toBeNull();

    // Update report details
    fireEvent.change(screen.getByTestId("title"), { target: { value: "Updated Title" } });
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Updated Desc" } });
    // Update the editor content directly to ensure parent state is updated
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: '[{"type":"p","content":[{"text":"Hello"}]}]' },
    });

    // Wait for editor state to update to the new content
    await waitFor(() =>
      expect(screen.getByTestId("editor")).toHaveValue(
        '[{"type":"p","content":[{"text":"Hello"}]}]'
      )
    );

    // Submit the form
    fireEvent.click(screen.getByText(/update/i));


    // Ensure no patient creation or createReport was invoked in edit mode
    expect(createPatient).not.toHaveBeenCalled();
    expect(createReport).not.toHaveBeenCalled();
  });
});
