// import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Map from './map/map.js';

function App() {
  return (
    <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/map" component={Map} />
        </Switch>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

export default App;
