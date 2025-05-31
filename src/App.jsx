import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Grades79 from './pages/Grades79';
import Grades1012 from './pages/Grades1012';  
import About from './pages/About';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
           
          <Route path="/" element={<Home />} />
          <Route path="/grades-7-9" element={<Grades79 />} />
          <Route path="/grades-10-12" element={<Grades1012 />} />
          
          <Route path="/about-us" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
