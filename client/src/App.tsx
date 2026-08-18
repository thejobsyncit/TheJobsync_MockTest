import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import TestInterface from './pages/TestInterface';
import ResultPage from './pages/ResultPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import CollegesList from './pages/admin/CollegesList';
import CollegeDetails from './pages/admin/CollegeDetails';
import GlobalCandidates from './pages/admin/GlobalCandidates';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/test/:candidateId" element={<TestInterface />} />
        <Route path="/result/:candidateId" element={<ResultPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="colleges" element={<CollegesList />} />
          <Route path="colleges/:collegeId" element={<CollegeDetails />} />
          <Route path="candidates" element={<GlobalCandidates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
