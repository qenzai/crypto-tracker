# CryptoTracker 🪙

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![License](https://img.shields.io/badge/license-MIT-green)

Веб-застосунок для відстеження актуальних цін криптовалют у реальному часі.

> Курсова робота студента 311 групи Коби Сергія Ігоровича  
> Чернівецький національний університет імені Юрія Федьковича  
> Науковий керівник: Горбатенко Микола Юрійович  
> GitHub: [github.com/qenzai/crypto-tracker](https://github.com/qenzai/crypto-tracker)

## Технологічний стек

| Шар | Технологія |
|-----|-----------|
| Backend | .NET 10 Web API |
| База даних | MySQL 8 + Entity Framework Core (Pomelo) |
| Авторизація | JWT Bearer Tokens + BCrypt |
| Парсинг даних | CoinGecko API (безкоштовний) |
| Фоновий сервіс | .NET BackgroundService |
| API документація | Swagger / OpenAPI |
| Frontend | Angular 21 (standalone components) |
| Графіки | Chart.js 4 |

---

## Структура проекту

```
crypto-tracker/
├── CryptoTracker.API/               ← .NET 10 Backend
│   ├── Controllers/
│   │   ├── AuthController.cs         POST /api/auth/login, /register
│   │   ├── CryptoCoinsController.cs  CRUD /api/cryptocoins
│   │   └── PricesAndStatsController.cs  /api/coins/{id}/prices|stats
│   ├── Data/
│   │   └── AppDbContext.cs           EF Core DbContext + Seed
│   ├── Models/
│   │   ├── User.cs
│   │   ├── CryptoCoin.cs
│   │   └── CryptoPrice.cs
│   ├── Services/
│   │   ├── Auth/AuthService.cs       JWT генерація, BCrypt хешування
│   │   ├── CoinGecko/                HTTP клієнт до CoinGecko API
│   │   ├── Crypto/CryptoPriceService.cs  CRUD + агрегація (min/max/avg)
│   │   └── Background/               Автоматичний парсинг за розкладом
│   ├── DTOs/                         Data Transfer Objects
│   ├── Program.cs                    DI, JWT, Swagger, CORS, EF Core
│   └── appsettings.json
│
└── crypto-tracker-frontend/         ← Angular 21 Frontend
    └── src/app/
        ├── components/
        │   ├── login/                Форма входу
        │   ├── register/             Форма реєстрації
        │   ├── navbar/               Навігаційна панель
        │   ├── dashboard/            Картки монет, авто-оновлення 30с
        │   ├── coins/                CRUD таблиця монет
        │   └── stats/                Статистика + Chart.js графік
        ├── services/
        │   ├── auth.service.ts       Login, register, JWT зберігання
        │   └── crypto.service.ts     API виклики до backend
        ├── interceptors/
        │   └── auth.interceptor.ts   Автоматичний Bearer токен
        ├── guards/
        │   └── auth.guard.ts         Захист маршрутів
        └── models/models.ts          TypeScript інтерфейси
```

---

## Запуск проекту

### 1. Підготовка MySQL

Створіть базу даних (таблиці створяться автоматично через міграції EF Core):

```sql
CREATE DATABASE crypto_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (.NET 10)

#### Налаштування `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=crypto_tracker;User=root;Password=ПАРОЛЬ;Port=3306;"
  },
  "Jwt": {
    "Key": "your-super-secret-key-min-32-chars-long!!",
    "Issuer": "CryptoTrackerAPI",
    "Audience": "CryptoTrackerClient",
    "ExpiresInMinutes": 1440
  },
  "CoinGecko": {
    "FetchIntervalMinutes": 5,
    "TrackedCoins": "bitcoin,ethereum,solana,binancecoin,cardano"
  }
}
```

>  Поміняйте рядок підключення та `Jwt:Key` (мінімум 32 символи)

#### Встановлення та запуск

```bash
cd CryptoTracker.API

