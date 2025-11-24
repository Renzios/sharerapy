import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
    onChange?: (v: SelectValue) => void;
  }) => {
    return (
      <div>
        <label>{props.label}</label>
        <button
          data-testid="display-language-select"
          onClick={() => {
            const val: SelectValue = { value: "filipino", label: "Filipino" };
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

// Mock hooks used by the component
const mockHandleBack = jest.fn();
jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: () => ({ handleBackClick: mockHandleBack }),
}));

jest.mock("@/app/hooks/useTherapistProfile", () => ({
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
  });

  it("calls back navigation when Back is clicked and disables the button", () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    const back = screen.getByRole("button", { name: /Back/i });
    expect(back).toBeInTheDocument();
    expect(back).not.toBeDisabled();

    fireEvent.click(back);

    // handleBack should be called and the button should become disabled
    expect(mockHandleBack).toHaveBeenCalled();
    expect(back).toBeDisabled();
  });

  it("changes display language via the Select mock", () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );

    // button inside our Select mock
    const selectButton = screen.getByTestId("display-language-select");
    expect(selectButton).toBeInTheDocument();

    fireEvent.click(selectButton);

    // our helper spy should be called with the selected value
    expect(selectChangeMock).toHaveBeenCalledWith({
      value: "filipino",
      label: "Filipino",
    });
  });

  it("navigates to therapist profile on click (router.push)", () => {
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

    fireEvent.click(therapistLink!);
    expect(pushMock).toHaveBeenCalledWith(
      `/profile/therapist/${sampleReport.therapist.id}`
    );
  });

  it("navigates to patient profile on click (router.push)", () => {
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

    fireEvent.click(patientLink!);
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

    // open dropdown
    const moreBtn = screen.getByLabelText("More options");
    fireEvent.click(moreBtn);

    // click Delete item in our DropdownMenu mock
    const deleteBtn = screen.getByText("Delete");
    fireEvent.click(deleteBtn);

    // confirmation modal should render a confirm button
    const confirmBtn = await screen.findByTestId("confirm-delete");
    fireEvent.click(confirmBtn);

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

    // open dropdown and click Delete
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Delete"));

    // confirm
    fireEvent.click(await screen.findByTestId("confirm-delete"));

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

    // open dropdown and click Delete
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Delete"));
    // confirmation modal should render a cancel button
    const cancelBtn = await screen.findByTestId("cancel-delete");
    fireEvent.click(cancelBtn);
    // deleteReport should not be called
    expect(mockDeleteReport).not.toHaveBeenCalled();
  });

  it("routes to edit page when Edit is clicked", () => {
    render(
      <IndivReportClient
        report={sampleReport}
        languageOptions={mockLanguageOptions}
      />
    );
    // open dropdown
    fireEvent.click(screen.getByLabelText("More options"));
    // click Edit item in our DropdownMenu mock
    const editBtn = screen.getByText("Edit");
    fireEvent.click(editBtn);
    expect(pushMock).toHaveBeenCalledWith(`/reports/${sampleReport.id}/edit`);
  });
});
