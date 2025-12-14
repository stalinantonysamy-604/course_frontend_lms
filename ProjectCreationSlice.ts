import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IProject {
    project: Project;
}

export interface Project {
    title: string;
    projectId: string;
    description: string;
}

const initialState: IProject = {
    project: {
        title: '',
        projectId: '',
        description: ''
    }
};

const projectCreationSlice = createSlice({
    name: 'projectCreation',
    initialState,
    reducers: {
        setProject: (state, action: PayloadAction<Project>) => {
            state.project = action.payload;
        },
        clearProject: (state) => {
            state.project = { title: '', projectId: '', description: '' };
        }
    },
});

export const { setProject, clearProject } = projectCreationSlice.actions;
export default projectCreationSlice.reducer;
