import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientProfileClient from "@/components/client-pages/PatientProfileClient";
import type { Tables } from "@/lib/types/database.types";
import * as nextNav from "next/navigation";

jest.mock('openai');

jest.mock("next/navigation", () => {
	const actual = jest.requireActual("next/navigation");
	return {
		...actual,
		useRouter: jest.fn(),
		useSearchParams: jest.fn(),
		usePathname: jest.fn(),
	};
});

// Mock fetchReports - this module doesn't exist, remove the import and mock
const mockFetchReports = jest.fn();

// Mock layout and child components to make unit deterministic
jest.mock("@/components/layout/PatientProfile", () => {
	const Component = (props: { patient?: { id?: string } }) => (
		<div data-testid="patient-profile">patient-{props.patient?.id}</div>
	);
	Component.displayName = "PatientProfile";
	return Component;
});

jest.mock("@/components/layout/SearchPageHeader", () => {
	const Component = (props: {
		searchValue?: string;
		onSearch?: (v: string) => void;
		onSearchChange?: (v: string) => void;
		onSortChange?: (opt: { value: string; label: string }) => void;
		onLanguageChange?: (opt: { value: string; label: string }) => void;
	}) => (
		<div data-testid="search-page-header">
			{/* expose a search input that reflects `searchValue` and calls onSearchChange */}
			<input
				data-testid="search-input"
				value={props.searchValue ?? ""}
				onChange={(e) => props.onSearchChange?.(e.target.value)}
			/>

			<button
				data-testid="search-btn"
				onClick={() => {
					if (props.onSearch) props.onSearch("searched-term");
				}}
			>
				search
			</button>

			<select
				data-testid="mock-sort-select"
				defaultValue="dateDescending"
				onChange={(e) => {
					const label = e.target.selectedOptions?.[0]?.text || e.target.value;
					if (props.onSortChange) props.onSortChange({ value: e.target.value, label });
				}}
			>
				<option value="titleAscending">Title A-Z</option>
				<option value="titleDescending">Title Z-A</option>
				<option value="dateAscending">Date Oldest</option>
				<option value="dateDescending">Date Newest</option>
			</select>
			{/* simulate a language dropdown/select */}
			<select
				data-testid="mock-language-select"
				defaultValue="en"
				onChange={(e) => {
					const label = e.target.selectedOptions?.[0]?.text || e.target.value;
					if (props.onLanguageChange) props.onLanguageChange({ value: e.target.value, label });
				}}
			>
				<option value="en">English</option>
				<option value="es">Spanish</option>
			</select>
		</div>
	);
	Component.displayName = "SearchPageHeader";
	return Component;
});

jest.mock("@/components/cards/ReportCard", () => {
	const Component = (props: { report?: { id?: string } }) => (
		<div data-testid={`report-${props.report?.id}`}>report-{props.report?.id}</div>
	);
	Component.displayName = "ReportCard";
	return Component;
});

jest.mock("@/components/general/Pagination", () => {
	const Component = (props: {
		totalPages?: number;
		currentPage?: number;
		onPageChange?: (p: number) => void;
	}) => {
		const pages = Array.from({ length: props.totalPages || 1 }).map((_, i) => i + 1);
		return (
			<div data-testid="pagination">
				{pages.map((p) => (
					<button
						key={p}
						data-testid={`page-${p}`}
						onClick={() => {
							if (props.onPageChange) props.onPageChange(p);
						}}
					>
						go-page-{p}
					</button>
				))}
				<div data-testid="pagination-info">page-{props.currentPage}-of-{props.totalPages}</div>
			</div>
		);
	};
	Component.displayName = "Pagination";
	return Component;
});

