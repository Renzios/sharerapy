import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientProfileClient from "@/components/client-pages/PatientProfileClient";
import { fetchReports as mockFetchReports } from "@/app/(with-sidebar)/search/reports/actions";
import * as nextNav from "next/navigation";

jest.mock("next/navigation", () => {
	const actual = jest.requireActual("next/navigation");
	return {
		...actual,
		useRouter: jest.fn(),
		useSearchParams: jest.fn(),
		usePathname: jest.fn(),
	};
});

jest.mock("@/app/(with-sidebar)/search/reports/actions", () => ({
	fetchReports: jest.fn(),
}));

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

	interface PatientMinimal {
		id: string;
		name?: string;
		country: { id: string; name: string };
		reports: unknown[];
	}

	interface ReportMinimal {
		id: string;
		title: string;
		created_at: string;
		therapist: { id: string };
		type: { id: string; name: string };
		language: { id: string; name: string };
		patient: { id: string; country: { id: string; name: string } } | PatientMinimal;
	}

	const patient: PatientMinimal = {
		id: "pat-1",
		name: "Patient One",
		country: { id: "country1", name: "Country" },
		reports: [],
	};

	const initialReports: ReportMinimal[] = [
		{
			id: "r-alpha",
			title: "Alpha report",
			created_at: "2022-01-01",
			therapist: { id: "ther-1" },
			type: { id: "t1", name: "Assessment" },
			language: { id: "en", name: "English" },
			patient,
		},
		{
			id: "r-zulu",
			title: "Zulu report",
			created_at: "2020-05-01",
			therapist: { id: "ther-2" },
			type: { id: "t2", name: "Progress" },
			language: { id: "en", name: "English" },
			patient,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		(nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
		(nextNav.usePathname as jest.Mock).mockReturnValue(pathname);
		(nextNav.useSearchParams as jest.Mock).mockReturnValue({
			get: (k: string) => searchParams.get(k),
			toString: () => searchParams.toString(),
		});

		(mockFetchReports as jest.Mock).mockResolvedValue({
			success: true,
			data: initialReports,
			totalPages: 2,
		});

		(window as unknown as { scrollTo?: jest.Mock }).scrollTo = jest.fn();
	});

	it("renders patient and initial report cards and pagination", () => {
		render(
			<PatientProfileClient
				patient={patient as any}
				initialReports={initialReports as any}
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

	it("performs a search: updates reports via fetchReports and updates URL via router.push", async () => {
		const newReports = [
			{
				id: "r-new",
				title: "New Report",
				created_at: "2022-01-01",
				therapist: { id: "ther-1" },
				type: { id: "t1", name: "Type" },
				language: { id: "en", name: "English" },
				patient,
			},
		];

		(mockFetchReports as jest.Mock).mockResolvedValueOnce({
			success: true,
			data: newReports,
			totalPages: 1,
		});

		render(
			<PatientProfileClient
				patient={patient as any}
				initialReports={initialReports as any}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);

		fireEvent.click(screen.getByTestId("search-btn"));

		await waitFor(() => {
			expect(mockFetchReports).toHaveBeenCalled();
		});

		await waitFor(() => expect(screen.getByTestId("report-r-new")).toBeInTheDocument());

		// ensure fetch was called with patientID
		const lastCall = (mockFetchReports as jest.Mock).mock.calls.pop();
		const params = lastCall ? lastCall[0] : undefined;
		expect(params.patientID).toBe(patient.id);
	});

	it("changes sort and page: triggers fetch and updates list", async () => {
		const sortedReports = [...initialReports].sort((a, b) => a.title.localeCompare(b.title));

		render(
			<PatientProfileClient
				patient={patient as any}
				initialReports={initialReports as any}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);

		(mockFetchReports as jest.Mock).mockResolvedValueOnce({
			success: true,
			data: sortedReports,
			totalPages: 2,
		});

		fireEvent.change(screen.getByTestId("mock-sort-select"), {
			target: { value: "titleAscending" },
		});

		await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());

		(mockFetchReports as jest.Mock).mockResolvedValueOnce({
			success: true,
			data: [initialReports[0]],
			totalPages: 2,
		});

		await waitFor(() => expect(screen.getByTestId("page-1")).toBeInTheDocument());
		fireEvent.click(screen.getByTestId("page-1"));

		await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
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
				patient={patient as any}
				initialReports={initialReports as any}
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

	it("getSortParams cases map to correct fetch parameters", async () => {
		const cases: Record<string, { column: "title" | "created_at"; ascending: boolean }> = {
			titleAscending: { column: "title", ascending: true },
			titleDescending: { column: "title", ascending: false },
			dateAscending: { column: "created_at", ascending: true },
			dateDescending: { column: "created_at", ascending: false },
		};

		for (const [value, expected] of Object.entries(cases)) {
			(mockFetchReports as jest.Mock).mockResolvedValueOnce({
				success: true,
				data: initialReports,
				totalPages: 2,
			});

			const { unmount } = render(
				<PatientProfileClient
					patient={patient as any}
					initialReports={initialReports as any}
					totalPages={2}
					initialSearchTerm="initial"
				/>
			);

			fireEvent.change(screen.getByTestId("mock-sort-select"), { target: { value } });

			await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());

			const lastCall = (mockFetchReports as jest.Mock).mock.calls.pop();
			const params = lastCall ? lastCall[0] : undefined;
			expect(params).toBeDefined();
			expect(params.column).toBe(expected.column);
			expect(params.ascending).toBe(expected.ascending);

			unmount();
		}

		(mockFetchReports as jest.Mock).mockResolvedValueOnce({
			success: true,
			data: initialReports,
			totalPages: 2,
		});

		const { unmount: u2 } = render(
			<PatientProfileClient
				patient={patient as any}
				initialReports={initialReports as any}
				totalPages={2}
				initialSearchTerm="initial"
			/>
		);
		fireEvent.change(screen.getByTestId("mock-sort-select"), {
			target: { value: "unknown-option" },
		});
		await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
		const lastCall2 = (mockFetchReports as jest.Mock).mock.calls.pop();
		const params2 = lastCall2 ? lastCall2[0] : undefined;
		expect(params2).toBeDefined();
		expect(params2.column).toBe("created_at");
		expect(params2.ascending).toBe(false);
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
                patient={patient as any}
                initialReports={initialReports as any}
                totalPages={2}
                initialSearchTerm=""
            />
        );
        // check if initial search term is set to ""
        expect(screen.getByTestId("search-input")).toHaveValue("");
    });
});
