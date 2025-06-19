# 🎯 Jito Sniper Bot

Бот для снайпа транзакций в Solana с использованием Jito MEV и потока Laserstream от Helius.

Отслеживает в реальном времени входящие swap-транзакции и отправляет bundle в нужный слот с минимальной задержкой.

## 🚀 Запуск

```bash
git clone https://github.com/your-repo/jito-sniper-bot.git
cd jito-sniper-bot
nvm use
npm ci
cp .env.example .env
# Заполни .env своими ключами
```

## ⚙️ Переменные окружения (.env)

```env
RPC_URL=https://api.mainnet-beta.solana.com
JITO_BLOCK_ENGINE_URL=mainnet.block-engine.jito.wtf
JITO_RPC_URL=https://mainnet.block-engine.jito.wtf/api/v1
PRIVATE_KEY_BASE58=...
BUNDLE_TRANSACTION_LIMIT=5
HELIUS_ENDPOINT=...
HELIUS_API_KEY=...
```

| Переменная                 | Описание                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| `RPC_URL`                  | Стандартный Solana RPC для получения слотов, блоков и метаданных   |
| `JITO_BLOCK_ENGINE_URL`    | WebSocket URL для подключения к Jito Block Engine                  |
| `JITO_RPC_URL`             | HTTP API URL для отправки bundle транзакций в Jito                 |
| `PRIVATE_KEY_BASE58`       | Приватный ключ вашего кошелька в base58 (используется для подписи) |
| `BUNDLE_TRANSACTION_LIMIT` | Максимальное число транзакций в одном Jito-бандле                  |
| `HELIUS_ENDPOINT`          | gRPC endpoint от Helius для подключения к Laserstream              |
| `HELIUS_API_KEY`           | API ключ для доступа к Helius Laserstream                          |

## 🗂️ Структура проекта

```
.env                   # Конфигурация окружения
src/
├── config.ts          # Основная конфигурация
├── streamReader/      # Работа с Laserstream (Helius)
├── jito/              # Сборка и отправка bundle в Jito Block Engine
├── eventBus/          # Локальный EventBus для взаимодействия между модулями
```

## 🧠 TODO

* [ ] Отправка bundle только в **Jito-слоты** (требует расширенного rate-limit)
* [ ] Поиск по символу и DEX (пока указывается явный pool)
* [ ] Поддержка любых токен-пар, не только `SOL/{SYMBOL}`
* [ ] На данный момент размер покупки считается не по SPL токену, а по изменению баланса SOL аккаунта кошелька `pre/postBalances`
  * [ ] Возможно что пользователь отправит 90% на fee + tips. Более точно посчитать можно через `postTokenBalances * price`
  * [ ] Валидация нужного трейдера по адресам и инструкциям в транзакциях
* [ ] Проверка инструкций и версии DEX
* [ ] Обработка ошибок, ретраи
* [ ] Улучшение читаемости кода и логирования


