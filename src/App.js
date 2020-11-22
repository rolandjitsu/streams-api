import {useState} from 'react';
import {useStream} from 'react-fetch-streams';
import './App.css';

function App(props) {
  const [count, setCount] = useState(0);
  useStream(props.url, {
    onNext: async res => {
      const data = await res.json();
      setCount(data.count);
    }
  });

  return (
    <div className="App">
      <p>{count}</p>
    </div>
  );
}

export default App;
