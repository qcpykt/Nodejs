import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Services from "./pages/Services";

const App = () => {
    return (
        <Router>
            <div>
                <h1>Праздничные услуги</h1>
                <Switch>
                    <Route path="/register" component={Register} />
                    <Route path="/login" component={Login} />
                    <Route path="/services" component={Services} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;
