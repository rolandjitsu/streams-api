import {useMemo} from 'react';
import {useStream} from './stream';
import './App.css';

function App(props) {
  const {data} = useStream({url: props.url});
  const count = useMemo(() => data !== null ? data.count : 0, [data]);

  return (
    <div className="App">
      <p>{count}</p>
    </div>
  );
}

export default App;
