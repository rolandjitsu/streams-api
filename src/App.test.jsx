import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App, { AvengersStream, CounterStream } from './App';

beforeEach(() => {
  // Mock fetch to avoid unhandled network calls in tests
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    Promise.resolve(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.close();
          },
        })
      )
    )
  );
});

afterEach(async () => {
  vi.restoreAllMocks();
  await cleanup();
});

describe('App & Streaming Tests', () => {
  it('renders 0 when counter is in initial state', () => {
    render(<CounterStream defaultUrl="" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders whatever the counter sends via ReadableStream', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ count: 1 }) + '\n'));
        controller.close();
      },
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    render(<App url="/counter" />);

    // Initial value is 0
    expect(screen.getByText('0')).toBeInTheDocument();

    // After stream chunk is processed
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('stops counter stream and aborts when Stop Stream is clicked', async () => {
    const encoder = new TextEncoder();
    let streamCancelled = false;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ count: 1 }) + '\n'));
      },
      cancel() {
        streamCancelled = true;
      },
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    render(<CounterStream autoStart={true} />);

    // Wait for count 1
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    const stopButton = screen.getByRole('button', { name: /Stop Stream/i });
    expect(stopButton).toBeInTheDocument();

    // Click Stop Stream
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // Button should now be Start Stream and status stopped
    expect(
      screen.getByRole('button', { name: /Start Stream/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/stopped/i)).toBeInTheDocument();

    // The underlying stream must have received cancel/abort
    expect(streamCancelled).toBe(true);
  });

  it('stops avengers stream and aborts when Stop Stream is clicked', async () => {
    const encoder = new TextEncoder();
    let streamCancelled = false;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              character: 'Iron Man',
              name: 'Tony Stark',
              founder: true,
            }) + '\n'
          )
        );
      },
      cancel() {
        streamCancelled = true;
      },
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    render(<AvengersStream />);

    const fetchButton = screen.getByRole('button', { name: /Fetch Avengers/i });
    await act(async () => {
      fireEvent.click(fetchButton);
    });

    // Wait for Iron Man to appear
    await waitFor(() => {
      expect(screen.getByText('Iron Man')).toBeInTheDocument();
    });

    const stopButton = screen.getByRole('button', { name: /Stop Stream/i });
    expect(stopButton).toBeInTheDocument();

    // Click Stop Stream
    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(
      screen.getByRole('button', { name: /Fetch Avengers/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/stopped/i)).toBeInTheDocument();

    // The underlying stream must have received cancel/abort
    expect(streamCancelled).toBe(true);
  });

  it('renders header, tabs and toggles to Avengers view', () => {
    render(<App />);

    expect(
      screen.getByText(/HTTP Streaming with Go & React/i)
    ).toBeInTheDocument();

    const counterTab = screen.getByRole('button', { name: /Counter Stream/i });
    expect(counterTab).toBeInTheDocument();

    const avengersTab = screen.getByRole('button', { name: /Avengers Stream/i });
    fireEvent.click(avengersTab);

    expect(
      screen.getByText(/Avengers Progressive Hydration/i)
    ).toBeInTheDocument();
  });
});
