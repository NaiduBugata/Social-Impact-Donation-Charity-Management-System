# ODCMS Frontend (Mock Mode)

This frontend runs in mock mode by default using `src/api/mockApi.js`, which intercepts `/api/*` fetch calls and returns simulated data persisted to `localStorage`.

Quick start (Windows PowerShell):

1. Install dependencies in the frontend folder

```powershell
cd "c:\Users\aaksh\OneDrive\Desktop\Career Nest\Career Nest\frontend"
npm install
```

2. Run the dev server

```powershell
npm run dev
```

3. Open the app in the browser (Vite shows the URL, usually http://localhost:5173).

Mock utilities

- Reset mock data: open browser console and run `window.__odcms_mock_api.reset()`.
- The mock API implements helper registration, request creation, geo/match, and sanction endpoints, so you can explore Admin, Donor, Helper, Receiver, and Transparency pages without a backend.

Notes

- PDF generation requires `jspdf` and `jspdf-autotable` (already added to `package.json`). If you run into missing module errors, run `npm install jspdf jspdf-autotable` inside the frontend folder.
- This mock is for local frontend exploration and does not perform real payments or file uploads.

Next steps

- Replace mock endpoints with real backend implementations when ready.
- Integrate Leaflet maps and real-time notifications (Socket.io or Firebase) for full geo and notification features.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
