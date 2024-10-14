import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import Spinner from 'react-bootstrap/Spinner'; // Импортируем компонент спиннера из Bootstrap

const HomePage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services`);
                setServices(response.data);
            } catch (err) {
                setError("Ошибка при загрузке услуг. Пожалуйста, попробуйте позже.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
                <p>Загрузка услуг...</p>
            </div>
        ); // Можно добавить спиннер здесь
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
                <button onClick={() => window.location.reload()} className="btn btn-secondary ms-2">
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>Услуги</h1>
            <ul className="list-group">
                {services.map((service) => (
                    <li key={service._id} className="list-group-item">
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <p>Цена: {service.price} руб.</p>
                        <Link to={`/service/${service._id}`} className="btn btn-primary">
                            Посмотреть детали
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HomePage;