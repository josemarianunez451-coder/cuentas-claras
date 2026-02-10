import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Layout from './components/layout';
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
          <Route path="/" element={
            <>
              <SignedIn>
                <DashboardPage />
              </SignedIn>
              <SignedOut>
                <HomePage />
              </SignedOut>
            </>
          } />
          <Route path="/group/:groupId" element={
            <SignedIn>
              <GroupPage />
            </SignedIn>
} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;