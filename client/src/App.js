import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'antd/dist/antd.min.css';
import './App.css';
import Home from './pages/home/Home';
import Products from './pages/products/Products';
import Cart from './pages/cart/Cart';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Bills from './pages/bills/Bills';
import Customers from './pages/customers/Customers';
import Insights from './pages/insights/Insights';
import Cashbook from './pages/cashbook/Cashbook';
import SellerInfo from './pages/seller/SellerInfo'; // Import SellerInfo component

export function ProtectedRouter({ children }) {
  if (localStorage.getItem("auth")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRouter>
              <Home />
            </ProtectedRouter>
          } />
          <Route path="/products" element={
            
            <ProtectedRouter>
              <Products />
            </ProtectedRouter>
          } />
          
          <Route path="/cart" element={
            <ProtectedRouter>
              <Cart />
            </ProtectedRouter>
          } />
          <Route path="/bills" element={
            <ProtectedRouter>
              <Bills />
            </ProtectedRouter>
          } />
          <Route path="/customers" element={
            <ProtectedRouter>
              <Customers />
            </ProtectedRouter>
          } />
          <Route path="/seller-info" element={
            <ProtectedRouter>
              <SellerInfo />
            </ProtectedRouter>
          } /> {/* Add the SellerInfo route */}
          <Route path="/insights" element={
            <ProtectedRouter>
              <Insights />
            </ProtectedRouter>
          } />
          <Route path="/cashbook" element={
            <ProtectedRouter>
              <Cashbook />
            </ProtectedRouter>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
