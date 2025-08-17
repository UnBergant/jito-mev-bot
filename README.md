0) Предпосылки

Токен GitHub (fine-grained PAT) с правами на конкретный репозиторий:

Repository permissions: Metadata: Read, Contents: Read, Pull requests: Read & write, Webhooks: Read & write.

Аккаунт имеет роль Admin на репо (чтобы создать вебхук).

Ключ OpenAI (или другой LLM).

n8n доступен по HTTPS (в Settings задан N8N_WEBHOOK_URL) и Workflow активирован.
## 🚀 Установка и запуск

### Выбор нужной версии Node.js:
   ```bash
   nvm use
   ```
### Установка зависимостей из package-lock.json
  ```
  npm ci
  ```
### Создание файла переменных окружения
```
cp .env.example .env
```
Заполнить .env своими значениями, описание ниже
### Запуск
```npm run start```

### Все команды одним блоком
```bash
git clone https://github.com/your-repo/jito-sniper-bot.git
cd jito-sniper-bot
nvm use
npm ci
cp .env.example .env
# Заполни .env своими ключами
```

## ☝️ Уточнения
На данный момент есть поддержка только 💊 **Pumpfun пулов**️❗

Читает баланс Sol токен аккаунта до покупки и после, а не баланс токенов.
Нужно считать в токенах токенов

Значения tips для Jito динамические и берутся по 95 percentile из Jito API, но считаются только при запуске. В целях эффективности не расчитываются непосредственно перед транзакцией

Для удобства часть инстрункций написаны in place и требуют оптимизации

Для оптимизации не считается стоимость 

В некоторых пулах есть ошибка инициализации ATA wSOL:

`Program log: AnchorError caused by account: user_quote_token_account. Error Code: AccountNotInitialized. Error Number: 3012. Error Message: The program expected this account to be already initialized`

## ⚙️ Переменные окружения (.env) читаются в файл config

```env
RPC_URL=https://api.mainnet-beta.solana.com
JITO_BLOCK_ENGINE_URL=mainnet.block-engine.jito.wtf
JITO_RPC_URL=https://mainnet.block-engine.jito.wtf/api/v1
PRIVATE_KEY_BASE58=...
BUNDLE_TRANSACTION_LIMIT=5
HELIUS_ENDPOINT=...
HELIUS_API_KEY=...

```
| Переменная                 | Описание                                                                          |
|----------------------------|-----------------------------------------------------------------------------------|
| `PRIVATE_KEY_BASE58`       | Приватный ключ кошелька в формате base58. Используется для подписи транзакций.    |
| `RPC_URL`                  | URL стандартного RPC узла Solana. Применяется для получения блоков, слотов и т.п. |
| `JITO_RPC_URL`             | URL RPC узла Jito, через который отправляются бандлы (bundle-транзакции).         |
| `JITO_TIPS_ADDRESS`        | Адрес аккаунта, на который отправляются tips Jito.                                |
| `HELIUS_ENDPOINT`          | gRPC-эндпоинт Helius для Laserstream. Используется для отслеживания событий.      |
| `HELIUS_API_KEY`           | API ключ для доступа к Laserstream через Helius.                                  |
| `BUNDLE_TRANSACTION_LIMIT` | Максимальное количество транзакций, включаемых в один Jito-бандл.                 |
| `NUMBER_OF_BUTCHES`        | Количество транзакций на которые будет разбита операция продажи/покупки           |
| `TRIGGERED_SIZE_SOL`       | Объём в SOL, при превышении которого срабатывает триггер на исполнение логики.    |
| `X`                        | Множитель, определяющий, сколько токенов будет продано. Например, `X * size`.     |
| `POOL`                     | Адрес пула (mint токена), с которым работает бот.                                 |
| `SLIPPAGE`                 | Проскальзование транзакции.                                                       |

## ⚙️ Конфигурация файл config. Читает все переменные из (.env) и дополнительно

| Переменная                 | Описание                                                                          |
|----------------------------|-----------------------------------------------------------------------------------|
| `TRIGGER_ACTION`           | Тип ордера, которое иницирует торговлю (`BUY` или `SELL`).                        |
| `MODE`                     | Режим работы бота — направление трейда (`BUY` или `SELL`).                        |

## 🗂️ Структура проекта

```
.env                   # Конфигурация окружения
src/
├── index.ts           # Входная точка. Подключается обозреватель блоков и адаптер
├── config.ts          # Основная конфигурация
├── streamReader/      # Работа с Laserstream (Helius)
├── jito/              # Сборка и отправка bundle в Jito Block Engine
├── eventBus/          # Локальный EventBus для взаимодействия между модулями
├── dexAdapters/       # Адаптеры для работы с разными DEX
├── utils/             # Кладовка с различными инструментами

```

## 🧠 TODO

* [ ] Отправка bundle только в **Jito-слоты** (требует расширенного rate-limit)
* [ ] Проверка баланса базового токена перед продажей
* [ ] Поиск по символу и DEX (пока указывается явный pool)
* [ ] Поддержка любых токен-пар, не только `SOL/{SYMBOL}`
* [ ] На данный момент размер покупки считается не по SPL токену, а по изменению баланса SOL аккаунта кошелька `pre/postBalances`
  * [ ] Возможно что пользователь отправит 90% на fee + tips. Более точно посчитать можно через `postTokenBalances * price`
  * [ ] Валидация нужного трейдера по адресам и инструкциям в транзакциях
  * [ ] Загрузка AddressLookupTable
* [ ] Проверка инструкций и версии DEX
* [ ] Поменять payer с Keypair на Pubkey
* [ ] Обновлять tips по timeout. Сейчас Tips считаются при запуске только один раз 
* [ ] Обработка ошибок, ретраи
* [ ] Асинхронное неблокирующие обновление blockhash
* [ ] Улучшение читаемости кода и логирования
* [ ] **Оптимизация вызовов промиссов**. Удаление/Promise.all/вынесение в контекст/предзапрос
* * [ ] [SDK Pumpfun](https://github.com/UnBergant/jito-mev-bot/blob/4a2e4dfd1439024c373eddf8aa8889f9921af39b/src/dexAdapters/pumpFun/ix.ts#L32-L32)
* * [ ] [CU budget](https://github.com/UnBergant/jito-mev-bot/blob/4a2e4dfd1439024c373eddf8aa8889f9921af39b/src/dexAdapters/pumpFun/tx.ts#L51-L51)
* * [ ] [Detect pool type](https://github.com/UnBergant/jito-mev-bot/blob/4a2e4dfd1439024c373eddf8aa8889f9921af39b/src/jito/txs.ts#L61-L61)
* * [ ] [Get Blockhash](https://github.com/UnBergant/jito-mev-bot/blob/4a2e4dfd1439024c373eddf8aa8889f9921af39b/src/jito/index.ts#L68-L68)


