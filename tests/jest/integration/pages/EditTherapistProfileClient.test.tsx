import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditTherapistProfileClient from "@/components/client-pages/EditTherapistProfileClient";
import type { Tables } from "@/lib/types/database.types";
import * as nextNav from "next/navigation";

// Mock Next.js navigation
jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: jest.fn(),
  };
});

// Mock server actions
jest.mock("@/lib/actions/therapists", () => ({
  updateTherapist: jest.fn(),
}));

// Mock context
jest.mock("@/app/contexts/TherapistProfileContext", () => ({
  useTherapistProfile: jest.fn(() => ({
    refetch: jest.fn(),
  })),
}));

// Mock hook
jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: jest.fn(() => ({
    handleBackClick: jest.fn(),
    canGoBack: true,
  })),
}));

// Mock child components
jest.mock("@/components/general/Button", () => {
  interface ButtonMockProps {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    variant?: string;
    className?: string;
  }
  const Component = (props: ButtonMockProps) => (
    <button
      data-testid={`button-${props.children?.toString().toLowerCase().replace(/\s+/g, "-")}`}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
    >
      {props.children}
    </button>
  );
  Component.displayName = "Button";
  return Component;
});

jest.mock("@/components/general/Input", () => {
  interface InputMockProps {
    label?: string;
    name?: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
  }
  const Component = (props: InputMockProps) => (
    <div>
      <label>{props.label}</label>
      <input
        data-testid={props.id || props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        required={props.required}
        placeholder={props.placeholder}
      />
    </div>
  );
  Component.displayName = "Input";
  return Component;
});

jest.mock("@/components/general/TextArea", () => {
  interface TextAreaMockProps {
    label?: string;
    name?: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
  }
  const Component = (props: TextAreaMockProps) => (
    <div>
      <label>{props.label}</label>
      <textarea
        data-testid={props.id || props.name}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        required={props.required}
        placeholder={props.placeholder}
        rows={props.rows}
        maxLength={props.maxLength}
      />
    </div>
  );
  Component.displayName = "TextArea";
  return Component;
});

jest.mock("@/components/general/Toast", () => {
  interface ToastMockProps {
    message?: string;
    type?: "success" | "error" | "info";
    isVisible?: boolean;
    onClose?: () => void;
  }
  const Component = (props: ToastMockProps) => {
    if (!props.isVisible) return null;
    return (
      <div
        data-testid="toast"
        data-visible="true"
        data-type={props.type}
      >
        {props.message}
      </div>
    );
  };
  Component.displayName = "Toast";
  return Component;
});

jest.mock("next/image", () => {
  interface ImageMockProps {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
  }
  const Component = (props: ImageMockProps) => (
    <img
      data-testid="therapist-image"
      src={props.src}
      alt={props.alt}
      className={props.className}
    />
  );
  Component.displayName = "Image";
  return Component;
});

jest.mock("@/lib/utils/storage", () => ({
  getPublicURL: jest.fn((bucket: string, path: string) => `https://mock.storage/${bucket}/${path}`),
}));

jest.mock("@/lib/utils/frontendHelpers", () => ({
  formatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
}));

import { updateTherapist } from "@/lib/actions/therapists";
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

describe("EditTherapistProfileClient integration", () => {
  const pushMock = jest.fn();
  const refreshMock = jest.fn();
  const refetchMock = jest.fn();
  const handleBackClickMock = jest.fn();

  type TherapistRelation = Tables<"therapists"> & {
    clinic: Tables<"clinics"> & {
      country: Tables<"countries">;
    };
  };

  const mockTherapist: TherapistRelation = {
    id: "therapist-1",
    first_name: "John",
    last_name: "Doe",
    name: "John Doe",
    bio: "Experienced therapist specializing in cognitive therapy.",
    age: 35,
    picture: "therapist-pic.jpg",
    clinic_id: 1,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    clinic: {
      id: 1,
      clinic: "Test Clinic",
      country_id: 1,
      country: {
        id: 1,
        country: "Test Country",
      },
    } as Tables<"clinics"> & { country: Tables<"countries"> },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (nextNav.useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      refresh: refreshMock,
      back: jest.fn(),
    });

    (useTherapistProfile as jest.Mock).mockReturnValue({
      refetch: refetchMock,
    });

    (useBackNavigation as jest.Mock).mockReturnValue({
      handleBackClick: handleBackClickMock,
      canGoBack: true,
    });

    (updateTherapist as jest.Mock).mockResolvedValue(undefined);

    global.FileReader = jest.fn().mockImplementation(function (this: {
      onloadend: (() => void) | null;
      result: string | null;
      readAsDataURL: (file: File) => void;
    }) {
      this.onloadend = null;
      this.result = null;
      this.readAsDataURL = function (file: File) {
        this.result = `data:image/jpeg;base64,${file.name}`;
        if (this.onloadend) {
          this.onloadend();
        }
      };
    }) as unknown as typeof FileReader;
  });

  it("renders all form fields with initial therapist data", () => {
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    expect(screen.getByTestId("first_name")).toHaveValue("John");
    expect(screen.getByTestId("last_name")).toHaveValue("Doe");
    expect(screen.getByTestId("bio")).toHaveValue("Experienced therapist specializing in cognitive therapy.");
    expect(screen.getByTestId("age")).toHaveValue(35);
    expect(screen.getByTestId("clinic_name")).toHaveValue("Test Clinic");
    expect(screen.getByTestId("country")).toHaveValue("Test Country");
  });

  it("renders the therapist profile picture", () => {
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const image = screen.getByTestId("therapist-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://mock.storage/therapist_pictures/therapist-pic.jpg");
  });

  it("updates first name when user types", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const firstNameInput = screen.getByTestId("first_name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    expect(firstNameInput).toHaveValue("Jane");
  });

  it("updates last name when user types", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const lastNameInput = screen.getByTestId("last_name");
    await user.clear(lastNameInput);
    await user.type(lastNameInput, "Smith");

    expect(lastNameInput).toHaveValue("Smith");
  });

  it("updates bio when user types", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const bioInput = screen.getByTestId("bio");
    await user.clear(bioInput);
    await user.type(bioInput, "Updated bio text");

    expect(bioInput).toHaveValue("Updated bio text");
  });

  it("updates age when user types", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const ageInput = screen.getByTestId("age");
    await user.clear(ageInput);
    await user.type(ageInput, "40");

    expect(ageInput).toHaveValue(40);
  });

  it("handles photo upload with valid image file", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    const image = screen.getByTestId("therapist-image");
    expect(image).toHaveAttribute("src", "data:image/jpeg;base64,test.jpg");
  });

  it("shows error toast for file size exceeding 5MB", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, largeFile);

    expect(await screen.findByText(/File size is too large.*Maximum size is 5MB/i)).toBeInTheDocument();
  });

  it("validates first name with only whitespace in validateForm", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const firstNameInput = screen.getByTestId("first_name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "   ");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    expect(await screen.findByText("Please enter your first name.")).toBeInTheDocument();
    expect(updateTherapist).not.toHaveBeenCalled();
  });

  it("validates last name with only whitespace in validateForm", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const lastNameInput = screen.getByTestId("last_name");
    await user.clear(lastNameInput);
    await user.type(lastNameInput, "   ");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    expect(await screen.findByText("Please enter your last name.")).toBeInTheDocument();
    expect(updateTherapist).not.toHaveBeenCalled();
  });

  it("validates bio with only whitespace in validateForm", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const bioInput = screen.getByTestId("bio");
    await user.clear(bioInput);
    await user.type(bioInput, "   ");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    expect(await screen.findByText("Please write something about yourself.")).toBeInTheDocument();
    expect(updateTherapist).not.toHaveBeenCalled();
  });

  it("validates age with zero value in validateForm", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const ageInput = screen.getByTestId("age");
    await user.clear(ageInput);
    await user.type(ageInput, "0");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    expect(await screen.findByText("Please enter a valid age.")).toBeInTheDocument();
    expect(updateTherapist).not.toHaveBeenCalled();
  });

  it("validates age with negative value in validateForm", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const ageInput = screen.getByTestId("age");
    await user.clear(ageInput);
    await user.type(ageInput, "-5");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    expect(await screen.findByText("Please enter a valid age.")).toBeInTheDocument();
    expect(updateTherapist).not.toHaveBeenCalled();
  });

  it("submits form with valid data and shows success toast", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const firstNameInput = screen.getByTestId("first_name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(updateTherapist).toHaveBeenCalledWith(
        "therapist-1",
        expect.any(FormData)
      );
    });

    expect(await screen.findByText("Profile updated successfully!")).toBeInTheDocument();
  });

  it("calls refetchProfile after successful update", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(updateTherapist).toHaveBeenCalled();
    });

    jest.advanceTimersByTime(200);

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });
    
    jest.useRealTimers();
  });

  it("calls router.refresh after successful update", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(updateTherapist).toHaveBeenCalled();
    });

    jest.advanceTimersByTime(200);

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    
    jest.useRealTimers();
  });

  it("redirects to profile page after successful update", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(updateTherapist).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });

    jest.advanceTimersByTime(200);
    jest.runAllTimers();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/profile/therapist/therapist-1");
    });
    
    jest.useRealTimers();
  });

  it("shows error toast when update fails", async () => {
    const user = userEvent.setup();
    (updateTherapist as jest.Mock).mockRejectedValueOnce(new Error("Update failed"));

    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    expect(await screen.findByText("Failed to update profile. Please try again.")).toBeInTheDocument();
  });

  it("disables form fields and buttons during submission", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId("first_name")).toBeDisabled();
      expect(screen.getByTestId("last_name")).toBeDisabled();
      expect(screen.getByTestId("bio")).toBeDisabled();
      expect(screen.getByTestId("age")).toBeDisabled();
      expect(screen.getByTestId("button-update")).toBeDisabled();
      expect(screen.getByTestId("button-back")).toBeDisabled();
    });
  });

  it("calls handleBackClick when Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const backButton = screen.getByTestId("button-back");
    await user.click(backButton);

    expect(handleBackClickMock).toHaveBeenCalled();
  });

  it("includes new photo file in form data when uploaded", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const file = new File(["dummy content"], "new-photo.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput, file);

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(updateTherapist).toHaveBeenCalled();
    });

    const formDataCall = (updateTherapist as jest.Mock).mock.calls[0][1] as FormData;
    const pictureValue = formDataCall.get("picture");
    expect(pictureValue).toBeInstanceOf(File);
    expect((pictureValue as File).name).toBe("new-photo.jpg");
  });

  it("handles photo change button click", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const changePhotoButton = screen.getByTestId("button-change-photo");
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const clickSpy = jest.spyOn(fileInput, "click");
    await user.click(changePhotoButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("renders with empty optional fields when therapist data is missing", () => {
    const minimalTherapist: TherapistRelation = {
      id: "therapist-2",
      first_name: "",
      last_name: "",
      name: "",
      bio: "",
      age: 0,
      picture: "",
      clinic_id: 1,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      clinic: {
        id: 1,
        clinic: "Test Clinic",
        country_id: 1,
        country: {
          id: 1,
          country: "Test Country",
        },
      } as Tables<"clinics"> & { country: Tables<"countries"> },
    };

    render(<EditTherapistProfileClient therapist={minimalTherapist} />);

    expect(screen.getByTestId("first_name")).toHaveValue("");
    expect(screen.getByTestId("last_name")).toHaveValue("");
    expect(screen.getByTestId("bio")).toHaveValue("");
    expect(screen.getByTestId("age")).toHaveValue(0);
  });

  it("submits form with all updated fields", async () => {
    const user = userEvent.setup();
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    await user.clear(screen.getByTestId("first_name"));
    await user.type(screen.getByTestId("first_name"), "Jane");
    await user.clear(screen.getByTestId("last_name"));
    await user.type(screen.getByTestId("last_name"), "Smith");
    await user.clear(screen.getByTestId("bio"));
    await user.type(screen.getByTestId("bio"), "Updated bio");
    await user.clear(screen.getByTestId("age"));
    await user.type(screen.getByTestId("age"), "42");

    const updateButton = screen.getByTestId("button-update");
    await user.click(updateButton);

    await waitFor(() => {
      expect(updateTherapist).toHaveBeenCalledWith("therapist-1", expect.any(FormData));
    });

    const formDataCall = (updateTherapist as jest.Mock).mock.calls[0][1] as FormData;
    expect(formDataCall.get("first_name")).toBe("Jane");
    expect(formDataCall.get("last_name")).toBe("Smith");
    expect(formDataCall.get("bio")).toBe("Updated bio");
    expect(formDataCall.get("age")).toBe("42");
  });

  it("maintains picture path as hidden field", () => {
    render(<EditTherapistProfileClient therapist={mockTherapist} />);

    const hiddenPictureInput = document.querySelector('input[name="picture"][type="hidden"]') as HTMLInputElement;
    expect(hiddenPictureInput).toBeInTheDocument();
    expect(hiddenPictureInput.value).toBe("therapist-pic.jpg");
  });
});
