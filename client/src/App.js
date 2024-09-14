import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Services from "./pages/Services";

const NotFound = () => {
    return <h2>404 - Страница не найдена</h2>;
};

const App = () => {
    return (
        <Router>
            <div>
                <h1>Праздничные услуги</h1>
                <nav>
                    <ul>
                        <li>
                            <Link to="/register">Регистрация</Link>
                        </li>
                        <li>
                            <Link to="/login">Вход</Link>
                        </li>
                        <li>
                            <Link to="/services">Услуги</Link>
                        </li>
                    </ul>
                </nav>
                <Switch>
                    <Route path="/register" component={Register} />
                    <Route path="/login" component={Login} />
                    <Route path="/services" component={Services} />
                    <Route component={NotFound} /> {/* Обработка 404 */}
                </Switch>
            </div>
        </Router>
    );
};

export default App;
