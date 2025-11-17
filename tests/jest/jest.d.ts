/// <reference types="jest" />
/// <reference types="@types/jest" />

// Extend jest matchers
import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string): R
      toBeVisible(): R
      toBeDisabled(): R
      toHaveValue(value: string | number): R
      toHaveAttribute(attr: string, value?: string): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeValid(): R
      toBeInvalid(): R
      toHaveClass(className: string): R
      toHaveStyle(style: string | object): R
    }
  }
}
