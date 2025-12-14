import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { AuthProvider } from './Components/Login/AuthContext.tsx';

import 'flowbite/dist/flowbite.css';
import './index.scss'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* <AuthProvider> */}
        <App />
      {/* </AuthProvider> */}
    </PersistGate>
  </Provider>
  // </React.StrictMode>
);
