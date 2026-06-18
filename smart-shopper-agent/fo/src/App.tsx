import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopAppBar from './components/TopAppBar';
import HomePage from './pages/HomePage';
import SearchResultPage from './pages/SearchResultPage';

function App() {
  return (
    <Router>
      <div className="bg-surface text-on-surface font-body-md min-h-screen pb-24 md:pb-0">
        <TopAppBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
