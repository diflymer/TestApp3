# TestApp3

Express приложение с MongoDB для вставки пользователей.

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер:
```bash
npm start
```

Сервер будет доступен на http://localhost:3000

## API Endpoints

### GET /login/
Возвращает логин пользователя.

**Пример запроса:**
```bash
curl http://localhost:3000/login/
```

**Ответ:** `user-login`

### POST /insert/
Вставляет нового пользователя в MongoDB.

**Параметры (form-urlencoded):**
- `login` - логин пользователя
- `password` - пароль пользователя
- `URL` - URL подключения к MongoDB

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/insert/ \
  -d "login=testuser&password=testpass&URL=mongodb://localhost:27017/testdb"
```

**Ответ:** HTTP 200 при успехе, HTTP 500 при ошибке.

## Настройка

- Логин в `/login/` можно изменить в файле `server.js`
- Для использования HTTPS в продакшене:
  1. Получите настоящие SSL сертификаты (Let's Encrypt и т.д.)
  2. Раскомментируйте строки с `https` и `fs` в начале файла
  3. Измените порт на 443
  4. Укажите правильные пути к сертификатам

## Требования

- Node.js
- MongoDB (для эндпоинта /insert/)


