import { BrowserRouter as Router, Route, Routes,Link } from 'react-router-dom';
import RoadmapPage from './pages/Roadmap'; // Adjust path if needed

function App() {
  return (
    <Router>
      <nav>
       <Link to="/">Home</Link>
       <Link to="/roadmap">Roadmap</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} /> {/* Temporary Home page */}
        <Route path="/roadmap" element={<RoadmapPage />} />
        {/* Add other routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;