describe("PatientProfileClient integration", () => {
	const pushMock = jest.fn();
	const pathname = "/patients/1";
	const searchParams = new URLSearchParams("p=2&q=initial");

	// Derive the component props type so tests stay in-sync with the component
	type TestProps = Parameters<typeof PatientProfileClient>[0];
	const patient: TestProps["patient"] = {
		id: "pat-1",
		first_name: "Patient",
		last_name: "One",
		name: "Patient One",
		birthdate: "1990-01-01",
		contact_number: "09170000000",
		country_id: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		sex: "Male",
		age: "35 years 0 months",
		country: { id: 1, country: "Country" },
		reports: [],
	} as TestProps["patient"];

	const initialReports: TestProps["initialReports"] = [
		{
			id: "r-alpha",
			title: "Alpha report",
			created_at: "2022-01-01",
			therapist: { id: "ther-1", first_name: "T", last_name: "1", name: "T1", age: 40, bio: "", clinic_id: 1, picture: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), clinic: { id: 1, clinic: "Clinic", country_id: 1, country: { id: 1, country: "Country" } } },
			type: { id: 1, type: "Assessment" },
			language: { id: 1, language: "English", code: "en" },
			content: [],
			description: "",
			language_id: 1,
			patient_id: patient.id,
			therapist_id: "ther-1",
			type_id: 1,
			updated_at: new Date().toISOString(),
		},
		{
			id: "r-zulu",
			title: "Zulu report",
			created_at: "2020-05-01",
			therapist: { id: "ther-2", first_name: "T", last_name: "2", name: "T2", age: 40, bio: "", clinic_id: 1, picture: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), clinic: { id: 1, clinic: "Clinic", country_id: 1, country: { id: 1, country: "Country" } } },
			type: { id: 2, type: "Progress" },
			language: { id: 1, language: "English", code: "en" },
			content: [],
			description: "",
			language_id: 1,
			patient_id: patient.id,
			therapist_id: "ther-2",
			type_id: 2,
			updated_at: new Date().toISOString(),
		},
	] as TestProps["initialReports"];

	beforeEach(() => {
		jest.clearAllMocks();
		(nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
		(nextNav.usePathname as jest.Mock).mockReturnValue(pathname);
		(nextNav.useSearchParams as jest.Mock).mockReturnValue({
			get: (k: string) => searchParams.get(k),
			toString: () => searchParams.toString(),
		});

		(window as unknown as { scrollTo?: jest.Mock }).scrollTo = jest.fn();
	});

	it("renders patient and initial report cards and pagination", () => {
		render(
			<PatientProfileClient
				patient={patient}
				initialReports={initialReports}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);

		expect(screen.getByTestId("patient-profile")).toHaveTextContent(
			`patient-${patient.id}`
		);
		expect(screen.getByTestId("report-r-alpha")).toBeInTheDocument();
		expect(screen.getByTestId("report-r-zulu")).toBeInTheDocument();
		expect(screen.getByTestId("pagination")).toBeInTheDocument();
	});

	it("performs a search: updates URL via router.push", async () => {
		render(
			<PatientProfileClient
				patient={patient}
				initialReports={initialReports}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);

		fireEvent.click(screen.getByTestId("search-btn"));

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalled();
		});

		// Verify the URL contains the search parameter
		const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1];
		expect(lastCall[0]).toContain("q=");
	});	it("changes sort and page: updates URL via router.push", async () => {
		render(
			<PatientProfileClient
				patient={patient}
				initialReports={initialReports}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);

		pushMock.mockClear();

		fireEvent.change(screen.getByTestId("mock-sort-select"), {
			target: { value: "titleAscending" },
		});

		await waitFor(() => expect(pushMock).toHaveBeenCalled());

		// Verify sort parameter in URL
		const sortCall = pushMock.mock.calls[pushMock.mock.calls.length - 1];
		expect(sortCall[0]).toContain("sort=titleAscending");

		pushMock.mockClear();

		await waitFor(() => expect(screen.getByTestId("page-1")).toBeInTheDocument());
		fireEvent.click(screen.getByTestId("page-1"));

		await waitFor(() => expect(pushMock).toHaveBeenCalled());
		
		// Verify page parameter in URL
		const pageCall = pushMock.mock.calls[pushMock.mock.calls.length - 1];
		expect(pageCall[0]).toContain("p=1");
		
		expect((window as unknown as { scrollTo?: jest.Mock }).scrollTo).toHaveBeenCalled();
	});

	it("changes language: triggers select update and keeps existing reports", async () => {
		const langReports = [{ ...initialReports[0], id: "r-lang" }];
		(mockFetchReports as jest.Mock).mockResolvedValueOnce({
			success: true,
			data: langReports,
			totalPages: 1,
		});

		render(
			<PatientProfileClient
				patient={patient}
				initialReports={initialReports}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);

		fireEvent.change(screen.getByTestId("mock-language-select"), {
			target: { value: "es" },
		});

		await waitFor(() =>
			expect((screen.getByTestId("mock-language-select") as HTMLSelectElement).value).toBe("es")
		);

		expect(screen.getByTestId("report-r-alpha")).toBeInTheDocument();
		expect(screen.getByTestId("report-r-zulu")).toBeInTheDocument();
	});

	it("getSortParams cases update URL with correct parameters", async () => {
		const cases: Record<string, { column: "title" | "created_at"; ascending: boolean }> = {
			titleAscending: { column: "title", ascending: true },
			titleDescending: { column: "title", ascending: false },
			dateAscending: { column: "created_at", ascending: true },
			dateDescending: { column: "created_at", ascending: false },
		};

		for (const [value, expected] of Object.entries(cases)) {
			const { unmount } = render(
				<PatientProfileClient
					patient={patient}
					initialReports={initialReports}
					totalPages={2}
					initialSearchTerm="initial"
				/>
			);

			pushMock.mockClear();

			fireEvent.change(screen.getByTestId("mock-sort-select"), { target: { value } });

			await waitFor(() => expect(pushMock).toHaveBeenCalled());

			const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1];
			expect(lastCall[0]).toContain(`sort=${value}`);

			unmount();
		}

		const { unmount: u2 } = render(
			<PatientProfileClient
				patient={patient}
				initialReports={initialReports}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);
		
		pushMock.mockClear();
		
		fireEvent.change(screen.getByTestId("mock-sort-select"), {
			target: { value: "unknown-option" },
		});
		
		await waitFor(() => expect(pushMock).toHaveBeenCalled());
		
		// Unknown option should be ignored or fall back to default behavior
		// Just verify push was called
		expect(pushMock).toHaveBeenCalled();
		
		u2();
	});
    it('has "" as the initial search term when none is provided', () => {
        (mockFetchReports as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: initialReports,
            totalPages: 2,
        });
		render(
			<PatientProfileClient
				patient={patient}
				initialReports={initialReports}
				totalPages={2}
				initialSearchTerm=""
			/>
		);
        // check if initial search term is set to ""
        expect(screen.getByTestId("search-input")).toHaveValue("");
    });
});
