import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "@/components/general/Toast";

// Mock timers for testing auto-close functionality
jest.useFakeTimers();

describe('Toast Component', () => {
  const mockOnClose = jest.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Rendering', () => {
    describe('Visibility', () => {
      it('renders when isVisible is true', () => {
        render(
          <Toast 
            message="Test message" 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      it('does not render when isVisible is false', () => {
        render(
          <Toast 
            message="Test message" 
            isVisible={false} 
            onClose={mockOnClose} 
          />
        );
        
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });
    describe('Message Display', () => {
      it('displays the correct message', () => {
        const message = 'This is a test toast message';
        render(
          <Toast 
            message={message} 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        expect(screen.getByText(message)).toBeInTheDocument();
      });

      it("handles non-latin characters in the message", () => {
        const message = 'Тестовое сообщение с особыми символами: 你好，こんにちは';
        render(
          <Toast 
            message={message} 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );

        expect(screen.getByText(message)).toBeInTheDocument();
      });

      describe('Edge Cases', () => {
        it('handles empty message', () => {
          render(
            <Toast 
              type="info"
              message="" 
              isVisible={true} 
              onClose={mockOnClose} 
            />
          );
          
          // Test that the toast still renders with icons and close button
          expect(screen.getByText('ℹ')).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /close toast/i })).toBeInTheDocument();
          
          // Test that the message paragraph exists even if empty
          const messageElements = screen.getAllByRole('button')[0].parentElement?.querySelector('p');
          expect(messageElements).toBeInTheDocument();
        });

        it('handles very long messages', () => {
          const longMessage = 'A'.repeat(500);
          render(
            <Toast 
              message={longMessage} 
              isVisible={true} 
              onClose={mockOnClose} 
            />
          );
          
          // Test that the long message renders correctly and actually appears in the document
          expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it('handles special characters in message', () => {
          const specialMessage = 'Message with émojis 🎉 and spécial chärs!';
          render(
            <Toast 
              message={specialMessage} 
              isVisible={true} 
              onClose={mockOnClose} 
            />
          );

          // Test that the toast with special message renders correctly and actually appears in the document
          expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });
      });
    });

    describe('Toast Types', () => {
      it('renders success type with correct icon', () => {
        render(
          <Toast 
            message="Success message" 
            type="success"
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );

        expect(screen.getByText('✓')).toBeInTheDocument();
      });

      it('renders error type with correct icon', () => {
        render(
          <Toast 
            message="Error message" 
            type="error"
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        expect(screen.getByText('✕')).toBeInTheDocument();
      });

      it('renders info type with correct icon', () => {
        render(
          <Toast 
            message="Info message" 
            type="info"
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        expect(screen.getByText('ℹ')).toBeInTheDocument();
      });

      it('defaults to info type when no type is specified', () => {
        render(
          <Toast 
            message="Default message" 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        expect(screen.getByText('ℹ')).toBeInTheDocument();
      });
    });
  });
  
  describe('User Interaction', () => {
    describe('Close Functionality', () => {
      it('renders close button with correct aria-label', () => {
        render(
          <Toast 
            message="Test message" 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        const closeButton = screen.getByRole('button', { name: /close toast/i });
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAttribute('aria-label', 'Close toast');
      });

      it('calls onClose when close button is clicked', async () => {
        render(
          <Toast 
            message="Test message" 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        const closeButton = screen.getByRole('button', { name: /close toast/i });
        await user.click(closeButton);

        // Wait for the animation delay
        jest.advanceTimersByTime(300);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    describe('Auto-close Functionality', () => {
      it('auto-closes after default duration (5000ms)', () => {
        render(
          <Toast 
            message="Test message" 
            isVisible={true} 
            onClose={mockOnClose} 
          />
        );
        
        // Fast-forward past the default duration + animation time
        jest.advanceTimersByTime(5000 + 300);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
      it('does not auto-close when duration is negative', () => {
        render(
          <Toast 
            message="Test message" 
            isVisible={true} 
            onClose={mockOnClose}
            duration={-1000}
          />
        );
        
        // Fast-forward a long time
        jest.advanceTimersByTime(10000);
        
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });
  });

  
});
