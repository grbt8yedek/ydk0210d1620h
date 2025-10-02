import { render, screen, fireEvent } from '@testing-library/react';
import ValidationPopup from '@/components/ValidationPopup';

describe('ValidationPopup', () => {
  const mockOnClose = jest.fn();
  const errors = ['Error 1', 'Error 2', 'Error 3'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when closed', () => {
    const { container } = render(<ValidationPopup isOpen={false} onClose={mockOnClose} errors={errors} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when open', () => {
    render(<ValidationPopup isOpen={true} onClose={mockOnClose} errors={errors} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
  });

  it('should display all errors', () => {
    render(<ValidationPopup isOpen={true} onClose={mockOnClose} errors={errors} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
    expect(screen.getByText('Error 3')).toBeInTheDocument();
  });

  it('should call onClose when button clicked', () => {
    render(<ValidationPopup isOpen={true} onClose={mockOnClose} errors={errors} />);
    fireEvent.click(screen.getByText('Tamam'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render alert icon', () => {
    const { container } = render(<ValidationPopup isOpen={true} onClose={mockOnClose} errors={errors} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

