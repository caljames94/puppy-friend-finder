import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'

import App from './App.tsx'
import Match from './pages/Match.tsx'
import ErrorPage from './pages/Error.tsx'
import MatchManagement from './pages/MatchManagement.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
      index: true,
      element: <Match />
      },
      {
        path: "matches",
        element: <MatchManagement/>
      }
    ]
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
