import {
  act,
  cleanup,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import fetchMock from 'fetch-mock-jest';
import App from './App';

afterEach(async () => {
  fetchMock.reset();
  await cleanup();
});

test('renders 0 when no counter', () => {
  render(<App />);
  const noCount = screen.getByText(/0/i);
  expect(noCount).toBeInTheDocument();
});

test('renders whatever the counter sends', async () => {
  const response = new Response();
  // NOTE: This is a hack; we should pass the stream
  // to the Response (not supported yet).
  response.body = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(JSON.stringify({count: 1}));
      ctrl.close();
    }
  });

  fetchMock.once('*', null, {response});

  const ui = (<App url="/counter" />);
  const {rerender} = render(ui);

  const noCount = screen.getByText(/0/i);
  expect(noCount).toBeInTheDocument();
  // screen.debug();

  await flushPromises(rerender, ui);
  // screen.debug();

  const one = screen.getByText(/1/i);
  expect(one).toBeInTheDocument();
});

async function flushPromises(rerender, ui) {
  await act(() => waitFor(() => rerender(ui)));
}
