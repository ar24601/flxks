import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import ReturnPolicy from './pages/ReturnPolicy.jsx';
import Success from './pages/Success.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="returns" element={<ReturnPolicy />} />
        <Route path="success" element={<Success />} />
      </Route>
    </Routes>
  );
}

export default App;