# Встановити dotnet-ef (якщо ще не встановлено)
# Потрібен .NET 10 SDK: https://dotnet.microsoft.com/download/dotnet/10.0
dotnet tool install --global dotnet-ef

# Відновити пакети
dotnet restore

# Створити міграцію (якщо папки Migrations немає)
dotnet ef migrations add InitialCreate

# Застосувати міграції до БД (або вони застосуються автоматично при запуску)
dotnet ef database update

# Запустити API
dotnet run
```

API буде доступне за адресою: **http://localhost:5000**

Swagger UI: **http://localhost:5000/swagger**

### 3. Frontend (Angular 21)

```bash
cd crypto-tracker-frontend

# Встановити залежності
# Потрібен Node.js 22+: https://nodejs.org
npm install

# Запустити dev-сервер
npm start
```

Фронтенд буде доступний за адресою: **http://localhost:4200**

---

## API Ендпоінти

### Авторизація (публічні)
| Метод | URL | Опис |
|-------|-----|------|
| POST | `/api/auth/register` | Реєстрація нового користувача |
| POST | `/api/auth/login` | Вхід, повертає JWT токен |

### Монети (потребують JWT)
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/cryptocoins` | Список всіх монет з останніми цінами |
| GET | `/api/cryptocoins/{id}` | Монета за ID |
| POST | `/api/cryptocoins` | Додати нову монету |
| PUT | `/api/cryptocoins/{id}` | Оновити монету (назву/статус) |
| DELETE | `/api/cryptocoins/{id}` | Видалити монету + цінову історію |

### Ціни і статистика (потребують JWT)
| Метод | URL | Параметри |
|-------|-----|-----------|
| GET | `/api/coins/{id}/prices` | `?from=&to=&limit=100` |
| GET | `/api/coins/{id}/stats` | `?from=&to=` |

#### Приклад відповіді `/api/coins/1/stats`
```json
{
  "coinId": 1,
  "coinName": "Bitcoin",
  "symbol": "BTC",
  "minPrice": 41250.50,
  "maxPrice": 68900.00,
  "avgPrice": 55000.25,
  "latestPrice": 67800.00,
  "avgMarketCap": 1050000000000,
  "avgVolume24h": 28000000000,
  "recordsCount": 288,
  "priceHistory": [
    { "recordedAt": "2025-01-01T10:00:00Z", "price": 41250.50 },
    ...
  ]
}
```

---

## Схема бази даних

```
Users
  id (PK)  |  username (UNIQUE)  |  email (UNIQUE)  |  passwordHash  |  createdAt

CryptoCoins
  id (PK)  |  coinGeckoId (UNIQUE)  |  symbol  |  name  |  isTracked  |  addedAt

CryptoPrices
  id (PK)  |  cryptoCoinId (FK)  |  price  |  marketCap  |  volume24h  |  priceChange24h  |  recordedAt
  INDEX: (cryptoCoinId, recordedAt) — для швидких агрегацій
```

---

## Функціональність

- **JWT авторизація** — реєстрація, вхід, захищені маршрути (Angular guard + .NET `[Authorize]`)
- **CRUD монет** — додати, редагувати, увімкнути/вимкнути відстеження, видалити
- **Автоматичний парсинг** — BackgroundService опитує CoinGecko кожні N хвилин та зберігає ціни в MySQL
- **Агрегації** — мінімальна, максимальна, середня ціна та маркет кап за довільний діапазон дат
- **Графік динаміки** — Chart.js лінійний графік останніх 100 цінових записів
- **Авто-оновлення дашборду** — Angular RxJS `interval(30s)` автоматично перезавантажує дані
- **Swagger UI** — повна інтерактивна документація API з підтримкою Bearer токенів

---

## Скріншоти інтерфейсу

| Сторінка | Опис |
|----------|------|
| `/login` | Форма входу з валідацією |
| `/register` | Форма реєстрації |
| `/dashboard` | Сітка карток монет з цінами та % змінами |
| `/coins` | Таблиця CRUD з модальним вікном додавання |
| `/stats/:id` | Картки статистики + лінійний графік Chart.js |
