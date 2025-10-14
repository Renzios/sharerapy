import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/Input';
import satisfiesCharacterLimit from '@/components/Input';

describe('satisfiesCharacterLimit function', () => {
  it('returns true when input length is less than the limit', () => {
    const result = satisfiesCharacterLimit(10, 'hello');
    expect(result).toBe(true);
  });

  it('returns true when input length is equal to the limit', () => {
    const result = satisfiesCharacterLimit(5, 'hello');
    expect(result).toBe(true);
  });

  it('returns false when input length is greater than the limit', () => {
    const result = satisfiesCharacterLimit(3, 'hello');
    expect(result).toBe(false);
  });
});

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('passes the maxLength prop to the input', () => {
    render(<Input maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('limits input manually if implemented', () => {
    render(<Input maxLength={5} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123456' } });
    expect(input.value.length).toBeLessThanOrEqual(5);
  });
});
