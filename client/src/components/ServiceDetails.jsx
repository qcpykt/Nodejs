import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import Reviews from "./ServiceReviews"; // Импортируем компонент отзывов

registerLocale("ru", ru);
setDefaultLocale("ru");

const ServiceDetails = () => {
  const { serviceId } = useParams(); // Получаем serviceId из URL
  //console.log("Service ID:", serviceId); // Для отладки
  
  const [service, setService] = useState(null); // Состояние для хранения данных услуги
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(""); // Состояние ошибки
  const [bookedSlots, setBookedSlots] = useState([]); // Забронированные слоты
  const [selectedDate, setSelectedDate] = useState(null); // Выбранная дата
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // Доступные временные слоты
  const [selectedStartTime, setSelectedStartTime] = useState(""); // Выбранное время начала
  const [selectedEndTime, setSelectedEndTime] = useState(""); // Выбранное время окончания
  const [successMessage, setSuccessMessage] = useState(""); // Сообщение об успехе
  const [reviews, setReviews] = useState([]); // Состояние для отзывов
  const userId = localStorage.getItem("userId"); // Получаем userId из localStorage

  //Часть 2: Функции для загрузки данных услуги и забронированных слотов.
  const fetchBookedSlots = async (serviceId) => {
    if (!serviceId) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings/service/${serviceId}`
      );
      const slots = response.data.map((booking) => new Date(booking.dateTime));
      setBookedSlots(slots);
    } catch (err) {
      setError("Ошибка при загрузке забронированных слотов.");
      console.error(err);
    }
  };

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/services/${serviceId}`
      );
      setService(response.data);
      await fetchBookedSlots(serviceId);
         //console.log("Service ID for reviews:", serviceId); // Для отладки
      await fetchReviews(serviceId); // Загружаем отзывы
    } catch (err) {
      setError("Ошибка при загрузке данных услуги.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   const fetchReviews = async (serviceId) => {
       if (!serviceId) {
           setError("Отсутствует идентификатор сервиса.");
           return; // Добавьте эту проверку
       }
       try {
           const response = await axios.get(
               `${import.meta.env.VITE_API_URL}/api/reviews/service/${serviceId}`
           );
           setReviews(response.data); // Устанавливаем отзывы в состояние
       } catch (err) {
           setError("Ошибка при загрузке отзывов.");
           console.error(err);
       }
   };

  //Часть 3: Использование эффекта для загрузки данных (добавим useEffect, чтобы вызывать функции загрузки данных при монтировании компонента.)
  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      updateAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate, bookedSlots]);

  const updateAvailableTimeSlots = (date) => {
    if (!date) return;

    const bookedTimes = bookedSlots
      .filter((slot) => slot.toDateString() === date.toDateString())
      .map((slot) =>
        slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );

    const allTimes = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date(date);
        time.setHours(hour, minute, 0);
        const timeString = time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (!bookedTimes.includes(timeString)) {
          allTimes.push(timeString);
        }
      }
    }
    setAvailableTimeSlots(allTimes);
  };

  //Часть 4: Обработчики событий для выбора даты и времени, а также логика бронирования
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedStartTime(""); // Сброс выбранного времени при смене даты
    setSelectedEndTime("");
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime || !userId) {
      setError(
        "Пожалуйста, выберите дату, время и убедитесь, что вы авторизованы."
      );
      return;
    }

    const startDateTimeString = `${selectedDate.toLocaleDateString()} ${selectedStartTime}`;
    const endDateTimeString = `${selectedDate.toLocaleDateString()} ${selectedEndTime}`;

    const startDateTime = new Date(startDateTimeString);
    const endDateTime = new Date(endDateTimeString);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError(
        "Ошибка при создании даты. Пожалуйста, проверьте выбранное время."
      );
      return;
    }

    const bookingData = {
      userId,
      serviceId,
      dateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        bookingData
      );
      setSuccessMessage("Бронирование успешно выполнено!");

      // Обновляем состояние bookedSlots
      setBookedSlots((prev) => [...prev, startDateTime]);

      // Сбрасываем выбранные значения
      setSelectedDate(null);
      setSelectedStartTime("");
      setSelectedEndTime("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Ошибка при выполнении бронирования."
      );
    }
  };

  //Часть 5: Отображение компонента (добавим JSX для отображения компонента, включая выбор даты, времени и сообщения об ошибках или успехе.)
  const isPastDate = (date) => {
    return date < new Date();
  };

  if (loading) {
    return <div>Загрузка услуги...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-secondary mb-3">
        Назад к услугам
      </Link>
      <div className="container">
      <h2>{service.title}</h2>
      <p>{service.description}</p>
      <p>Цена: {service.price} руб.</p>
      </div>
<div className="container">
      <h3>Выбор даты</h3>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        filterDate={(date) => !isPastDate(date)}
        inline
        locale="ru"
        dayClassName={(date) =>
          bookedSlots.some(
            (slot) => slot.toDateString() === date.toDateString()
          )
            ? "booked-date"
            : undefined
        }
      />

      <h3>Выбор времени</h3>
      <div>
        <label>
          Начало:
          <select
            value={selectedStartTime}
            onChange={(e) => setSelectedStartTime(e.target.value)}
          >
            <option value="">Выберите время</option>
            {availableTimeSlots.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>

        <label>
          Окончание:
          <select
            value={selectedEndTime}
            onChange={(e) => setSelectedEndTime(e.target.value)}
          >
            <option value="">Выберите время</option>
            {availableTimeSlots.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={handleBooking} className="btn btn-primary mt-3">
        Забронировать
      </button>

      {successMessage && (
        <div className="alert alert-success mt-3">{successMessage}</div>
      )}
  </div>

      {reviews.length > 0 ? (
        <Reviews serviceId={serviceId} />
      ) : (
        <p>Нет отзывов для данной услуги.</p>
      )}
    </div>
  );
};

export default ServiceDetails;
