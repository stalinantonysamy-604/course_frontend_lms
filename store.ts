import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session'; // Use sessionStorage
import loginSlice from './Components/Login/LoginSlice';
import navbarReducer from './Components/Navbar/NavbarSlice';
import projectCreationReducer from './Components/Project-Creation/ProjectCreationSlice';
import courseCreationReducer from './Components/Course-Creation/CourseCreationSlice';
import editorReducer from './Components/Course-Creation/Editor/EditorSlice';
import teamMembersReducer from './Components/Project-Creation/TeamMemberSlice';

const rootReducer = combineReducers({
  login: loginSlice,
  navbar: navbarReducer,
  projectCreation: projectCreationReducer,
  courseCreation: courseCreationReducer,
  editor: editorReducer,
  teamMembers: teamMembersReducer
});

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['login', 'navbar', 'projectCreation', 'courseCreation', 'editor', 'teamMembers'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }),
});

export const persistor = persistStore(store);

// Export RootState and AppDispatch types for use throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
