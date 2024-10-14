import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Импортируем Link для навигации

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newService, setNewService] = useState({
        title: "",
        description: "",
        price: "",
        categoryId: "",
    });
    const [addError, setAddError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services`);
                setServices(response.data);
            } catch (err) {
                setError("Ошибка при загрузке услуг. Пожалуйста, попробуйте позже.");
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewService((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAddError(""); // Сбрасываем ошибки перед новой попыткой
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/services`,
                newService
            );
            setServices((prev) => [...prev, response.data]); // Добавляем новую услугу в список
            setSuccessMessage("Услуга успешно добавлена!");
            setNewService({ title: "", description: "", price: "", categoryId: "" }); // Сбрасываем форму
        } catch (err) {
            setAddError("Ошибка при добавлении услуги. Пожалуйста, попробуйте позже.");
            console.error("Error adding service:", err);
        }
    };

    if (loading) {
        return <div>Загрузка услуг...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Доступные услуги</h2>
            <ul className="list-group">
                {services.map((service) => (
                    <li key={service._id} className="list-group-item">
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <p>Цена: {service.price} руб.</p>
                        <Link to={`/service/${service._id}`} className="btn btn-success">
                            Посмотреть детали
                        </Link>
                    </li>
                ))}
            </ul>

            <h3 className="mt-5">Добавить новую услугу</h3>
            {addError && <div className="alert alert-danger">{addError}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Название услуги:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={newService.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Описание услуги:</label>
                    <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={newService.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Цена:</label>
                    <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={newService.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="categoryId">ID категории:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="categoryId"
                        name="categoryId"
                        value={newService.categoryId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Добавить услугу</button>
            </form>
        </div>
    );
};

export default Services;