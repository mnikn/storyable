import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
