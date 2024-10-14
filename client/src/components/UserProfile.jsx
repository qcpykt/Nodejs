import React, { useEffect, useState } from "react";
import axios from "axios";
import Reviews from "./UserProfileReviews"; // Импортируем компонент для отображения отзывов

const UserProfile = ({ userId, serviceId }) => {
    const [userData, setUserData] = useState({ firstName: "", middleName: "", lastName: "", userName: "", phone: "", email: "" });
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ firstName: "", middleName: "", lastName: "", userName: "", phone: "", email: "", rating: "", comment: "" });
    const [successMessage, setSuccessMessage] = useState("");

    // Функция для получения данных пользователя и его отзывов
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('userToken'); // Получаем токен из localStorage
            if (!token) {
                setError("Необходима авторизация");
                setLoading(false);
                return;
            }

            try {
                const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'  } // Добавляем токен в заголовок
                });
                setUserData(userResponse.data);
                setFormData({ firstName: userResponse.data.firstName, middleName: userResponse.data.middleName, lastName: userResponse.data.lastName, userName: userResponse.data.userName, phone: userResponse.data.phone, email: userResponse.data.email }); // Устанавливаем начальные значения для формы

                const reviewsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}/reviews`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'  } // Добавляем токен в заголовок
                });
                setReviews(reviewsResponse.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Ошибка при загрузке данных пользователя.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Обработчик изменений в форме
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
  
      // Обработчик сохранения изменений
    const handleSave = async (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        const token = localStorage.getItem('userToken'); // Получаем токен из localStorage
        if (!token) {
            setError("Необходима авторизация");
            return;
        }

        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setUserData(response.data);
            setSuccessMessage("Данные успешно обновлены!");
        } catch (err) {
            setError(err.response?.data?.msg || "Ошибка при сохранении данных.");
            console.error(err);
        }
    };

    if (loading) {
        return <div>Загрузка данных...</div>; // Индикатор загрузки
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>; // Сообщение об ошибке
    }

    return (
        <div className="container mt-5">
            <h2>Профиль пользователя</h2>
            <form>
                <div>
                    <label htmlFor="firstName">Имя:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange} // Обработчик изменений
                    />
                </div>
              <div>
                    <label htmlFor="middleName">Фамилия:</label>
                    <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange} // Обработчик изменений
                    />
                </div>
              <div>
                    <label htmlFor="lastName">Отчество:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange} // Обработчик изменений
                    />
                </div>
              <div>
                    <label htmlFor="userName">Имя пользователя:</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange} // Обработчик изменений
                    />
                </div>
              <div>
                    <label htmlFor="phone">Телефон:</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange} // Обработчик изменений
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange} // Обработчик изменений
                    />
                </div>
              <button type="button" onClick={handleSave}>Сохранить изменения</button>
            </form>
{successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Сообщение об успехе */}
            <Reviews reviews={reviews} /> {/* Передаем отзывы в компонент */}
        </div>
    );
};

export default UserProfile;