# Illuminators Frontend

This repository contains the frontend application for the Illuminati project. It is built with React, Vite, and Vitest for testing. The project uses modern tooling, follows component-based structure, and provides a full testing environment with coverage reports.

---

## Tech Stack

React 19
Vite 7
React Router DOM 7
Leaflet / React-Leaflet
MapLibre GL
Vitest + Testing Library
ESLint

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Code-Illuminators/Illuminators_frontend.git
cd illuminators_frontend
```
### 2. Install dependencies

```bash
npm install
```
## Running the Application

### Development server

```bash
npm run dev
```

Start the Vite dev server and open the app in your browser.

### Build for production




Creates an optimized production build.

### Preview production build

```bash
npm run preview
```

---

## Testing

This project uses Vitest with Testing Library.

### Run tests with coverage

```bash
npm run test:coverage
```

Coverage reports will appear in the `coverage/` directory (text, json, lcov).

---

## ⚙️ Configuration

### Vite configuration (`vite.config.js`)

Configures React plugin and Vite defaults.

### Vitest configuration (`vitest.config.js`)

* Test environment: **jsdom**
* Coverage provider: **v8**
* Setup file: `vitest.setup.js`

---

## 📦 Dependencies

Key runtime dependencies:

* `react`, `react-dom`
* `react-router-dom`
* `leaflet`, `react-leaflet`
* `maplibre-gl`

Key dev dependencies:

* `vitest`
* `@testing-library/react`
* `eslint`
* `jsdom`

---

## 📄 License

This project is private and not licensed for public distribution.

---

## 🙌 Contributions

For internal development only. Follow the pull request template and workflow rules.
