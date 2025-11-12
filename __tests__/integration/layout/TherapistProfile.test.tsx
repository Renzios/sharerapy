import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TherapistProfile from "@/components/layout/TherapistProfile";

// Trackable mock for the back navigation handler
const handleBackClickMock = jest.fn();

jest.mock("next/image", () => {
	// simple img passthrough so we can assert src/alt
	return {
		__esModule: true,
		default: (props: any) => {
			// eslint-disable-next-line jsx-a11y/alt-text
			return <img {...props} />;
		},
	};
});

jest.mock("@/lib/utils/storage", () => ({
	getPublicURL: (bucket: string, path: string) => {
		// predictable URL useful for assertions
		return `https://cdn.test/${bucket}/${path}`;
	},
}));

jest.mock("@/app/hooks/useBackNavigation", () => ({
	useBackNavigation: (_: string) => ({ handleBackClick: handleBackClickMock }),
}));

// Keep the Button simple and testable
jest.mock("@/components/general/Button", () => ({
	__esModule: true,
	default: (props: any) => {
		const { children, ...rest } = props;
		return (
			<button type="button" {...rest}>
				{children}
			</button>
		);
	},
}));

describe("TherapistProfile layout component", () => {
	const baseTherapist = {
		id: "ther-1",
		name: "Dr. Jane Doe",
		picture: "therapist.jpg",
		bio: "I help people feel better.",
		age: 34,
		created_at: "2020-02-02",
		clinic: {
			clinic: "Mindful Clinic",
			country: { country: "Philippines" },
		},
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Rendering", () => {
		it("shows therapist name, clinic, bio and side details", () => {
			render(<TherapistProfile therapist={baseTherapist} />);

			// Heading / name
			expect(screen.getByRole("heading", { name: /dr\. jane doe/i })).toBeInTheDocument();

			// Clinic name and bio
			expect(screen.getByText(/mindful clinic/i)).toBeInTheDocument();
			expect(screen.getByText(/i help people feel better\./i)).toBeInTheDocument();

			// Side details: country, age and joined date (formatted)
			expect(screen.getByText(/philippines/i)).toBeInTheDocument();
			expect(screen.getByText(/34 years old/i)).toBeInTheDocument();
			// formatDate -> February 2, 2020
			expect(screen.getByText(/february 2, 2020/i)).toBeInTheDocument();

			// Image alt and src resolved via getPublicURL
			const img = screen.getByAltText("Therapist Profile Picture") as HTMLImageElement;
			expect(img).toBeTruthy();
			expect(img.src).toContain("https://cdn.test/therapist_pictures/therapist.jpg");
		});
	});

	describe("User Interaction", () => {
		it("calls back navigation handler when Back is clicked", async () => {
			const user = userEvent.setup();
			render(<TherapistProfile therapist={baseTherapist} />);

			const back = screen.getByRole("button", { name: /back/i });
			await user.click(back);

			expect(handleBackClickMock).toHaveBeenCalledTimes(1);
		});
	});

	describe("Props Handling", () => {
		it("uses empty picture path when therapist.picture is falsy", () => {
			const t = { ...baseTherapist, picture: "" };
			render(<TherapistProfile therapist={t} />);

			const img = screen.getByAltText("Therapist Profile Picture") as HTMLImageElement;
			expect(img).toBeTruthy();
			// path portion will be empty but still call our getPublicURL pattern
			expect(img.src).toContain("https://cdn.test/therapist_pictures/");
		});

		it("renders different ages and joined dates according to props", () => {
			const t = { ...baseTherapist, age: 45, created_at: "2019-12-31" };
			render(<TherapistProfile therapist={t} />);

			expect(screen.getByText(/45 years old/i)).toBeInTheDocument();
			expect(screen.getByText(/december 31, 2019/i)).toBeInTheDocument();
		});
	});
});
