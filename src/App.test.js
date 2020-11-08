import {
  act,
  render,
  screen,
  waitFor
} from '@testing-library/react';
const fetchMock = require('fetch-mock');
import App from './App';

afterEach(() => fetchMock.reset());

test('renders 0 when no counter', () => {
  render(<App />);
  const noCount = screen.getByText(/0/i);
  expect(noCount).toBeInTheDocument();
});

test('renders whatever the counter sends', async () => {
  // Seems like passing stream to new Response() doesn't work;
  // so we need to set the body
  const response = new Response();
  response.body = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(JSON.stringify({count: 1}));
      ctrl.close();
    }
  });

  fetchMock.once('*', null, {
    response,
    sendAsJson: false
  });

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
