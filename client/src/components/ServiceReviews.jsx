import React, { useEffect, useState } from "react";
import axios from "axios";

const Reviews = ({ serviceId }) => {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ rating: 0, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const { rating, comment } = formData;
  const [ratingSortOrder, setRatingSortOrder] = useState(0);
  const [dateSortOrder, setDateSortOrder] = useState(2);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!serviceId) {
        setError(
          "Не удалось загрузить отзывы: отсутствует идентификатор сервиса."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reviews/service/${serviceId}`
        );
        setReviews(response.data);
      } catch (err) {
        setError("Ошибка при загрузке отзывов. Пожалуйста, попробуйте позже.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingClick = (value) => {
    setFormData({ ...formData, rating: value === rating ? 0 : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 0 || rating > 5) {
      alert("Рейтинг должен быть от 0 до 5");
      return;
    }
    
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
            setError("Необходимо войти в систему для добавления отзыва.");
            return;
        }
    
    

    try {
      const userId = localStorage.getItem("userId");
      const newReview = { userId, serviceId, rating, comment };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reviews`,
        { ...formData, userId, serviceId, newReview }
      );

      setSuccessMessage("Отзыв успешно добавлен");
      setReviews([...reviews, response.data]);
      setFormData({ rating: 0, comment: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Ошибка при добавлении отзыва.");
    }
  };
  
  const Reviews = ({ reviews }) => {
    // Получаем userId из localStorage
    const userId = localStorage.getItem('userId'); // Убедитесь, что ключ соответствует тому, что вы используете в localStorage
    // Фильтруем отзывы, чтобы показать только отзывы текущего пользователя
    const filteredReviews = reviews.filter(review => review.userId === userId);

    if (filteredReviews.length === 0) {
        return <div>У вас нет отзывов.</div>;
    }

    return (
        <div>
            {filteredReviews.map(review => (
                <div key={review.id} className="review">
                    <h4>Рейтинг: {review.rating}</h4>
                    <p>{review.comment}</p>
                </div>
            ))}
        </div>
    );
};
  
  const getSortedReviews = () => {
    let sorted = [...reviews];

    // Сортировка по дате
    if (dateSortOrder === 1) {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // По дате (старые сначала)
    } else if (dateSortOrder === 2) {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // По дате (новые сначала)
    }

    // Сортировка по рейтингу
    if (ratingSortOrder === 1) {
      sorted.sort((a, b) => a.rating - b.rating); // По рейтингу (возрастание)
    } else if (ratingSortOrder === 2) {
      sorted.sort((a, b) => b.rating - a.rating); // По рейтингу (убывание)
    }

    return sorted;
  };

  const calculateOverallRating = () => {
    if (reviews.length === 0) return 0; // Если нет отзывов, вернуть 0

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length; // Вычисляем средний рейтинг

    return parseFloat(averageRating.toFixed(1)); // Возвращаем средний рейтинг с одним знаком после запятой
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (v, i) => (
      <span key={i} style={{ color: i < rating ? "gold" : "gray" }}>
        ★
      </span>
    ));
  };

const renderOverallStars = (rating) => {
  // Убедимся, что рейтинг находится в пределах от 0 до 5
  const clampedRating = Math.max(0, Math.min(rating, 5));

  const fullStars = Math.floor(clampedRating); // Полные звезды
  const halfStar = (clampedRating % 1) >= 0.5 ? 1 : 0; // Половинчатая звезда
  const emptyStars = 5 - fullStars - halfStar; // Пустые звезды

  return (
    <div className="star-rating">
      {Array.from({ length: fullStars }, (v, i) => (
        <span key={`full-${i}`} className="star full" style={{ color: 'gold' }}>★</span>
      ))}
      {halfStar === 1 && <span className="star half" style={{ color: 'gold' }}>★</span>}
      {Array.from({ length: emptyStars }, (v, i) => (
        <span key={`empty-${i}`} className="star">★</span>
      ))}
    </div>
  );
};

  const sortedReviews = getSortedReviews();
  const totalReviews = reviews.length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container">
      <h3>Отзывы ({reviews.length})</h3>
      <div>
  <h3>
    Общий рейтинг: {calculateOverallRating().toFixed(1)} 
    {renderOverallStars(calculateOverallRating())}
  </h3>
</div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", marginBottom: "10px" }}>
          {Array.from({ length: 5 }, (v, i) => (
            <span
              key={i}
              style={{
                cursor: "pointer",
                fontSize: "24px",
                color: i < rating ? "gold" : "gray",
              }}
              onClick={() => handleRatingClick(i + 1)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          name="comment"
          value={comment}
          onChange={handleChange}
          placeholder="Ваш отзыв"
          required
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "100%",
            height: "100px",
          }}
        />
        <button type="submit">Отправить отзыв</button>
      </form>

      <label htmlFor="sortBy">Сортировать по:</label>
      <select
        id="sortBy"
        onChange={(e) => {
          const value = e.target.value;
          if (value === "ratingAsc") {
            setRatingSortOrder(1);
            setDateSortOrder(0);
          } else if (value === "ratingDesc") {
            setRatingSortOrder(2);
            setDateSortOrder(0);
          } else if (value === "dateAsc") {
            setDateSortOrder(1);
            setRatingSortOrder(0);
          } else if (value === "dateDesc") {
            setDateSortOrder(2);
            setRatingSortOrder(0);
          }
        }}
      >
        <option value="dateDesc">Дата (новые сначала)</option>
        <option value="dateAsc">Дата (старые сначала)</option>
        <option value="ratingDesc">Рейтинг (по убыванию)</option>
        <option value="ratingAsc">Рейтинг (по возрастанию)</option>
      </select>

      {loading && <p>Загрузка отзывов...</p>}
      {error && <p>{error}</p>}
      {successMessage && <p>{successMessage}</p>}

      <div>
        {currentReviews.map((review) => (
          <div
            key={review._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{review.userId || "Аноним"}</strong>{" "}
                {/* Имя пользователя */}
                <p>
                  {new Date(review.createdAt).toLocaleDateString()}{" "}
                  {new Date(review.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                {renderOverallStars(review.rating)}{" "}
                {/* Используем renderOverallStars для отображения рейтинга */}
              </div>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div>
          {Array.from({ length: totalPages }, (v, i) => (
            <button key={i} onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
