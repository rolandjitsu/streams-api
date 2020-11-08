import {renderHook} from '@testing-library/react-hooks'
const fetchMock = require('fetch-mock');
import {sleep} from './sleep';
import {useStream} from './stream';

afterEach(() => fetchMock.reset());

test('useStream()', async () => {
  // Seems like passing stream to new Response() doesn't work;
  // so we need to set the body
  const response = new Response();
  response.body = new ReadableStream({
    async start(ctrl) {
      ctrl.enqueue(JSON.stringify({count: 1}));
      await sleep(1);
      ctrl.enqueue(JSON.stringify({count: 2}));
      ctrl.close();
    }
  });

  fetchMock.once('*', null, {
    response,
    sendAsJson: false
  });

  const {result, waitForNextUpdate} = renderHook(() => useStream({url: '/counter'}))
  await waitForNextUpdate();
  expect(result.current.data).toEqual({
    count: 1
  });
  await waitForNextUpdate();
  expect(result.current.data).toEqual({
    count: 2
  });
});
