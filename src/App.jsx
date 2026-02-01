import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Team from './pages/Team';
import Swag from './pages/Swag';
import Sponsors from './pages/Sponsors';
import Speakers from './pages/Speakers';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/swag" element={<Swag />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/speakers" element={<Speakers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App
