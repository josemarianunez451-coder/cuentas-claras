// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Añadimos Navigate
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import GroupPage from './pages/GroupPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Ruta Raíz: Decide qué mostrar según el estado de auth */}
          <Route path="/" element={
            <>
              <SignedIn>
                {/* Si ya está logueado en la raíz, lo mandamos al dashboard */}
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <HomePage />
              </SignedOut>
            </>
          } />

          {/* ESTA ES LA RUTA QUE TE FALTA */}
          <Route path="/dashboard" element={
            <SignedIn>
              <DashboardPage />
            </SignedIn>
          } />

          {/* Ruta de detalle de grupo */}
          <Route path="/group/:groupId" element={
            <SignedIn>
              <GroupPage />
            </SignedIn>
          } />

          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          
          {/* Opcional: Una ruta para manejar errores 404 dentro de React */}
          <Route path="*" element={<div className="text-center py-10">Página no encontrada</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;