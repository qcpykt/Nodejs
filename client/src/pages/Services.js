import React, { useEffect, useState } from "react";
import axios from "axios";
import Booking from "../components/Booking"; // Импортируем компонент бронирования
import Reviews from "../components/Reviews"; // Импортируем компонент отзывов

const Services = () => {
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            const response = await axios.get(
                "https://a44fb36f-9a36-471e-83fa-39ad2a30d40d-00-4n2exbzy3e5h.pike.replit.dev:5000/api/services",
            );
            setServices(response.data);
        };
        fetchServices();
    }, []);

    return (
        <div className="container mt-5">
            <h2>Доступные услуги</h2>
            <ul className="list-group">
                {services.map((service) => (
                    <li key={service._id} className="list-group-item">
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <p>Цена: {service.price} руб.</p>
                        <button
                            className="btn btn-success"
                            onClick={() => setSelectedServiceId(service._id)}
                        >
                            Забронировать
                        </button>
                    </li>
                ))}
            </ul>
            {selectedServiceId && (
                <>
                    <Booking serviceId={selectedServiceId} />
                    <Reviews serviceId={selectedServiceId} />
                </>
            )}
        </div>
    );
};

export default Services;
