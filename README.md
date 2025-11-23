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

### GET /test/
Автоматизированное тестирование веб-страницы с помощью Puppeteer.

**Параметры (query string):**
- `url` - URL веб-страницы для тестирования

**Функциональность:**
- Переходит на указанную страницу
- Ищет кнопку с id="bt" и поле ввода с id="inp"
- Кликает по кнопке
- Возвращает значение из поля ввода после клика

**Пример запроса:**
```bash
curl "http://localhost:3000/test/?url=https://example.com/test-page"
```

**Ответ:** значение из поля ввода в виде plain text

### GET /test-static/
Альтернативная версия тестирования для статического контента (без браузера).

**Параметры (query string):**
- `url` - URL веб-страницы для тестирования

**Пример запроса:**
```bash
curl "http://localhost:3000/test-static/?url=https://example.com/test-page"
```

**Ответ:** значение из поля ввода в виде plain text

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

## Запуск на Replit

Для запуска на Replit:

1. Создайте новый Replit проект с Node.js
2. Скопируйте файлы проекта (включая `replit.nix`)
3. Replit автоматически установит системные зависимости из `replit.nix`
4. Установите Node.js зависимости: `npm install`
5. Запустите сервер: `npm start`

**Важно:** Файл `replit.nix` содержит все необходимые системные библиотеки для работы Puppeteer. Если возникают проблемы:

**Вариант 1: Ручная установка браузера**
```bash
# В Replit Shell выполните:
export PUPPETEER_EXECUTABLE_PATH=$(which chromium)
echo "Browser path: $PUPPETEER_EXECUTABLE_PATH"
```

**Вариант 2: Использование альтернативного эндпоинта**
- Вместо `/test/` используйте `/test-static/` для статического контента (работает без браузера)

## Требования

- Node.js
- MongoDB (для эндпоинта /insert/)
- Для `/test/` эндпоинта: Chromium/Chrome браузер (включен в Puppeteer)


