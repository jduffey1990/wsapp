# 🏀 BusterBrackets - [website](https://busterbrackets.com)

A lightweight Vue 3 app for building NCAA March Madness brackets. Built for fans who want to quickly generate printable or shareable brackets, this app was built just in time for the madness — but there's a whole roadmap for turning it into something bigger.

---

## 🚀 Run Locally

1. Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
2. Clone this repository:
   ```bash
   git clone https://github.com/jduffey1990/busterbrackets-app-users.git
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Set environment variables:

   Make sure you create a `.env` file (and optionally a `.env.production` for deployment) in the root folder with the following:

   ```
   VITE_BASE_URL=http://localhost:3000  # or your backend API URL
   ```

5. Run the dev server:
   ```bash
   yarn dev
   ```

6. Visit the app at [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Development Pipeline

- This project uses Vite for blazing-fast frontend development.
- ESLint and Prettier are set up for consistent code formatting and linting.
- Vuetify is used for UI components.
- Make sure `VITE_BASE_URL` is defined in `.env` or for production builds in the variables manager.

---

## 🔗 Backend Repositories

This frontend connects to two backend microservices:

- [Brackets Service (FastAPI)](https://github.com/jduffey1990/busterbrackets-app-brackets)
- [Users & Authentication (FastAPI)](https://github.com/jduffey1990/busterbrackets-app-users)

---

## 🧠 In Progress

Getting this project out in time for March Madness was a sprint to the buzzer — but there's more on the way:

- **Password Update Functionality** – basic account management needs to be added securely for unverified users needing to change password.
- **Bracket Editor** – currently, brackets are generated and locked to preserve bracket fidelity. Next year, a drag-and-drop editor is on the roadmap.
- **Beyond Brackets** – I’d love to expand BusterBrackets into a hub for:
  - College Basketball news
  - Live tournament updates
  - Social bracket sharing and engagement

---

## 📦 Tech Stack
- Prod served by **AWS Amplify**
- **Vue 3** + **Pinia**
- **Vuetify 3**
- **Vite**
- **Stripe JS** (for payment integration)
- **Axios** for API communication
- **Moment.js**, **html2canvas**, **jspdf** for utility and PDF exporting


---

## 📃 License

This project is private and currently not licensed for redistribution. Feel free to reach out for collaboration ideas!

