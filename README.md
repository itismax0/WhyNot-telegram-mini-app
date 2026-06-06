# WhyNot? Wallet

A next-generation, premium self-custodial multi-chain cryptocurrency wallet designed as a Telegram Mini App. Seamlessly manage your assets across multiple blockchains with built-in AI-powered safety and address reputation analysis.

---

## 🌟 Key Features

* **Multi-Chain Support**: Generate and manage TON, EVM (Ethereum), Solana, USDT, and Bitcoin addresses from a single secure 24-word seed phrase.
* **Premium User Interface**: Modern dark-themed design with smooth interactive micro-animations matching the native Telegram style.
* **AI-Assessed Reputation System**: Evaluates recipient addresses or @usernames across multiple criteria (Address Activity, Transaction Purity, Liquidity/Volume, and Account Age) showing a visual circular gauge from 1.0 to 10.0.
* **Integrated Transfer Form**: Unified recipient badge, inline asset selector capsule, dynamic USD rate converter, network fee details, and transfer time estimator.
* **On-Chain History**: Real-time loading of past transactions directly from block explorers.
* **Bilingual Support**: Fully localized in English and Russian.

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
* **Bundler**: Vite 8
* **Blockchain Integrations**:
  * `@ton/ton` & `@ton/crypto` (TON Protocol)
  * `ethers` (Ethereum / EVM)
  * `@solana/web3.js` (Solana)

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes bundled with Node.js)

### Installation

1. Clone the repository or navigate to the directory:
   ```bash
   cd WhyNot-telegram-mini-app-main
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

Run the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to interact with the wallet interface.

### Build

Compile the TypeScript files and create a production build bundle:
```bash
npm run build
```
The output files will be located in the `dist` directory.

---

# WhyNot? Wallet (Русская версия)

Криптовалютный кошелек нового поколения на базе Telegram Mini App с поддержкой нескольких блокчейн-сетей. Безопасно управляйте активами под вашим личным контролем с встроенной интеллектуальной системой оценки безопасности и репутации адресов.

---

## 🌟 Ключевые возможности

* **Мультичейн поддержка**: Создание и управление адресами сетей TON, EVM (Ethereum), Solana, USDT и Bitcoin из одной резервной сид-фразы из 24 слов.
* **Премиальный интерфейс**: Современный темный дизайн с плавными интерактивными микро-анимациями в нативном стиле Telegram.
* **AI-оценка репутации кошелька**: Анализ адресов получателей и @юзернеймов по ключевым метрикам (Активность адреса, Чистота транзакций, Объем/Ликвидность, Возраст кошелька) с наглядным круговым индикатором от 1.0 до 10.0.
* **Интегрированная форма перевода**: Объединенная карточка получателя, встроенный переключатель активов, динамическая конвертация в USD по актуальным курсам, детальный расчет комиссии сети и времени перевода.
* **История транзакций**: Загрузка истории операций в реальном времени напрямую из распределенных блокчейн-реестров.
* **Двуязычный интерфейс**: Полная локализация на английский и русский языки.

## 🛠️ Стек технологий

* **Фронтенд**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
* **Сборщик**: Vite 8
* **Интеграция с блокчейнами**:
  * `@ton/ton` & `@ton/crypto` (TON)
  * `ethers` (Ethereum / EVM)
  * `@solana/web3.js` (Solana)

---

## 🚀 Как начать работу

### Требования

* Установленный [Node.js](https://nodejs.org/) (версии 18 или выше)
* Пакетный менеджер npm

### Установка

1. Перейдите в корневую папку проекта:
   ```bash
   cd WhyNot-telegram-mini-app-main
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

### Запуск в режиме разработки

Запустите локальный dev-сервер:
```bash
npm run dev
```
Откройте браузер по адресу `http://localhost:5173` для просмотра и тестирования кошелька.

### Сборка проекта

Для создания оптимизированной сборки для продакшена выполните:
```bash
npm run build
```
Готовые файлы сборки будут сохранены в каталоге `dist`.
