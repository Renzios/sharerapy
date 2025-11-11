import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import IndivReportClient from "@/components/client-pages/IndivReportClient";

// Exposed mocks so tests can assert interactions
const pushMock = jest.fn();
const selectChangeMock = jest.fn();

// Mock next/link so clicks call router.push (so we can assert navigation)
jest.mock("next/link", () => ({
	__esModule: true,
	default: ({ href, children }: any) => (
		<a href={href} onClick={(e) => { e.preventDefault(); pushMock(href); }}>
			{children}
		</a>
	),
}));

// Mock next/navigation hooks to return the shared pushMock
jest.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	useSearchParams: () => new URLSearchParams(),
}));

// Mock child components to keep the test focused on IndivReportClient behavior
jest.mock("@/components/general/Button", () => (props: any) => {
	const { children, onClick, disabled, className } = props;
	return (
		<button onClick={onClick} disabled={disabled} className={className}>
			{children}
		</button>
	);
});

// The Select mock exposes a clickable element that triggers onChange and also notifies test via selectChangeMock
jest.mock("@/components/general/Select", () => (props: any) => {
	return (
		<div>
			<label>{props.label}</label>
			<button
				data-testid="display-language-select"
				onClick={() => {
					const val = { value: "filipino", label: "Filipino" };
					props.onChange?.(val);
					selectChangeMock(val);
				}}
			>
				Change
			</button>
		</div>
	);
});

jest.mock("@/components/general/Toast", () => (props: any) => {
	return props.isVisible ? <div>{props.message}</div> : null;
});

jest.mock("@/components/general/ConfirmationModal", () => (props: any) => {
	return props.isOpen ? <div>{props.title}</div> : null;
});

jest.mock("@/components/general/DropdownMenu", () => (props: any) => {
	const { isOpen, items } = props;
	return isOpen ? (
		<div>
			{Array.isArray(items) &&
				items.map((it: any) => <div key={it.label}>{it.label}</div>)}
		</div>
	) : null;
});

jest.mock("@/components/blocknote/PDFViewer", () => (props: any) => {
	return <div>PDF: {props.title}</div>;
});

// Mock actions
const mockDeleteReport = jest.fn();
jest.mock("@/lib/actions/reports", () => ({
	deleteReport: (...args: any[]) => mockDeleteReport(...args),
}));

// Mock hooks used by the component
const mockHandleBack = jest.fn();
jest.mock("@/app/hooks/useBackNavigation", () => ({
	useBackNavigation: () => ({ handleBackClick: mockHandleBack }),
}));

jest.mock("@/app/hooks/useTherapistProfile", () => ({
	useTherapistProfile: () => ({ therapist: { id: "therapist-1", name: "Dr. Mock" } }),
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
		language: { language: "English" },
		type: { type: "Assessment" },
		patient: { id: "patient-1", name: "Jane Doe", sex: "F", age: "25" },
		description: "This is a description of the report.",
		content: new Uint8Array(),
	} as any;

	it("calls back navigation when Back is clicked and disables the button", () => {
		render(<IndivReportClient report={sampleReport} />);

		const back = screen.getByRole("button", { name: /Back/i });
		expect(back).toBeInTheDocument();
		expect(back).not.toBeDisabled();

		fireEvent.click(back);

		// handleBack should be called and the button should become disabled
		expect(mockHandleBack).toHaveBeenCalled();
		expect(back).toBeDisabled();
	});

	it("changes display language via the Select mock", () => {
		render(<IndivReportClient report={sampleReport} />);

		// button inside our Select mock
		const selectButton = screen.getByTestId("display-language-select");
		expect(selectButton).toBeInTheDocument();

		fireEvent.click(selectButton);

		// our helper spy should be called with the selected value
		expect(selectChangeMock).toHaveBeenCalledWith({ value: "filipino", label: "Filipino" });
	});

	it("navigates to therapist profile on click (router.push)", () => {
		render(<IndivReportClient report={sampleReport} />);

		const therapistLink = screen.getByText(sampleReport.therapist.name).closest("a");
		expect(therapistLink).toBeTruthy();

		fireEvent.click(therapistLink!);
		expect(pushMock).toHaveBeenCalledWith(`/profile/therapist/${sampleReport.therapist.id}`);
	});

	it("navigates to patient profile on click (router.push)", () => {
		render(<IndivReportClient report={sampleReport} />);

		const patientLink = screen.getByText(sampleReport.patient.name).closest("a");
		expect(patientLink).toBeTruthy();

		fireEvent.click(patientLink!);
		expect(pushMock).toHaveBeenCalledWith(`/profile/patient/${sampleReport.patient.id}`);
	});
});

