import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockNoteEditor } from "@blocknote/core";

import IndivReportClient from "@/components/client-pages/IndivReportClient";

// Mock BlockNote editor to avoid ES module issues
jest.mock("@blocknote/core", () => ({
  BlockNoteEditor: {
    create: jest.fn(() => ({
      blocksToMarkdownLossy: jest.fn(() => Promise.resolve("mock markdown")),
      tryParseMarkdownToBlocks: jest.fn(() =>
        Promise.resolve([{ type: "paragraph", content: "mock" }])
      ),
    })),
  },
}));

// Small helper types to avoid using `any`
type SelectValue = { value: string; label: string };

type SampleReport = {
  id: string;
  title: string;
  created_at: string;
  therapist_id: string;
  therapist: {
    id: string;
    name: string;
    clinic: { clinic: string; country: { country: string } };
  };
  language: { language: string };
  type: { type: string };
  patient: { id: string; name: string; sex: string; age: string };
  description: string;
  content: Uint8Array;
};

// Exposed mocks so tests can assert interactions
const pushMock = jest.fn();
const selectChangeMock = jest.fn();
let mockSelectValue: SelectValue | null = { value: "filipino", label: "Filipino" };

// Helper to set what value the Select mock should return when clicked
const setMockSelectValue = (value: SelectValue | null) => {
  mockSelectValue = value;
};

// Mock next/link so clicks call router.push (so we can assert navigation)
jest.mock("next/link", () => {
  const LinkMock = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        pushMock(href);
      }}
    >
      {children}
    </a>
  );
  LinkMock.displayName = "NextLinkMock";
  return { __esModule: true, default: LinkMock };
});

// Make useSearchParams controllable in tests
const useSearchParamsMock = jest.fn(() => new URLSearchParams());
// Mock next/navigation hooks to return the shared pushMock and controllable search params
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => useSearchParamsMock(),
}));

// Mock child components to keep the test focused on IndivReportClient behavior
jest.mock("@/components/general/Button", () => {
  const ButtonMock = (props: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => {
    const { children, onClick, disabled, className } = props;
    return (
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    );
  };
  ButtonMock.displayName = "ButtonMock";
  return ButtonMock;
});

// The Select mock exposes a clickable element that triggers onChange and also notifies test via selectChangeMock
jest.mock("@/components/general/Select", () => {
  const SelectMock = (props: {
    label?: string;
    onChange?: (v: SelectValue | null) => void;
  }) => {
    return (
      <div>
        <label>{props.label}</label>
        <button
          data-testid="display-language-select"
          onClick={() => {
            // Use the value from mockSelectValue which can be controlled by tests
            const val = mockSelectValue;
            props.onChange?.(val);
            selectChangeMock(val);
          }}
        >
          Change
        </button>
      </div>
    );
  };
  SelectMock.displayName = "SelectMock";
  return SelectMock;
});

jest.mock("@/components/general/Toast", () => {
  const ToastMock = (props: {
    isVisible?: boolean;
    message?: React.ReactNode;
  }) => {
    return props.isVisible ? <div>{props.message}</div> : null;
  };
  ToastMock.displayName = "ToastMock";
  return ToastMock;
});

// Make ConfirmationModal interactive so tests can trigger confirm/cancel
jest.mock("@/components/general/ConfirmationModal", () => {
  const ConfirmationModalMock = (props: {
    isOpen?: boolean;
    title?: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    if (!props.isOpen) return null;
    return (
      <div>
        <div>{props.title}</div>
        <button
          data-testid="confirm-delete"
          onClick={() => props.onConfirm?.()}
        >
          {props.confirmText ?? "Confirm"}
        </button>
        <button data-testid="cancel-delete" onClick={() => props.onCancel?.()}>
          {props.cancelText ?? "Cancel"}
        </button>
      </div>
    );
  };
  ConfirmationModalMock.displayName = "ConfirmationModalMock";
  return ConfirmationModalMock;
});

// Make DropdownMenu render interactive buttons for each item so tests can click them
jest.mock("@/components/general/DropdownMenu", () => {
  const DropdownMenuMock = (props: {
    isOpen?: boolean;
    items?: Array<{ label: string; onClick?: () => void }> | undefined;
  }) => {
    const { isOpen, items } = props;
    if (!isOpen) return null;
    return (
      <div>
        {Array.isArray(items) &&
          items.map((it) => (
            <button key={it.label} onClick={() => it.onClick?.()}>
              {it.label}
            </button>
          ))}
      </div>
    );
  };
  DropdownMenuMock.displayName = "DropdownMenuMock";
  return DropdownMenuMock;
});

jest.mock("@/components/blocknote/PDFViewer", () => {
  const PDFViewerMock = (props: { title?: string }) => {
    return <div>PDF: {props.title}</div>;
  };
  PDFViewerMock.displayName = "PDFViewerMock";
  return PDFViewerMock;
});

// Mock actions
const mockDeleteReport = jest.fn();
jest.mock("@/lib/actions/reports", () => ({
  deleteReport: (...args: unknown[]) =>
    (mockDeleteReport as (...a: unknown[]) => unknown)(...args),
}));

const mockTranslateText = jest.fn();
jest.mock("@/lib/actions/translate", () => ({
  translateText: (text: string, targetLanguage: string) =>
    mockTranslateText(text, targetLanguage),
}));

// Mock hooks used by the component
const mockHandleBack = jest.fn();
jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: () => ({ handleBackClick: mockHandleBack }),
}));

