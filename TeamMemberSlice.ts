import { createSlice, PayloadAction } from '@reduxjs/toolkit';


const initialState = {
    teamMemberList: []
};

const teamMemberSlice = createSlice({
    name: 'teamMembers',
    initialState,
    reducers: {
        setTeamMember: (state, action: PayloadAction<any>) => {
            state.teamMemberList = action.payload;
        },
        clearTeamMember: (state) => {
            state.teamMemberList = [];
        }
    },
});

export const { setTeamMember, clearTeamMember } = teamMemberSlice.actions;
export default teamMemberSlice.reducer;
