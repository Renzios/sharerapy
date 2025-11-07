import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportDetails from "@/components/forms/ReportDetails";

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
};

type TextAreaProps = {
  label?: string;
  name?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
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
        />
      </div>
    );
  },
}));

// Mock TextArea as a standard textarea with accessible label
jest.mock("@/components/general/TextArea", () => ({
  __esModule: true,
  default: (props: TextAreaProps) => {
    const {
      label,
      name,
      value,
      onChange,
      required,
      maxLength,
      rows,
      placeholder,
    } = props;
    const id = name || "textarea-id";
    return (
      <div>
        {label && (
          <label htmlFor={id} style={{ display: "block" }}>
            {label}
          </label>
        )}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          rows={rows}
          placeholder={placeholder}
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
  }
}));

function Wrapper() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<SelectOption | null>(
    null
  );
  const [selectedTherapyType, setSelectedTherapyType] =
    useState<SelectOption | null>(null);

  const languageOptions: SelectOption[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
  ];
  const typeOptions: SelectOption[] = [
    { value: "cbt", label: "CBT" },
    { value: "psycho", label: "Psychodynamic" },
  ];

  return (
    <ReportDetails
      languageOptions={languageOptions}
      typeOptions={typeOptions}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      selectedLanguage={selectedLanguage}
      setSelectedLanguage={setSelectedLanguage}
      selectedTherapyType={selectedTherapyType}
      setSelectedTherapyType={setSelectedTherapyType}
    />
  );
}

