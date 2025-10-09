import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/Input';

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
