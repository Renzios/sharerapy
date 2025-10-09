import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '@/components/InputField';

describe('InputField Component', () => {
  it('renders correctly', () => {
    render(<InputField />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('passes the maxLength prop to the input', () => {
    render(<InputField maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('limits input manually if implemented', () => {
    render(<InputField maxLength={5} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123456' } });
    expect(input.value.length).toBeLessThanOrEqual(5);
  });
});
