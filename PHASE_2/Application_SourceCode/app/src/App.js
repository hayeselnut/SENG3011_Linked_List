import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Map from './map/map.js';

function App() {
  return (
    <Router>
      {/* <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/map">Map</Link>
            </li>
          </ul>
        </nav> */}

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/map">
            <Map/>
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      {/* </div> */}
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

// function MapPage() {
//   return <Map/>;
// }

export default App;
