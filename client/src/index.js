import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './redux/store';
import { CategoryProvider } from './context/CategoryContext'; // Import CategoryProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CategoryProvider> {/* Wrap CategoryProvider here */}
    <Provider store={store}>
      <App />
    </Provider>
  </CategoryProvider>
);
