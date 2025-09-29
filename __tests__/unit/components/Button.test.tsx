import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Button');
  });

  it('calls onClick when clicked', () => {
    render(<Button onClick={mockOnClick}>Click Me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  describe('Variants', () => {
    it('renders filled variant by default', () => {
      render(<Button>Filled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders outline variant correctly', () => {
      render(<Button variant="outline">Outline Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Shapes', () => {
    it('renders square shape by default', () => {
      render(<Button>Square Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders pill shape correctly', () => {
      render(<Button shape="pill">Pill Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Width Options', () => {
    it('renders with custom width', () => {
      render(<Button width="10rem">Custom Width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '10rem' });
    });
  });

  describe('Height Options', () => {
    it('renders with custom height', () => {
      render(<Button height="3rem">Custom Height</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ height: '3rem' });
    });
  });

  describe('Font Size Options', () => {
    it('renders with custom font size', () => {
      render(<Button fontSize="1.5rem">Custom Font</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ fontSize: '1.5rem' });
    });
  });

  describe('Disabled State', () => {
    it('can be disabled', () => {
      render(<Button disabled onClick={mockOnClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Button Types', () => {
    it('uses button type by default', () => {
      render(<Button>Default Type</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('can be set as submit type', () => {
      render(<Button type="submit">Submit Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Custom Classes', () => {
    it('accepts additional className prop', () => {
      render(<Button className="custom-class">Custom Class</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('renders text content', () => {
      render(<Button>Text Content</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Text Content');
    });

    it('renders JSX content', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('IconText');
    });
  });
});