import { useCallback, useEffect, useRef, useState } from 'react';
import { useStream } from 'react-fetch-streams';
import './App.css';

const DEFAULT_SERVER_URL = 'http://localhost:9000';

function StreamSubscriber({ url, onNext, onDone, onError, closeRef }) {
  const { close } = useStream(url, { onNext, onDone, onError });

  useEffect(() => {
    closeRef.current = close;
    return () => {
      close();
      closeRef.current = null;
    };
  }, [close, closeRef]);

  return null;
}

export function CounterStream({
  serverUrl = DEFAULT_SERVER_URL,
  defaultUrl,
  autoStart = false,
}) {
  const isInitiallyActive =
    defaultUrl !== undefined ? Boolean(defaultUrl) : autoStart;

  const [count, setCount] = useState(0);
  const [active, setActive] = useState(isInitiallyActive);
  const [delay, setDelay] = useState('1s');
  const [max, setMax] = useState('');
  const [status, setStatus] = useState(isInitiallyActive ? 'streaming' : 'idle');
  const [history, setHistory] = useState([]);
  const [streamId, setStreamId] = useState(Date.now());

  const closeRef = useRef(null);
  const isStoppingRef = useRef(false);

  const streamUrl =
    defaultUrl !== undefined
      ? defaultUrl
      : `${serverUrl}/counter?delay=${delay}${max ? `&max=${max}` : ''}&_=${streamId}`;

  const onNext = useCallback(async (res) => {
    if (isStoppingRef.current) return;
    try {
      const data = await res.json();
      if (isStoppingRef.current) return;
      setCount(data.count);
      setStatus('streaming');
      setHistory((prev) => [
        { count: data.count, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    } catch {
      // Ignore parse error on truncated chunks
    }
  }, []);

  const onDone = useCallback(() => {
    if (!isStoppingRef.current) {
      setStatus('completed');
    }
  }, []);

  const onError = useCallback((err) => {
    if (!isStoppingRef.current && err?.name !== 'AbortError') {
      setStatus('error');
    }
  }, []);

  const handleToggle = () => {
    if (active) {
      isStoppingRef.current = true;
      if (closeRef.current) {
        closeRef.current();
      }
      setActive(false);
      setStatus('stopped');
    } else {
      isStoppingRef.current = false;
      setStreamId(Date.now());
      setActive(true);
      setStatus('streaming');
    }
  };

  const handleReset = () => {
    isStoppingRef.current = true;
    if (closeRef.current) {
      closeRef.current();
    }
    setActive(false);
    setCount(0);
    setHistory([]);
    setStatus('idle');
  };

  return (
    <div className="stream-card">
      {active && streamUrl && (
        <StreamSubscriber
          url={streamUrl}
          onNext={onNext}
          onDone={onDone}
          onError={onError}
          closeRef={closeRef}
        />
      )}

      <div className="card-header">
        <div className="card-title-group">
          <h2>Counter Stream</h2>
          <span className={`status-pill status-${status}`}>{status}</span>
        </div>
        <div className="card-endpoint">GET /counter</div>
      </div>

      <div className="counter-display">
        <div className="count-number">{count}</div>
        <div className="count-caption">Current Value</div>
      </div>

      <div className="controls-row">
        <label>
          Delay:
          <select
            value={delay}
            disabled={active}
            onChange={(e) => setDelay(e.target.value)}
          >
            <option value="200ms">200ms (Fast)</option>
            <option value="500ms">500ms</option>
            <option value="1s">1s (Default)</option>
            <option value="2s">2s (Slow)</option>
          </select>
        </label>

        <label>
          Max:
          <input
            type="number"
            placeholder="Infinite"
            value={max}
            disabled={active}
            min="1"
            onChange={(e) => setMax(e.target.value)}
          />
        </label>
      </div>

      <div className="button-group">
        <button
          className={`btn ${active ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleToggle}
        >
          {active ? 'Stop Stream' : 'Start Stream'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <h4>Recent Chunks</h4>
          <div className="history-chips">
            {history.map((item, idx) => (
              <span key={idx} className="chunk-chip">
                #{item.count} <small>({item.time})</small>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AvengersStream({ serverUrl = DEFAULT_SERVER_URL }) {
  const [avengers, setAvengers] = useState([]);
  const [active, setActive] = useState(false);
  const [delay, setDelay] = useState('1s');
  const [status, setStatus] = useState('idle');
  const [streamId, setStreamId] = useState(Date.now());

  const closeRef = useRef(null);
  const isStoppingRef = useRef(false);

  const streamUrl = `${serverUrl}/avengers?delay=${delay}&_=${streamId}`;

  const onNext = useCallback(async (res) => {
    if (isStoppingRef.current) return;
    try {
      const data = await res.json();
      if (isStoppingRef.current) return;
      setAvengers((prev) => [...prev, data]);
      setStatus('streaming');
    } catch {
      // Ignore parse error
    }
  }, []);

  const onDone = useCallback(() => {
    if (!isStoppingRef.current) {
      setStatus('completed');
      setActive(false);
    }
  }, []);

  const onError = useCallback((err) => {
    if (!isStoppingRef.current && err?.name !== 'AbortError') {
      setStatus('error');
    }
  }, []);

  const handleStart = () => {
    isStoppingRef.current = false;
    setAvengers([]);
    setStreamId(Date.now());
    setActive(true);
    setStatus('streaming');
  };

  const handleStop = () => {
    isStoppingRef.current = true;
    if (closeRef.current) {
      closeRef.current();
    }
    setActive(false);
    setStatus('stopped');
  };

  return (
    <div className="stream-card">
      {active && (
        <StreamSubscriber
          url={streamUrl}
          onNext={onNext}
          onDone={onDone}
          onError={onError}
          closeRef={closeRef}
        />
      )}

      <div className="card-header">
        <div className="card-title-group">
          <h2>Avengers Progressive Hydration</h2>
          <span className={`status-pill status-${status}`}>{status}</span>
        </div>
        <div className="card-endpoint">GET /avengers</div>
      </div>

      <p className="section-desc">
        Demonstrates streaming an array of structured JSON objects. Each hero is rendered
        as soon as its chunk is flushed over HTTP.
      </p>

      <div className="controls-row">
        <label>
          Chunk Delay:
          <select
            value={delay}
            disabled={active}
            onChange={(e) => setDelay(e.target.value)}
          >
            <option value="200ms">200ms</option>
            <option value="500ms">500ms</option>
            <option value="1s">1s (Default)</option>
          </select>
        </label>
      </div>

      <div className="button-group">
        <button
          className={`btn ${active ? 'btn-danger' : 'btn-primary'}`}
          onClick={active ? handleStop : handleStart}
        >
          {active ? 'Stop Stream' : 'Fetch Avengers'}
        </button>
      </div>

      <div className="avengers-grid">
        {avengers.map((hero, idx) => (
          <div key={idx} className="avenger-card fade-in">
            <div className="avenger-header">
              <span className="avenger-char">{hero.character}</span>
              {hero.founder && <span className="founder-badge">Founder</span>}
            </div>
            <div className="avenger-name">{hero.name}</div>
          </div>
        ))}
        {active && avengers.length < 5 && (
          <div className="avenger-card card-loading">
            <div className="loading-spinner"></div>
            <span>Waiting for next chunk...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function App(props) {
  // If props.url is provided, preserve simple counter view for tests / embedded use
  if (props && props.url !== undefined) {
    return (
      <div className="App">
        <CounterStream defaultUrl={props.url} />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('counter');

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-badge">Web Streams API Demo</div>
        <h1>HTTP Streaming with Go & React</h1>
        <p className="header-subtitle">
          Demonstrating chunked HTTP data streaming with Go (Echo) and the browser Streams API via{' '}
          <a
            href="https://github.com/rolandjitsu/react-fetch-streams"
            target="_blank"
            rel="noopener noreferrer"
            className="highlight-link"
          >
            react-fetch-streams
          </a>
          .
        </p>
        <div className="header-links">
          <a
            href="https://rolandsdev.blog/posts/the-streams-api-in-javascript-and-go/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            📖 Read the Blog Post
          </a>
          <a
            href="https://github.com/rolandjitsu/streams-api"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            ⭐ View on GitHub
          </a>
        </div>
      </header>

      <main className="app-container">
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'counter' ? 'active' : ''}`}
            onClick={() => setActiveTab('counter')}
          >
            ⏱️ Counter Stream
          </button>
          <button
            className={`tab-btn ${activeTab === 'avengers' ? 'active' : ''}`}
            onClick={() => setActiveTab('avengers')}
          >
            🦸 Avengers Stream
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'counter' ? <CounterStream /> : <AvengersStream />}
        </div>
      </main>
    </div>
  );
}

export default App;