describe("ReportDetails form", () => {
  describe("Rendering", () => {
    it("renders heading and all labeled fields", () => {
      render(<Wrapper />);

      expect(
        screen.getByRole("heading", { name: /report details/i })
      ).toBeInTheDocument();

      // Inputs by label
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Language")).toBeInTheDocument();
      expect(screen.getByLabelText("Therapy Type")).toBeInTheDocument();
    });

    it("renders input and select placeholders correctly", () => {
      render(<Wrapper />);

      const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
      expect(titleInput.placeholder).toBe("Enter report title");
      const desc = screen.getByLabelText("Description") as HTMLTextAreaElement;
      expect(desc.placeholder).toBe("Enter report description");

      const lang = screen.getByLabelText("Language") as HTMLSelectElement;
      const langPlaceholder = lang.querySelector("option[value='']");
      expect(langPlaceholder).not.toBeNull();
      expect(langPlaceholder?.textContent).toBe("Select language...");
      const therapy = screen.getByLabelText("Therapy Type") as HTMLSelectElement;
      const therapyPlaceholder = therapy.querySelector("option[value='']");
      expect(therapyPlaceholder).not.toBeNull();
      expect(therapyPlaceholder?.textContent).toBe("Select therapy type...");
    });

    it("renders all provided select options", () => {
      render(<Wrapper />);
      const lang = screen.getByLabelText("Language") as HTMLSelectElement;
      const therapy = screen.getByLabelText("Therapy Type") as HTMLSelectElement;
      // Language options
      expect(lang.options.length).toBe(3); // including placeholder
      expect(lang.options[1].value).toBe("en");
      expect(lang.options[1].text).toBe("English");
      expect(lang.options[2].value).toBe("es");
      expect(lang.options[2].text).toBe("Spanish");

      // Therapy type options
      expect(therapy.options.length).toBe(3); // including placeholder
      expect(therapy.options[1].value).toBe("cbt");
      expect(therapy.options[1].text).toBe("CBT");
      expect(therapy.options[2].value).toBe("psycho");
      expect(therapy.options[2].text).toBe("Psychodynamic");
    });
  });

  describe("User Interaction", () => {
    test("title input updates on typing", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
      
      expect(titleInput.name).toBe("title");
      expect(titleInput.placeholder).toBe("Enter report title");

      await user.type(titleInput, "My New Report");
      expect(titleInput.value).toBe("My New Report");
    });

    test("description textarea updates on typing", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const desc = screen.getByLabelText("Description") as HTMLTextAreaElement;
      expect(desc.required).toBe(true);

      expect(desc.name).toBe("description");

      await user.type(desc, "This is a description");
      expect(desc.value).toBe("This is a description");
    });

    test("language select is required, shows placeholder, and updates selection", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const lang = screen.getByLabelText("Language") as HTMLSelectElement;
      expect(lang.required).toBe(true);
      expect(lang.name).toBe("language_id");

      // Placeholder option exists
      const placeholderOption = lang.querySelector("option[value='']");
      expect(placeholderOption).not.toBeNull();
      expect(placeholderOption?.textContent).toBe("Select language...");

      // Change selection
      await user.selectOptions(lang, "en");
      expect(lang.value).toBe("en");
      expect(lang.options[lang.selectedIndex].text).toBe("English");

      await user.selectOptions(lang, "es");
      expect(lang.value).toBe("es");
      expect(lang.options[lang.selectedIndex].text).toBe("Spanish");
    });

    test("therapy type select is required, shows placeholder, and updates selection", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();

      const therapy = screen.getByLabelText("Therapy Type") as HTMLSelectElement;
      expect(therapy.required).toBe(true);
      expect(therapy.name).toBe("type_id");

      const placeholderOption = therapy.querySelector("option[value='']");
      expect(placeholderOption).not.toBeNull();
      expect(placeholderOption?.textContent).toBe("Select therapy type...");

      await user.selectOptions(therapy, "cbt");
      expect(therapy.value).toBe("cbt");
      expect(therapy.options[therapy.selectedIndex].text).toBe("CBT");

      await user.selectOptions(therapy, "psycho");
      expect(therapy.value).toBe("psycho");
      expect(therapy.options[therapy.selectedIndex].text).toBe("Psychodynamic");
    });

    it("supports non-latin characters in title and description", async () => {
      render(<Wrapper />);
      const user = userEvent.setup();
      const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
      const desc = screen.getByLabelText("Description") as HTMLTextAreaElement;

      const nonLatinTitle = "レポートタイトル";
      const nonLatinDesc = "これは説明です。";

      await user.type(titleInput, nonLatinTitle);
      expect(titleInput.value).toBe(nonLatinTitle);
      
      await user.type(desc, nonLatinDesc);
      expect(desc.value).toBe(nonLatinDesc);
    });
    
    describe("Edge Cases", () => {
      it("allows selecting the same language option multiple times without error", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const lang = screen.getByLabelText("Language") as HTMLSelectElement;

        await user.selectOptions(lang, "en");
        expect(lang.value).toBe("en");
        await user.selectOptions(lang, "en");
        expect(lang.value).toBe("en");
      });

      it("allows selecting the same therapy type option multiple times without error", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const therapy = screen.getByLabelText(
          "Therapy Type"
        ) as HTMLSelectElement;
        await user.selectOptions(therapy, "cbt");
        expect(therapy.value).toBe("cbt");
        await user.selectOptions(therapy, "cbt");
        expect(therapy.value).toBe("cbt");
      });

      it("does not allow title input to exceed maxLength when typing", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
        const longText = "a".repeat(150);

        await user.type(titleInput, longText);
        expect(titleInput.value.length).toBe(100);
      });

      it("does not allow description textarea to exceed maxLength when typing", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const desc = screen.getByLabelText("Description") as HTMLTextAreaElement;
        const longText = "b".repeat(600);
        await user.type(desc, longText);
        expect(desc.value.length).toBe(500);
      });

      it("allows special characters in title input", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
        const specialText = "{}!@#$%^&*()_+|:\"<>?-=[]\\;',./`~";
        await user.clear(titleInput);
        await user.paste(specialText);
        expect(titleInput.value).toBe(specialText);
      });

      it("allows special characters in description textarea", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const desc = screen.getByLabelText("Description") as HTMLTextAreaElement;
        const specialText = "{}!@#$%^&*()_+|:\"<>?-=[]\\;',./`~";
        await user.clear(desc);
        await user.paste(specialText);
        expect(desc.value).toBe(specialText);
      });

      it("truncates pasted text exceeding maxLength in title input", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
        const longText = "c".repeat(150);
        await user.clear(titleInput);
        await user.paste(longText);
        expect(titleInput.value.length).toBe(100);
      });

      it("truncates pasted text exceeding maxLength in description textarea", async () => {
        render(<Wrapper />);
        const user = userEvent.setup();
        const desc = screen.getByLabelText("Description") as HTMLTextAreaElement;
        const longText = "d".repeat(600);
        await user.clear(desc);
        await user.paste(longText);
        expect(desc.value.length).toBe(500);
      });
    });
  });
});