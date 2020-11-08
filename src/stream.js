import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

/**
 * Stream react hook
 * @param {object} params
 * @param {string} params.url
 */
export function useStream(params) {
  const [data, setData] = useState(null);
  const streamRef = useRef();
  const url = useRef();

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.abort();
    }
  }, []);

  useEffect(() => {
    if (url.current !== params.url) {
      if (streamRef.current) {
        streamRef.current.abort();
      }
      streamRef.current = new AbortController();
      startStream(params.url, data => setData(data), streamRef.current.signal);
    }

    return () => { };
  }, [params.url]);

  return {data, stop};
}

/**
 * Use this function to start streaming data from an URL
 * @param {string} url
 * @param {Function} cb
 * @param {AbortSignal} sig
 */
export async function startStream(url, cb, signal) {
  const res = await fetch(url, {
    signal,
    method: 'GET'
  });

  const reader = res.body.getReader();

  while (true) {
    const {done, value} = await reader.read();
    const res = new Response(value);
    try {
      const data = await res.json();
      if (typeof cb === 'function') {
        cb(data);
      }
    } catch (e) {
      return;
    }

    if (done) {
      return;
    }
  }
}
