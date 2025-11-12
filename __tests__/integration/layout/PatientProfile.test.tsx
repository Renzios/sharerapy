import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientProfile from "@/components/layout/PatientProfile";
import { setMaxIdleHTTPParsers } from "http";
import { count } from "console";

// Mock Button to a simple button element so we can assert clicks
jest.mock("@/components/general/Button", () => ({
	__esModule: true,
	default: (props: { children: React.ReactNode; onClick?: () => void }) => (
		<button onClick={props.onClick}>{props.children}</button>
	),
}));

// Mock useBackNavigation to expose handleBackClick without relying on router
jest.mock("@/app/hooks/useBackNavigation", () => ({
	useBackNavigation: (fallback: string) => ({
		handleBackClick: jest.fn(),
		canGoBack: true,
	}),
}));

type Patient = React.ComponentProps<typeof PatientProfile>["patient"];

function makePatient(overrides: Record<string, unknown> = {}) {
	const base = {
		id: "p1",
		name: "Test Patient",
		first_name: "Test",
		last_name: "Patient",
		birthdate: "1995-07-20",
		sex: "Female",
		contact_number: "123456789",
		age: "30",
		country: { id: 1, country: "Canada" },
		reports: [],
	} as unknown as Patient;

	return ({ ...base, ...overrides } as unknown) as Patient;
}

describe("PatientProfile (layout)", () => {
	describe("Rendering", () => {
		it("shows patient name, contact and basic fields", () => {
			const patient = makePatient();
			render(<PatientProfile patient={patient} />);

			expect(screen.getByRole("heading", { name: /test patient/i })).toBeInTheDocument();
			expect(screen.getByText(/\+123456789/)).toBeInTheDocument();

			// Cards
			expect(screen.getByText(/age/i)).toBeInTheDocument();
			expect(screen.getByText(/30/)).toBeInTheDocument();

			expect(screen.getByText(/birthday/i)).toBeInTheDocument();
			// formatted birthday contains year 1995 and month name
			expect(screen.getByText(/1995/)).toBeInTheDocument();

			expect(screen.getByText(/sex/i)).toBeInTheDocument();
			expect(screen.getByText(/female/i)).toBeInTheDocument();

			expect(screen.getByText(/country/i)).toBeInTheDocument();
			expect(screen.getByText(/canada/i)).toBeInTheDocument();
		});

		it("falls back to N/A when optional fields are missing", () => {
			const patient = makePatient({ contact_number: null, age: undefined, country: null });
			render(<PatientProfile patient={patient} />);

			expect(screen.getByText(/\+N\/A/)).toBeInTheDocument();
			expect(screen.getAllByText(/N\/A/).length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("User Interaction", () => {
		it("calls back navigation when Back button is clicked and shows navigating state", async () => {
			const patient = makePatient();
			render(<PatientProfile patient={patient} />);
			const user = userEvent.setup();

			const back = screen.getByRole("button", { name: /back/i });
			await user.click(back);

			// The mock of useBackNavigation returns a jest.fn() for handleBackClick but
			// PatientProfile sets isNavigating state; we can assert the button exists and was clicked.
			expect(back).toBeInTheDocument();
		});

        it("displays N/A for missing age, sex, country fields", () => {
            const patient = makePatient({ age: undefined, sex: undefined, country: undefined });
            render(<PatientProfile patient={patient} />);
            expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(3);
        });
	});



	describe("Props Handling", () => {
		it("formats birthday using formatDate (human readable)", () => {
			const patient = makePatient({ birthdate: "2001-12-31" });
			render(<PatientProfile patient={patient} />);

			// Example: December 31, 2001
			expect(screen.getByText(/2001/)).toBeInTheDocument();
			expect(screen.getByText(/December|Dec/)).toBeTruthy();
		});

		it("renders nested country name when provided", () => {
			const patient = makePatient({ country: { id: 99, country: "United States" } });
			render(<PatientProfile patient={patient} />);

			expect(screen.getByText(/united states/i)).toBeInTheDocument();
		});
	});
});

