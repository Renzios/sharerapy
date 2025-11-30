import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/forms/LoginForm";

// Mocks for components used inside LoginForm
const pushMock = jest.fn();
const refreshMock = jest.fn();

const loginMock = jest.fn();

jest.mock("@/lib/actions/auth", () => ({
  __esModule: true,
  // accept unknown args and forward to the jest mock
  login: (...args: unknown[]) => loginMock(...(args as [FormData])),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

// Simple native input mock for the project's Input component
jest.mock("@/components/general/Input", () => ({
  __esModule: true,
  default: (props: InputProps) => {
    const { label, name, value, onChange, type = "text", placeholder, required } = props;
    // If the component doesn't pass a name, derive a stable id from the label so
    // multiple Inputs on the same form don't collide in the test DOM.
    const idBase = typeof label === "string" && label.length > 0 ? label : name || "input";
    const id = String(idBase).toLowerCase().replace(/\s+/g, "-") + "-input";
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
          type={type}
          placeholder={placeholder}
          required={required}
        />
      </div>
    );
  },
}));

// Button mock
jest.mock("@/components/general/Button", () => ({
  __esModule: true,
  default: (props: ButtonProps) => {
    const { children, disabled, type = "button", className } = props;
    return (
      <button type={type} disabled={disabled} className={className}>
        {children}
      </button>
    );
  },
}));

// Toast mock: renders message only when visible
jest.mock("@/components/general/Toast", () => ({
  __esModule: true,
  default: (props: ToastProps) => {
    const { message, isVisible } = props;
    return isVisible ? <div role="status">{message}</div> : null;
  },
}));

// next/image mock to avoid Next image internals in test environment
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImageProps) => {
    const { src, alt } = props;
    return <img src={src} alt={alt} />;
  },
}));

// --------------------
// Local test-only types
// --------------------
type InputProps = {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
};

type ButtonProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  // narrow to the valid button types to satisfy JSX attribute typing
  type?: "button" | "submit" | "reset";
  className?: string;
};

type ToastProps = {
  message?: string;
  isVisible?: boolean;
  onClose?: () => void;
  duration?: number;
  type?: "success" | "error" | "info";
};

type ImageProps = {
  src?: string;
  alt?: string;
};

describe("LoginForm", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    try {
      jest.clearAllTimers();
      jest.useRealTimers();
    } catch (e) {
      // ignore
    }
  });

  describe("Rendering", () => {
    it("shows heading, inputs, and submit button", () => {
  render(<LoginForm disableGreeting />);

      // greeting text (one of the rotating greetings)
      expect(screen.getByText(/Hello!|Kamusta!|안녕하세요!/i)).toBeInTheDocument();

      // Inputs by placeholder (stable selectors)
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();

      // Button
      expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();

      // Footer copyright
      expect(screen.getByText(/All rights reserved Sharerapy 2025/i)).toBeInTheDocument();
    });

    it("does not show toast initially", () => {
  render(<LoginForm disableGreeting />);
      expect(screen.queryByRole("status")).toBeNull();
    });
  });

  describe("User Interaction", () => {
    it("typing updates email and password and successful submit calls login and navigates", async () => {
      // mock login to resolve immediately
      loginMock.mockResolvedValueOnce(undefined);

  const user = userEvent.setup();
  render(<LoginForm disableGreeting />);

  const email = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
  const password = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;
  const submit = screen.getByRole("button", { name: /log in/i }) as HTMLButtonElement;

  await user.type(email, "me@example.com");
  await user.type(password, "hunter2");

  expect(email.value).toBe("me@example.com");
  expect(password.value).toBe("hunter2");

  await user.click(submit);

      // login should be called with a FormData containing our values
      await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1));
      const formArg = loginMock.mock.calls[0][0] as FormData;
      expect(formArg.get("email")).toBe("me@example.com");
      expect(formArg.get("password")).toBe("hunter2");

      // router.push should be called on success
      expect(pushMock).toHaveBeenCalledWith("/?loginSuccess=true");
      expect(refreshMock).toHaveBeenCalled();
    });

    it("failed login shows toast with error message", async () => {
      // make login throw
      loginMock.mockRejectedValueOnce(new Error("bad creds"));
      const user = userEvent.setup();

      render(<LoginForm disableGreeting />);

      const email = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
      const password = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;
      const submit = screen.getByRole("button", { name: /log in/i }) as HTMLButtonElement;

      await user.type(email, "wrong@example.com");
      await user.type(password, "wrongpass");

      await user.click(submit);

      // wait for toast to appear with expected message
      const toast = await screen.findByRole("status");
      expect(toast).toHaveTextContent(/Invalid credentials. Please check your email and password./i);
    });

    it("submit button becomes disabled while login is pending", async () => {
      const user = userEvent.setup();

      // Create a promise we control so we can inspect intermediate state
      let resolveLogin: () => void;
      const pending = new Promise<void>((res) => {
        resolveLogin = res;
      });
      loginMock.mockImplementationOnce(() => pending);

      render(<LoginForm disableGreeting />);
      const email = screen.getByLabelText("Email") as HTMLInputElement;
      const password = screen.getByLabelText("Password") as HTMLInputElement;
      const submit = screen.getByRole("button", { name: /log in/i }) as HTMLButtonElement;

      await user.type(email, "me@example.com");
      await user.type(password, "hunter2");

      // start submit
      await user.click(submit);

      // button should be disabled while pending
      await waitFor(() => expect(submit.disabled).toBe(true));

      // resolve login and wait for submit handler to finish
      resolveLogin!();

      // after resolution, push should be called
      await waitFor(() => expect(pushMock).toHaveBeenCalled());
    });
  });

  describe("Props Handling", () => {
    it("uses correct input types for email and password and passes required attribute", () => {
      render(<LoginForm />);

      const email = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
      const password = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;

      expect(email.type).toBe("email");
      expect(password.type).toBe("password");

      expect(email.required).toBe(true);
      expect(password.required).toBe(true);
    });

    it("rotates greeting text over time", async () => {
      jest.useFakeTimers();
      render(<LoginForm />);

      // initial greeting should be one of the greetings
      expect(screen.getByText(/Hello!|Kamusta!|안녕하세요!/i)).toBeInTheDocument();


      // advance to next greeting: 4000ms interval + 300ms fade timeout
      act(() => {
        jest.advanceTimersByTime(4300);
      });

      // Re-render/update callbacks happen on timers; wait for the greeting text to change
      await waitFor(() => expect(screen.queryByText(/Hello!/i)).not.toBeInTheDocument());

      // One of the other greetings should be present
      expect(screen.getByText(/Kamusta!|안녕하세요!/)).toBeInTheDocument();

      jest.useRealTimers();
    });
  });
});