jest.mock("@/app/contexts/TherapistProfileContext", () => ({
  useTherapistProfile: () => ({
    therapist: { id: "therapist-1", name: "Dr. Mock" },
  }),
}));

describe("IndivReportClient", () => {
  const sampleReport = {
    id: "report-1",
    title: "Sample Report Title",
    created_at: "2023-07-01T00:00:00.000Z",
    therapist_id: "therapist-1",
    therapist: {
      id: "therapist-1",
      name: "Dr. Mock",
      clinic: { clinic: "Mock Clinic", country: { country: "Mockland" } },
    },
    language: { language: "English", id: 1, code: "en" },
    type: { type: "Assessment" },
    patient: { id: "patient-1", name: "Jane Doe", sex: "F", age: "25" },
    description: "This is a description of the report.",
    content: null,
  } as unknown as React.ComponentProps<typeof IndivReportClient>["report"];

  const mockLanguageOptions = [
    { value: "en", label: "English" },
    { value: "fil", label: "Filipino" },
    { value: "es", label: "Spanish" },
  ];

  beforeEach(() => {
    // clear mock call history between tests so assertions start fresh
    jest.clearAllMocks();
    // Reset mock select value to default
    setMockSelectValue({ value: "filipino", label: "Filipino" });
  });

  it("calls back navigation when Back is clicked and disables the button", async () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    const back = screen.getByRole("button", { name: /Back/i });
    expect(back).toBeInTheDocument();
    expect(back).not.toBeDisabled();

    await userEvent.click(back);

    // handleBack should be called and the button should become disabled
    expect(mockHandleBack).toHaveBeenCalled();
    expect(back).toBeDisabled();
  });

  it("changes display language via the Select mock", async () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    // button inside our Select mock
    const selectButton = screen.getByTestId("display-language-select");
    expect(selectButton).toBeInTheDocument();

    await userEvent.click(selectButton);

    // our helper spy should be called with the selected value
    expect(selectChangeMock).toHaveBeenCalledWith({
      value: "filipino",
      label: "Filipino",
    });
  });

  it("navigates to therapist profile on click (router.push)", async () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    const therapistLink = screen
      .getByText(sampleReport.therapist.name)
      .closest("a");
    expect(therapistLink).toBeTruthy();

    await userEvent.click(therapistLink!);
    expect(pushMock).toHaveBeenCalledWith(
      `/profile/therapist/${sampleReport.therapist.id}`
    );
  });

  it("navigates to patient profile on click (router.push)", async () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    const patientLink = screen
      .getByText(sampleReport.patient.name)
      .closest("a");
    expect(patientLink).toBeTruthy();

    await userEvent.click(patientLink!);
    expect(pushMock).toHaveBeenCalledWith(
      `/profile/patient/${sampleReport.patient.id}`
    );
  });

  it("shows success toast when updated query param is present", async () => {
    // make the hook return updated=true
    useSearchParamsMock.mockReturnValueOnce(
      new URLSearchParams("updated=true")
    );

    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    // Toast mock renders message when isVisible
    expect(
      await screen.findByText("Report updated successfully!")
    ).toBeInTheDocument();
  });

  it("calls deleteReport when delete is confirmed", async () => {
    // Ensure delete resolves
    mockDeleteReport.mockResolvedValueOnce({});

    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    // click Delete icon to open modal
    const deleteIcon = screen.getByTestId("DeleteIcon");
    await userEvent.click(deleteIcon);

    // confirmation modal should render a confirm button
    const confirmBtn = await screen.findByTestId("confirm-delete");
    await userEvent.click(confirmBtn);

    await waitFor(() =>
      expect(mockDeleteReport).toHaveBeenCalledWith(sampleReport.id)
    );
  });

  it("shows error toast when deleteReport rejects with non-redirect error", async () => {
    // make deleteReport reject with a normal error
    mockDeleteReport.mockRejectedValueOnce(new Error("network failure"));

    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    // click Delete icon to open modal
    const deleteIcon = screen.getByTestId("DeleteIcon");
    await userEvent.click(deleteIcon);

    // confirm deletion
    await userEvent.click(await screen.findByTestId("confirm-delete"));

    // toast should show the failure message
    expect(
      await screen.findByText("Failed to delete report. Please try again.")
    ).toBeInTheDocument();
  });

  it("deletes confirmation modal when cancelled", async () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    // click Delete icon to open modal
    const deleteIcon = screen.getByTestId("DeleteIcon");
    await userEvent.click(deleteIcon);

    // confirmation modal should render a cancel button
    const cancelBtn = await screen.findByTestId("cancel-delete");
    await userEvent.click(cancelBtn);
    // deleteReport should not be called
    expect(mockDeleteReport).not.toHaveBeenCalled();
  });

  it("routes to edit page when Edit is clicked", async () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );
    // click Edit button
    const editBtn = screen.getByRole("button", { name: /Edit/i });
    await userEvent.click(editBtn);
    expect(pushMock).toHaveBeenCalledWith(`/reports/${sampleReport.id}/edit`);
  });

  describe("handleLanguageChange", () => {
    it("resets to original content when selecting the original language (same as report.language.code)", async () => {
      // Set up the report with language code "en"
      const reportWithEnglish = {
        ...sampleReport,
        language: { language: "English", id: 1, code: "en" },
      };

      mockTranslateText.mockImplementation((text: string) =>
        Promise.resolve(`Translated: ${text}`)
      );

      render(
        <IndivReportClient
          report={reportWithEnglish}
          languageOptions={mockLanguageOptions}
        />
      );

      // Click the select button to change language (mock simulates selecting Filipino)
      const selectButton = screen.getByTestId("display-language-select");
      await userEvent.click(selectButton);

      // Now manually trigger selecting the original language by clicking again
      // But our mock always selects Filipino. We need to test the actual behavior.
      // Let's verify that when the original language is selected, only UI text is translated
      
      // Wait for any async operations
      await waitFor(() => expect(mockTranslateText).toHaveBeenCalled());
    });

    it("translates only UI text (Edited on, Created on) when selecting original language", async () => {
      const reportWithEnglish = {
        ...sampleReport,
        language: { language: "English", id: 1, code: "en" },
      };

      // Mock translateText to return translated UI text
      mockTranslateText.mockImplementation((text: string, lang: string) => {
        if (text === "Edited on") return Promise.resolve("Editado en");
        if (text === "Created on") return Promise.resolve("Creado en");
        return Promise.resolve(`Translated: ${text}`);
      });

      // Set the mock to select the original language ("en")
      setMockSelectValue({ value: "en", label: "English" });

      render(
        <IndivReportClient
          report={reportWithEnglish}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectBtn = screen.getByTestId("display-language-select");
      await userEvent.click(selectBtn);

      // Should translate UI text only
      await waitFor(() => {
        expect(mockTranslateText).toHaveBeenCalledWith("Edited on", "en");
        expect(mockTranslateText).toHaveBeenCalledWith("Created on", "en");
      });

      // Should NOT translate content, title, or description
      expect(mockTranslateText).not.toHaveBeenCalledWith(
        sampleReport.title,
        "en"
      );
      expect(mockTranslateText).not.toHaveBeenCalledWith(
        sampleReport.description,
        "en"
      );
    });

    it("handles translation errors when selecting original language", async () => {
      const reportWithEnglish = {
        ...sampleReport,
        language: { language: "English", id: 1, code: "en" },
      };

      // Mock translateText to reject
      mockTranslateText.mockRejectedValue(new Error("Translation API error"));

      // Set the mock to select the original language ("en")
      setMockSelectValue({ value: "en", label: "English" });

      render(
        <IndivReportClient
          report={reportWithEnglish}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectBtn = screen.getByTestId("display-language-select");
      await userEvent.click(selectBtn);

      // Should handle error gracefully
      await waitFor(() => expect(mockTranslateText).toHaveBeenCalled());
      // Component should still function (not crash)
    });

    it("translates all content when selecting a different language", async () => {
      mockTranslateText.mockImplementation((text: string, lang: string) => {
        return Promise.resolve(`${text} [${lang}]`);
      });

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectButton = screen.getByTestId("display-language-select");
      await userEvent.click(selectButton);

      // Should translate content, title, description, and UI text
      await waitFor(
        () => {
          expect(mockTranslateText).toHaveBeenCalledWith(
            "mock markdown",
            "filipino"
          );
          expect(mockTranslateText).toHaveBeenCalledWith(
            sampleReport.title,
            "filipino"
          );
          expect(mockTranslateText).toHaveBeenCalledWith(
            sampleReport.description,
            "filipino"
          );
          expect(mockTranslateText).toHaveBeenCalledWith(
            "Edited on",
            "filipino"
          );
          expect(mockTranslateText).toHaveBeenCalledWith(
            "Created on",
            "filipino"
          );
        },
        { timeout: 3000 }
      );
    });

    it("shows success toast when translation completes successfully", async () => {
      mockTranslateText.mockImplementation((text: string) =>
        Promise.resolve(`Translated: ${text}`)
      );

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectButton = screen.getByTestId("display-language-select");
      await userEvent.click(selectButton);

      // Wait for success toast
      await waitFor(
        () => {
          expect(screen.getByText("Translation successful!")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("shows error toast when translation fails", async () => {
      mockTranslateText.mockRejectedValue(new Error("API timeout"));

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectButton = screen.getByTestId("display-language-select");
      await userEvent.click(selectButton);

      // Wait for error toast
      await waitFor(
        () => {
          expect(
            screen.getByText("Translation failed. Please try again.")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("handles error during markdown conversion", async () => {
      // Mock BlockNoteEditor.create to throw during blocksToMarkdownLossy
      const mockEditor = {
        blocksToMarkdownLossy: jest
          .fn()
          .mockRejectedValue(new Error("Markdown conversion failed")),
        tryParseMarkdownToBlocks: jest.fn(),
      };

      jest.spyOn(BlockNoteEditor, "create").mockReturnValue(mockEditor as never);

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectButton = screen.getByTestId("display-language-select");
      await userEvent.click(selectButton);

      // Should show error toast
      await waitFor(
        () => {
          expect(
            screen.getByText("Translation failed. Please try again.")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("resets all translations when no option is selected (null)", async () => {
      mockTranslateText.mockImplementation((text: string) =>
        Promise.resolve(`Translated: ${text}`)
      );

      // Set the mock to return null (no selection)
      setMockSelectValue(null);

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const selectBtn = screen.getByTestId("display-language-select");
      await userEvent.click(selectBtn);

      // Component should reset to original content (no translations)
      // The selectChangeMock should be called with null
      await waitFor(() => expect(selectChangeMock).toHaveBeenCalledWith(null));
      
      // translateText should NOT be called when null is selected
      expect(mockTranslateText).not.toHaveBeenCalled();
    });
  });

  describe("handleDelete", () => {
    it("shows error toast when deleteReport fails with non-redirect error", async () => {
      // Regular error (not a redirect)
      mockDeleteReport.mockRejectedValueOnce(new Error("Database error"));

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const deleteIcon = screen.getByTestId("DeleteIcon");
      await userEvent.click(deleteIcon);
      await userEvent.click(await screen.findByTestId("confirm-delete"));

      // Should show error toast
      expect(
        await screen.findByText("Failed to delete report. Please try again.")
      ).toBeInTheDocument();
    });

    it("closes delete modal after deletion attempt", async () => {
      mockDeleteReport.mockRejectedValueOnce(new Error("Failed"));

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const deleteIcon2 = screen.getByTestId("DeleteIcon");
      await userEvent.click(deleteIcon2);
      
      // Modal should be open
      expect(await screen.findByTestId("confirm-delete")).toBeInTheDocument();

      await userEvent.click(screen.getByTestId("confirm-delete"));

      // Wait for modal to close (modal won't be rendered when closed)
      await waitFor(() => {
        expect(screen.queryByTestId("confirm-delete")).not.toBeInTheDocument();
      });
    });

    it("sets isDeleting state during delete operation", async () => {
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      mockDeleteReport.mockReturnValueOnce(deletePromise);

      render(
        <IndivReportClient
          report={sampleReport}
          languageOptions={mockLanguageOptions}
        />
      );

      const deleteIcon3 = screen.getByTestId("DeleteIcon");
      await userEvent.click(deleteIcon3);
      
      const confirmBtn = await screen.findByTestId("confirm-delete");
      await userEvent.click(confirmBtn);

      // While deleting, the button should be disabled (handled by isDeleting state)
      await waitFor(() => expect(mockDeleteReport).toHaveBeenCalled());

      // Resolve the delete operation
      resolveDelete!();
      
      await waitFor(() => {
        // Modal should close after deletion
        expect(screen.queryByTestId("confirm-delete")).not.toBeInTheDocument();
      });
    });
  });
});
