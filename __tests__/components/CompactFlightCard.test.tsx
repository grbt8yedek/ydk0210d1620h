import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompactFlightCard from '@/components/CompactFlightCard';

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'HH:mm') {
      const d = new Date(date);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return date.toString();
  }),
}));

describe('CompactFlightCard Component', () => {
  const mockAirlinesList = [
    { name: 'Turkish Airlines', logoUrl: '/logos/thy.png' },
    { name: 'Pegasus', logoUrl: '/logos/pegasus.png' },
  ];

  const mockFlight = {
    airlineName: 'Turkish Airlines',
    departureTime: '2025-01-15T10:30:00Z',
    arrivalTime: '2025-01-15T14:45:00Z',
    price: 250,
    origin: 'IST',
    destination: 'FRA',
    direct: true,
    baggage: '20kg',
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders flight card with airline name', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Turkish Airlines')).toBeInTheDocument();
  });

  it('renders airline logo when available', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const logo = screen.getByAltText('Turkish Airlines');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logos/thy.png');
  });

  it('renders fallback icon when logo not available', () => {
    const flightWithoutLogo = { ...mockFlight, airlineName: 'Unknown Airline' };

    const { container } = render(
      <CompactFlightCard
        flight={flightWithoutLogo}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const fallbackIcon = container.querySelector('.bg-orange-500');
    expect(fallbackIcon).toBeInTheDocument();
    expect(fallbackIcon).toHaveTextContent('U');
  });

  it('renders departure and arrival times', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    // Times will be formatted by date-fns mock
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it('renders default time when departureTime is missing', () => {
    const flightWithoutTime = { ...mockFlight, departureTime: null };

    render(
      <CompactFlightCard
        flight={flightWithoutTime}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/--:--/)).toBeInTheDocument();
  });

  it('renders price correctly', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('250.00 €')).toBeInTheDocument();
  });

  it('renders origin and destination', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/IST > FRA/)).toBeInTheDocument();
  });

  it('renders "Direkt" badge when flight is direct', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Direkt')).toBeInTheDocument();
  });

  it('does not render "Direkt" badge when flight is not direct', () => {
    const nonDirectFlight = { ...mockFlight, direct: false };

    render(
      <CompactFlightCard
        flight={nonDirectFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByText('Direkt')).not.toBeInTheDocument();
  });

  it('renders baggage information', () => {
    render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('20kg')).toBeInTheDocument();
  });

  it('renders default baggage when not provided', () => {
    const flightWithoutBaggage = { ...mockFlight, baggage: null };

    render(
      <CompactFlightCard
        flight={flightWithoutBaggage}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('El çantası')).toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    const { container } = render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('border-blue-500');
    expect(card).toHaveClass('bg-blue-50');
  });

  it('applies default styles when isSelected is false', () => {
    const { container } = render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('border-gray-200');
    expect(card).not.toHaveClass('border-blue-500');
  });

  it('calls onSelect when card is clicked', () => {
    const { container } = render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('has cursor-pointer class', () => {
    const { container } = render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('handles case-insensitive airline matching', () => {
    const flightWithLowerCase = { ...mockFlight, airlineName: 'turkish airlines' };

    render(
      <CompactFlightCard
        flight={flightWithLowerCase}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const logo = screen.getByAltText('Turkish Airlines');
    expect(logo).toBeInTheDocument();
  });

  it('uses airline field if airlineName is missing', () => {
    const flightWithAirlineField = {
      ...mockFlight,
      airlineName: undefined,
      airline: 'Pegasus',
    };

    render(
      <CompactFlightCard
        flight={flightWithAirlineField}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Pegasus')).toBeInTheDocument();
  });

  it('uses default airline name when both fields are missing', () => {
    const flightWithoutAirline = {
      ...mockFlight,
      airlineName: undefined,
      airline: undefined,
    };

    render(
      <CompactFlightCard
        flight={flightWithoutAirline}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Pegasus')).toBeInTheDocument();
  });

  it('renders baggage icon SVG', () => {
    const { container } = render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies transition classes', () => {
    const { container } = render(
      <CompactFlightCard
        flight={mockFlight}
        airlinesList={mockAirlinesList}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('duration-200');
  });
});
