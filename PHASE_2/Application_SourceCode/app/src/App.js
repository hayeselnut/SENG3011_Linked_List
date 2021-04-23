// import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Map from './map/map.js';
import Home from './home/home';

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
export default App;
