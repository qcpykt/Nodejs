import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import ServiceDetails from './components/ServiceDetails';
import Services from './components/Services';
import Auth from './components/Auth';
import { Provider } from './components/Context'; // Импортируем UserProvider

const NotFound = () => <h2>404 - Страница не найдена</h2>;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
        return localStorage.getItem('userId') !== null;
    });
    const [userId, setUserId] = React.useState(() => {
        return localStorage.getItem('userId');
    });
    const [role, setRole] = React.useState(() => {
        return localStorage.getItem('role'); // Получаем роль пользователя из localStorage
    });
    const [userToken, setUserToken] = React.useState(() => {
        return localStorage.getItem('token'); // Получаем роль пользователя из localStorage
    });

    const handleLogin = (id, role, token) => {
        setIsAuthenticated(true);
        setUserId(id);
        setRole(role); // Устанавливаем роль пользователя
        localStorage.setItem('userId', id);
        localStorage.setItem('role', role); // Сохраняем роль в localStorage
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserId(null);
        setUserToken(null);
        setRole(null); // Сбрасываем роль
        localStorage.removeItem('userId');
        localStorage.removeItem('userToken');
        localStorage.removeItem('role'); // Сохраняем роль в localStorage
    };

    return (
        <Router>
            <div>
                <h1>Project 1</h1>
                <nav>
                    <ul>
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/services">Услуги</Link></li>
                        {isAuthenticated ? (
                            <>
                                <li><Link to="/profile">Профиль</Link></li>
                                {role === 'admin' && <li><Link to="/admin">Админка</Link></li>} {/* Проверка роли */}
                                <li><button className="btn btn-secondary" onClick={handleLogout}>Выйти</button></li>
                            </>
                        ) : (
                            <>
                                <li><div className="btn-group" role="group"><button type="submit" className="btn btn-success"><Link className="auth" to="/login">Вход
                                  </Link></button> <button type="submit" className="btn btn-primary"><Link className="auth" to="/register">Регистрация</Link></button></div></li>
                            </>
                        )}
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile" element={isAuthenticated ? <UserProfile userId={userId} /> : <Navigate to="/login" />} />
                    <Route path="/admin" element={isAuthenticated && role === 'admin' ? <Provider><AdminDashboard /></Provider> : <Navigate to="/login" />} /> {/* Проверка роли */}
                    <Route path="/services" element={<Services />} />
                    <Route path="/service/:serviceId" element={<ServiceDetails />} />
                    <Route path="/login" element={<Auth onLogin={handleLogin} />} />
                    <Route path="/register" element={<Auth onLogin={handleLogin} />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;