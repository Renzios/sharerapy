import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LandingPageClient from "@/components/client-pages/LandingPageClient";

// controllable search params mock
const useSearchParamsMock = jest.fn(() => new URLSearchParams());
const pushMock = jest.fn();
const replaceMock = jest.fn();
const refreshMock = jest.fn();

// Mock next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => useSearchParamsMock(),
}));

// Mock next/link to call router.push when clicked
jest.mock("next/link", () => {
  const LinkMock = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} onClick={(e) => { e.preventDefault(); pushMock(href); }}>{children}</a>
  );
  LinkMock.displayName = "NextLinkMock";
  return { __esModule: true, default: LinkMock };
});

// Mock next/image to render a plain img for tests
jest.mock("next/image", () => ({
  __esModule: true,
  default: (() => {
    const NextImageMock = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} alt={props.alt || ""} />;
    };
    NextImageMock.displayName = "NextImageMock";
    return NextImageMock;
  })(),
}));

// Mock components: Button, Search, Toast
jest.mock("@/components/general/Button", () => {
  type ButtonProps = { onClick?: () => void; children?: React.ReactNode };
  const ButtonMock = (props: ButtonProps) => <button onClick={props.onClick}>{props.children}</button>;
  ButtonMock.displayName = "ButtonMock";
  return ButtonMock;
});

// Search mock: shows an input and a button to trigger onSearch
jest.mock("@/components/general/Search", () => {
  type SearchProps = { value?: string; onChange?: (v: string) => void; onSearch?: (v: string) => void };
  const SearchMock: React.FC<SearchProps> = (props) => {
    const value = props.value ?? "";
    return (
      <div>
        <input
          aria-label="search-input"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onChange?.(e.target.value)}
        />
        <button data-testid="search-button" onClick={() => props.onSearch?.(value)}>Search</button>
      </div>
    );
  };
  SearchMock.displayName = "SearchMock";
  return SearchMock;
});

jest.mock("@/components/general/Toast", () => {
  type ToastProps = { isVisible?: boolean; message?: React.ReactNode; onClose?: () => void };
  const ToastMock = (props: ToastProps) =>
    props.isVisible ? (
      <div>
        {props.message}
        <button onClick={props.onClose}>close</button>
      </div>
    ) : null;
  ToastMock.displayName = "ToastMock";
  return ToastMock;
});

// Mock auth actions and storage
const mockSignOut = jest.fn();
jest.mock("@/lib/actions/auth", () => ({ signOut: (...args: unknown[]) => mockSignOut(...(args as unknown[])) }));
const mockGetPublicURL = jest.fn((_: string, path: string) => `https://cdn.test/${path}`);
jest.mock("@/lib/utils/storage", () => ({ getPublicURL: (bucket: string, path: string) => mockGetPublicURL(bucket, path) }));

// Mock therapist hook
type TherapistProfile = { therapist: { id: string; picture: string } | null; isLoading: boolean };
const useTherapistProfileMock = jest.fn<TherapistProfile, []>(() => ({ therapist: { id: "ther-1", picture: "pic.jpg" }, isLoading: false }));
jest.mock("@/app/hooks/useTherapistProfile", () => ({ useTherapistProfile: () => useTherapistProfileMock() }));

describe("LandingPageClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default search params empty
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it("navigates to search with query when user searches non-empty term", async () => {
    render(<LandingPageClient />);

    const input = screen.getByLabelText("search-input");
    await userEvent.type(input, "anxiety");

    await userEvent.click(screen.getByTestId("search-button"));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/search?q=anxiety"));
  });

  it("navigates to /search when search term is empty", async () => {
    render(<LandingPageClient />);

    const input = screen.getByLabelText("search-input");
    // ensure empty
    await userEvent.clear(input);

    await userEvent.click(screen.getByTestId("search-button"));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/search"));
  });

  it("shows success toast and calls replace when loginSuccess is true", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("loginSuccess=true"));
    render(<LandingPageClient />);

    expect(await screen.findByText("Successfully logged in!")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("calls signOut and navigates to login on logout success", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    render(<LandingPageClient />);

    await userEvent.click(screen.getByText("Logout"));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows error toast when signOut fails", async () => {
    mockSignOut.mockRejectedValueOnce(new Error("fail"));
    render(<LandingPageClient />);

    await userEvent.click(screen.getByText("Logout"));

    expect(await screen.findByText("Failed to logout. Please try again.")).toBeInTheDocument();
  });

  it("renders therapist profile image and links to profile when not loading", async () => {
    useTherapistProfileMock.mockReturnValue({ therapist: { id: "ther-1", picture: "pic.jpg" }, isLoading: false });
    mockGetPublicURL.mockReturnValueOnce("https://cdn.test/therapist_pictures/pic.jpg");

    render(<LandingPageClient />);

    const profileImg = await screen.findByAltText("Profile Picture");
    expect(profileImg).toBeInTheDocument();
    // clicking link should call pushMock with therapist profile route
    await userEvent.click(profileImg.closest("a")!);
    expect(pushMock).toHaveBeenCalledWith("/profile/therapist/ther-1");
  });

  it("does not render profile image while loading", async () => {
  useTherapistProfileMock.mockReturnValue({ therapist: null, isLoading: true } as TherapistProfile);
    render(<LandingPageClient />);

    expect(screen.queryByAltText("Profile Picture")).toBeNull();
  });
});
