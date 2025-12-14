import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILogin {
    username: string;
    role: string;
    email: string;
    u_uniqueId: string;
    token: string;
    permissions: any;
    rolesData: any[] | null;
    userId: number | null;
    hasPermissions: any;
    userImage: string;
}

const initialState: ILogin = {
    username: '',
    role: '',
    email: '',
    u_uniqueId: '',
    token: '',
    permissions: null,
    rolesData: null,
    userId: null,
    hasPermissions: null,
    userImage: ''
};

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setUsername: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        },
        setRole: (state, action: PayloadAction<string>) => {
            state.role = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setUniqueId: (state, action: PayloadAction<string>) => {
            state.u_uniqueId = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setPermission: (state, action: PayloadAction<string>) => {
            state.permissions = action.payload;
        },
        setRolesData: (state, action: PayloadAction<any[] | null>) => {
            state.rolesData = action.payload;
        },
        setUserId: (state, action: PayloadAction<number | null>) => {
            state.userId = action.payload;
        },
        setHasPermissions: (state, action: PayloadAction<any>) => {
            state.hasPermissions = action.payload;
        },

         setUserImage: (state, action: PayloadAction<string>) => {
            state.userImage = action.payload;
        }
    },
});

export const { setUsername, setRole, setEmail, setUniqueId, setToken, setPermission, setRolesData, setUserId, setHasPermissions, setUserImage } = loginSlice.actions;
export default loginSlice.reducer;
