import React, { useState, useEffect, useReducer, useContext } from "react";
import Context from "./Context"; // Путь к вашему контексту
import axios from "axios";
//import EditAdminUser from "./EditAdminUser";
import EditService from "./EditService";
import EditReview from "./EditReview";
import {
  Modal,
  Button,
  Pagination,
  Table,
  Form,
  Spinner,
  Placeholder,
  OverlayTrigger,
  Tooltip,
  InputGroup,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faker } from "@faker-js/faker/locale/ru"; // Используем русскую локализацию

const AdminDashboard = () => {
  const { state, dispatch } = useContext(Context);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [highlightedUserId, setHighlightedUserId] = useState(null); // Для выделения строки
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null); // ID пользователя для удаления
  const [showModal, setShowModal] = useState(false);
  const [addingFakeUser, setAddingFakeUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({}); // Состояние для ошибок валидации
  const [isEditingUserModalOpen, setIsEditingUserModalOpen] = useState(false);

  //Заголовки
  const getHeaders = () => {
    const token = localStorage.getItem("userToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleChangeRole = (userId, newRole) => {
    // ID пользователя, роль которого нельзя изменить
    const restrictedUserId = "66eaa5f76140ff3bb810ca52";

    if (userId === restrictedUserId) {
      toast.error("Нельзя изменить роль этого пользователя");
      return; // Прерываем выполнение функции, если это тот самый пользователь
    }

    // Обновляем роль пользователя в состоянии
    setEditingUser((prevUser) => ({
      ...prevUser,
      role: newRole,
    }));
  };

  const roleTranslations = {
    admin: "Администратор",
    client: "Клиент",
    executor: "Исполнитель",
  };

  //Загрузка данных
  const fetchData = async () => {
    setLoading(true); // Устанавливаем состояние загрузки в true
    try {
      const responses = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          headers: getHeaders(),
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/services`, {
          headers: getHeaders(),
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reviews`, {
          headers: getHeaders(),
        }),
      ]);

      // Обработка результатов
      const usersResponse = responses[0];
      const servicesResponse = responses[1];
      const reviewsResponse = responses[2];

      // Установка пользователей
      if (usersResponse.status === "fulfilled") {
        dispatch({ type: "SET_USERS", payload: usersResponse.value.data });
      } else {
        dispatch({ type: "SET_ERROR", payload: usersResponse.reason.message });
        toast.error(
          "Ошибка при загрузке пользователей: " + usersResponse.reason.message
        );
      }

      // Установка услуг
      if (servicesResponse.status === "fulfilled") {
        dispatch({
          type: "SET_SERVICES",
          payload: servicesResponse.value.data,
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: servicesResponse.reason.message,
        });
        toast.error(
          "Ошибка при загрузке услуг: " + servicesResponse.reason.message
        );
      }

      // Установка отзывов
      if (reviewsResponse.status === "fulfilled") {
        dispatch({ type: "SET_REVIEWS", payload: reviewsResponse.value.data });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: reviewsResponse.reason.message,
        });
        toast.error(
          "Ошибка при загрузке отзывов: " + reviewsResponse.reason.message
        );
      }
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false); // Устанавливаем состояние загрузки в false после завершения
    }
  };

  useEffect(() => {
    fetchData(); // Вызов функции для получения данных
  }, []);

  useEffect(() => {}, [state.users]); // Логируем состояние пользователей при его изменении

  //Отображение списков
  const renderEditingComponent = () => {
    if (state.editingUserId) {
      return (
        <EditAdminUser
          userId={state.editingUserId}
          onCancel={() => dispatch({ type: "SET_EDITING_USER", payload: null })}
        />
      );
    }
    if (state.editingServiceId) {
      return (
        <EditService
          serviceId={state.editingServiceId}
          onCancel={() =>
            dispatch({ type: "SET_EDITING_SERVICE", payload: null })
          }
        />
      );
    }
    if (state.editingReviewId) {
      return (
        <EditReview
          reviewId={state.editingReviewId}
          onCancel={() =>
            dispatch({ type: "SET_EDITING_REVIEW", payload: null })
          }
        />
      );
    }
    return null;
  };

  //Редактирование пользователя
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditingUserModalOpen(true);
  };

  //Сохранение изменений пользователя
  const handleSaveUser = async () => {
    if (!editingUser) {
      console.error("Нет данных для сохранения");
      return;
    }

    // Валидация
    const errors = validateUser(editingUser);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // Прерываем выполнение, если есть ошибки
    } else {
      setValidationErrors({}); // Сбрасываем ошибки
    }

    try {
      // Предположим, что у вас есть функция `updateUser` для обновления пользователя
      const response = await updateUser(editingUser);
      if (response.success) {
        // Обновите состояние или сделайте что-то еще после успешного обновления
        dispatch({
          type: "SET_USERS",
          payload: state.users.map((user) =>
            user._id === response.user._id ? response.user : user
          ),
        });
        handleCloseModal();
        toast.success("Изменения сохранены!"); // Уведомление об успешном сохранении
        setHighlightedUserId(response.user._id); // Устанавливаем ID для выделения
        setTimeout(() => setHighlightedUserId(null), 2000); // Убираем выделение через 2 секунды
      } else {
        // Обработка ошибок
        console.error(response.error);
      }
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
    }
  };

  const updateUser = async (user) => {
    try {
      // Убедитесь, что user содержит userId
      if (!user._id) {
        throw new Error("userId не найден в объекте пользователя");
      }

      // Отправка PUT-запроса с данными пользователя
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}`,
        user, // Передаем данные пользователя в теле запроса
        { headers: getHeaders() } // Передаем заголовки
      );

      return { success: true, user: response.data }; // Возвращаем успешный ответ
    } catch (error) {
      // Обработка ошибок
      console.error("Ошибка при обновлении пользователя:", error);
      throw error; // Перебрасываем ошибку для дальнейшей обработки
    }
  };

  //Удаление пользователя
  const handleDeleteUser = (userId) => {
    const userToDelete = state.users.find((user) => user._id === userId);

    if (userToDelete && userToDelete.role === "admin") {
      toast.error("Нельзя удалить пользователя с ролью 'Администратор'");
      return; // Прерываем выполнение функции, если это администратор
    }

    setUserIdToDelete(userId); // Устанавливаем ID пользователя, которого нужно удалить
    setShowDeleteModal(true); // Показываем модальное окно
    console.log(`Удалить пользователя с ID: ${userId}`);
    handleCloseModal(); // Закрыть модал после удаления
  };

  const confirmDelete = async () => {
    //console.log("Confirm Delete called with userId:", userIdToDelete);
    if (!userIdToDelete) return; // Проверка на наличие ID

    try {
      console.log("Sending delete request for userId:", userIdToDelete);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userIdToDelete}`,
        { headers: getHeaders() }
      );

      //console.log("Delete response:", response); // Проверка ответа от сервера

      // Проверяем, что ответ успешный
      if (response.status === 200) {
        dispatch({
          type: "SET_USERS",
          payload: state.users.filter((u) => u._id !== userIdToDelete),
        });

        toast.success("Пользователь успешно удален");
      } else {
        toast.error(
          "Не удалось удалить пользователя. Статус: " + response.status
        );
      }
    } catch (err) {
      console.error("Ошибка при удалении пользователя:", err);
      toast.error(
        "Произошла ошибка при удалении пользователя. Проверьте, удален ли пользователь на сервере."
      );
    } finally {
      setShowDeleteModal(false); // Закрываем модальное окно
      setUserIdToDelete(null); // Сбрасываем ID пользователя
    }
  };

  //Создание фейкового пользователя
  const handleAddUser = async () => {
    const role = faker.helpers.arrayElement(["client", "executor"]); // Случайная роль, исключая 'admin'
    const password = faker.internet.password(); // Генерация случайного пароля

    // Генерация номера телефона, содержащего только цифры
    const phone = `89${faker.number.int({ min: 100000000, max: 999999999 })}`; // Генерация 9 случайных цифр после 89

    const newUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      userName: faker.internet.userName(),
      phone: phone,
      email: faker.internet.email(),
      password: password, // Добавляем сгенерированный пароль
      role: role, // Добавляем роль
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users`, // URL для добавления пользователя
        newUser, // Данные пользователя
        { headers: getHeaders() } // Заголовки
      );

      dispatch({
        type: "SET_USERS",
        payload: [...state.users, response.data], // Добавляем нового пользователя в состояние
      });

      toast.success("Пользователь успешно добавлен!"); // Уведомление об успешном добавлении
      setHighlightedUserId(response.data._id); // Устанавливаем ID для выделения
    } catch (error) {
      if (error.response) {
        console.error(
          "Ошибка при добавлении пользователя:",
          error.response.data
        );
        toast.error(
          `Ошибка: ${
            error.response.data.message || "Не удалось добавить пользователя."
          }`
        );
      } else if (error.request) {
        console.error(
          "Ошибка при добавлении пользователя: нет ответа от сервера.",
          error.request
        );
        toast.error("Ошибка сети: нет ответа от сервера.");
      } else {
        console.error("Ошибка при добавлении пользователя:", error.message);
        toast.error("Ошибка: " + error.message);
      }
    }
  };

  //Редактирование услуги
  const handleEditService = (service) => {
    setEditingService(service);
  };

  //Удаление услуги
  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/services/${serviceId}`,
        { headers: getHeaders() }
      );
      dispatch({
        type: "SET_SERVICES",
        payload: state.services.filter((service) => service._id !== serviceId),
      });
    } catch (err) {
      console.error("Ошибка при удалении услуги:", err);
    }
  };

  //Редактирование отзыва
  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  //Удаление отзыва
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/reviews/${reviewId}`,
        { headers: getHeaders() }
      );
      dispatch({
        type: "SET_REVIEWS",
        payload: state.reviews.filter((review) => review._id !== reviewId),
      });
    } catch (err) {
      console.error("Ошибка при удалении отзыва:", err);
    }
  };

  //Закрытие модального окна
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setIsEditingUserModalOpen(false);
  };

  //Кнопки с подгрузкой
  const saveUser = async () => {
    setSavingUser(true); // Устанавливаем состояние загрузки в true
    try {
      await handleSaveUser(); // Вызов функции сохранения пользователя
    } catch (error) {
      console.error("Ошибка при добавлении фейкового пользователя:", error);
    } finally {
      setSavingUser(false); // Сбрасываем состояние загрузки
    }
  };

  const addUser = async () => {
    setAddingFakeUser(true); // Устанавливаем состояние загрузки в true
    try {
      await handleAddUser(); // Вызов функции сохранения пользователя
    } catch (error) {
      console.error("Ошибка при сохранении пользователя:", error);
    } finally {
      setAddingFakeUser(false); // Сбрасываем состояние загрузки
    }
  };

  //Сортировка
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...state.users]; // Измените здесь

    // Сортировка
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    // Фильтрация по поисковому запросу
    return sortableUsers.filter((user) => {
      return Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [state.users, sortConfig, searchTerm]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    const sortedUsers = [...state.users].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    dispatch({ type: "SET_USERS", payload: sortedUsers });
  };

  const validateUser = (user) => {
    const errors = {};
    if (!user.userName) errors.userName = "Имя пользователя обязательно";
    if (!user.lastName) errors.lastName = "Фамилия обязательна";
    if (!user.firstName) errors.firstName = "Имя обязательно";
    if (!user.middleName) errors.middleName = "Отчество обязательно";
    if (!user.email) {
      errors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errors.email = "Некорректный email";
    }
    if (!user.phone) errors.phone = "Телефон обязателен";
    if (!user.role) errors.role = "Роль обязательна";

    return errors;
  };

  // Пагинация для пользователей
  const totalUsersPages = Math.ceil(sortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Добавляем пустые строки, если на последней странице меньше 10 пользователей
  const emptyRows = Array.from(
    { length: usersPerPage - currentUsers.length },
    (_, index) => (
      <tr key={`empty-${index}`}>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    )
  );

  return (
    <div className="container mt-5">
      <h2>Админ Панель</h2>
      <Button variant="success" onClick={addUser} disabled={addingFakeUser}>
        {addingFakeUser
          ? "Создание пользователя..."
          : "Сгенерировать пользователя"}
      </Button>
      <h3>Пользователи</h3>
      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            <th colSpan={12}>
              <Form.Control
                type="text"
                placeholder="Поиск пользователя..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </th>
          </tr>
          <tr>
            <th>№</th>
            <th onClick={() => requestSort("createdAt")}>
              Дата создания{" "}
              {sortConfig.key === "createdAt"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("updatedAt")}>
              Дата обновления{" "}
              {sortConfig.key === "updatedAt"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th
              onClick={() => requestSort("_id")}
              className="d-none d-md-table-cell"
            >
              ID пользователя{" "}
              {sortConfig.key === "_id"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("firstName")}>
              Имя{" "}
              {sortConfig.key === "firstName"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("lastName")}>
              Фамилия{" "}
              {sortConfig.key === "lastName"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("middleName")}>
              Отчество{" "}
              {sortConfig.key === "middleName"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("userName")}>
              Имя пользователя{" "}
              {sortConfig.key === "userName"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("phone")}>
              Телефон{" "}
              {sortConfig.key === "phone"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("email")}>
              Email{" "}
              {sortConfig.key === "email"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th onClick={() => requestSort("role")}>
              Роль{" "}
              {sortConfig.key === "role"
                ? sortConfig.direction === "ascending"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        {loading ? (
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index}>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td className="d-none d-md-table-cell">
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            {currentUsers.map((user, index) => (
              <tr
                key={user._id}
                className={
                  highlightedUserId === user._id ? "table-success" : ""
                }
              >
                <td>{indexOfFirstUser + index + 1}</td>
                {/* Нумерация пользователей */}
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-top`}>
                        {new Date(user.createdAt).toLocaleString()}
                      </Tooltip>
                    }
                  >
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </OverlayTrigger>
                </td>
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-top`}>
                        {new Date(user.updatedAt).toLocaleString()}
                      </Tooltip>
                    }
                  >
                    <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                  </OverlayTrigger>
                </td>
                <td className="d-none d-md-table-cell">{user._id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.middleName}</td>
                <td>{user.userName}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{roleTranslations[user.role] || user.role}</td>
                {/* Используем перевод роли */}
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleEditUser(user)}
                    size="sm"
                  >
                    Редактировать
                  </Button>
                </td>
              </tr>
            ))}
            {emptyRows}
          </tbody>
        )}
      </Table>
      <Pagination>
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
        {Array.from({ length: totalUsersPages }, (_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === currentPage}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalUsersPages))
          }
        />
      </Pagination>
      <h3>Услуги</h3>
      <Form.Control
        type="text"
        placeholder="Поиск услуги..."
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Дата создания</th>
            <th>Дата обновления</th>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Категория</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((service) => (
            <tr key={service._id}>
              <td>{service.createdAt}</td>
              <td>{service.updatedAt}</td>
              <td>{service._id}</td>
              <td>{service.title}</td>
              <td>{service.description}</td>
              <td>{service.categoryId}</td>
              <td>{service.price}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => handleEditService(service)}
                  size="sm"
                >
                  Редактировать
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteService(service._id)}
                  size="sm"
                >
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h3>Отзывы</h3>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Дата создания</th>
            <th>Дата обновления</th>
            <th>ID отзыва</th>
            <th>ID пользователя</th>
            <th>Услуга ID</th>
            <th>Оценка</th>
            <th>Текст отзыва</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {state.reviews.map((review) => (
            <tr key={review._id}>
              <td>{review.createdAt}</td>
              <td>{review.updatedAt}</td>
              <td>{review._id}</td>
              <td>{review.userId}</td>
              <td>{review.serviceId}</td>
              <td>{review.rating}</td>
              <td>{review.comment}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleEditReview(review)}
                >
                  Редактировать
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteReview(review._id)}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Модальные окна для редактирования */}
      <Modal show={isEditingUserModalOpen} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <>
              <div className="mb-3">
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    ID:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="userId"
                    value={editingUser._id}
                    readOnly // Используем userId выбранного пользователя
                    disabled
                  />
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Дата регистрации:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="createdAt"
                    value={new Date(editingUser.createdAt).toLocaleString()}
                    readOnly // Используем userId выбранного пользователя
                    disabled
                  />
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Имя пользователя:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="userName"
                    value={editingUser.userName} // Используем userId выбранного пользователя
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        userName: e.target.value,
                      })
                    } // Обновляем состояние
                    required
                    isInvalid={!!validationErrors.userName} // Отображаем ошибку
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.userName}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    E-mail:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="email"
                    value={editingUser.email} // Используем userId выбранного пользователя
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    } // Обновляем состояние
                    required
                    isInvalid={!!validationErrors.email} // Отображаем ошибку
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.email}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Фамилия:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="lastName"
                    value={editingUser.lastName} // Используем userId выбранного пользователя
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        lastName: e.target.value,
                      })
                    } // Обновляем состояние
                    required
                    isInvalid={!!validationErrors.lastName} // Отображаем ошибку
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.lastName}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Имя:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="firstName"
                    value={editingUser.firstName} // Используем userId выбранного пользователя
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        firstName: e.target.value,
                      })
                    } // Обновляем состояние
                    required
                    isInvalid={!!validationErrors.firstName} // Отображаем ошибку
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.firstName}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Отчество:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="middleName"
                    value={editingUser.middleName} // Используем userId выбранного пользователя
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        middleName: e.target.value,
                      })
                    } // Обновляем состояние
                    required
                    isInvalid={!!validationErrors.middleName} // Отображаем ошибку
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.middleName}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Телефон:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    name="phone"
                    value={editingUser.phone} // Используем userId выбранного пользователя
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        phone: e.target.value,
                      })
                    } // Обновляем состояние
                    required
                    isInvalid={!!validationErrors.phone} // Отображаем ошибку
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.phone}
                  </Form.Control.Feedback>
                </InputGroup>
                <InputGroup size="sm" className="mb-1">
                  <InputGroup.Text id="inputGroup-sizing-sm" className="w-30">
                    Роль:
                  </InputGroup.Text>
                  <Form.Select
                    aria-label="Default select example"
                    name="role"
                    value={editingUser.role} // или любое другое значение по умолчанию // Используем роль выбранного пользователя
                    onChange={(e) =>
                      handleChangeRole(editingUser._id, e.target.value)
                    } // Обновляем состояние
                    required
                  >
                    <option value="" disabled>
                      Выберите роль
                    </option>
                    <option value="client">Клиент</option>
                    <option value="executor">Исполнитель</option>
                    <option value="admin">Администратор</option>
                  </Form.Select>
                </InputGroup>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} size="sm">
            Закрыть
          </Button>
          <Button
            variant="primary"
            onClick={saveUser}
            disabled={savingUser}
            size="sm"
          >
            {savingUser ? "Сохранение изменений..." : "Сохранить изменения"}
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteUser(editingUser._id)}
            size="sm"
          >
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={!!editingReview} onHide={() => setEditingReview(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать Отзыв</Modal.Title>
        </Modal.Header>
        <Modal.Body>{/* Ваши поля для редактирования отзыва */}</Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-secondary"
            onClick={() => setEditingReview(null)}
          >
            Закрыть
          </Button>
          <Button
            className="btn btn-primary"
            onClick={() => {
              /* Сохранение изменений */
            }}
          >
            Сохранить изменения
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить этого пользователя?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
  setShowDeleteModal(false);
  if (editingUser) {
    setIsEditingUserModalOpen(true); // Открываем модальное окно редактирования, если оно было открыто
  }
}} size="sm">
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmDelete} size="sm">
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
      {renderEditingComponent()}
      <ToastContainer /> {/* Добавляем контейнер для отображения уведомлений */}
    </div>
  );
};

export default AdminDashboard;
