import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DoImport } from './pages/import';
import { About } from './pages/about';
import { MnemoDump } from './pages/mnemodump';
import { ImportComplete } from './pages/importcomplete';
import { Navbar } from './components/navbar';
import { SurveyStorage } from './common';


export const App = () => {
  const [imports, setImport] = useState(SurveyStorage.getImports());
  return (
      <div>
          <Navbar imports={imports} />
          <Routes>
              <Route path="/" element={<DoImport setImport={setImport} />} />
              <Route path="/about" element={<About />} />
              <Route path="/dump/:id/:surveyNumber" element={<MnemoDump />} />
              <Route path="/imported/:id" element={<ImportComplete imports={imports} />} />
          </Routes>
      </div>
  );
}
