import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/UsersPage';
import PickPage from './pages/PickPage';
import PickingPage from './pages/PickingPage';
import PackPage from './pages/PackPage';
import PackingPage from './pages/PackingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />}/>
        <Route path="/Users" element={<UsersPage />}/>
        <Route path="/pick"  element={<PickPage />} />
        <Route path="/picking" element= {<PickingPage/>}/>
        <Route path="/pack" element = {<PackPage/>}/>
        <Route path="/packing" element= {<PackingPage/>}/>
        <Route path="*" element={<PickPage />} /> // Fallback
      </Routes>
    </BrowserRouter>
  )
}

export default App
