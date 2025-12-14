import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface IModules {
    module_name: string;
    module_learning_objective: string;
    topics: ITopic[];
    pageId?: string;
}

interface ITopic {
    topic?: string;
    pageId?: string;
    lessions: ILession[];
}
interface ILession {
    enabling_objectives?: string;
    depth_of_coverage?: string;
}

interface IGenerateOutlineParams {
    [key: string]: any;
}


interface CourseCreationState {
    courseName: string;
    modulesItems: any[];
    courseId: string;
    generateModulesItems: IModules[];
    generateOutlineParams: IGenerateOutlineParams | null;
    loItems: any[];
    bluePrintExcelData: string;
    unitModules: any[];
    courseCode: string;
    docFileName: string;
    docFileUrl: string;
    selectedCourseMap: {
        _id: string | number;
        title: string;
        coursemap_name?: string;
        name?: string;
    } | null;
}

const initialState: CourseCreationState = {
    courseName: '',
    modulesItems: [],
    courseId: '',
    generateModulesItems: [],
    generateOutlineParams: null,
    loItems: [],
    bluePrintExcelData: '',
    unitModules: [],
    courseCode: '',
    docFileName: '',
    docFileUrl: '',
    selectedCourseMap: null
};



const courseCreationSlice = createSlice({
    name: 'courseCreation',
    initialState,
    reducers: {
        setCourseNameSlice: (state, action: PayloadAction<string>) => {
            state.courseName = action.payload;
        },
        clearCourseNameSlice: (state) => {
            state.courseName = ''; // Clear the array
        },
        setModulesItems: (state, action: PayloadAction<any[]>) => {
            state.modulesItems = action.payload;
        },
        clearModulesItems: (state) => {
            state.modulesItems = [];
        },
        setCourseId: (state, action: PayloadAction<string>) => {
            state.courseId = action.payload;
        },
        clearCourseId: (state) => {
            state.courseId = ''; // Clear the string
        },
        setCourseCode: (state, action: PayloadAction<string>) => {
            state.courseCode = action.payload;
        },
        clearCourseCode: (state) => {
            state.courseCode = ''; // Clear the string
        },
        setGenerateModulesItems: (state, action: PayloadAction<IModules[]>) => {
            state.generateModulesItems = action.payload;
        },
        clearGenerateModulesItems: (state) => {
            state.generateModulesItems = []; //Clear the array
        },
        setGenerateOutlineParams: (state, action: PayloadAction<IGenerateOutlineParams>) => {
            state.generateOutlineParams = action.payload;
        },
        clearGenerateOutlineParams: (state) => {
            state.generateOutlineParams = null;
        },
        setLoItems: (state, action: PayloadAction<any[]>) => {
            state.loItems = action.payload;
        },
        clearLoItems: (state) => {
            state.loItems = [];
        },

        setBluePrintData: (state, action: PayloadAction<string>) => {
            state.bluePrintExcelData = action.payload;
        },
        clearBluePrintData: (state) => {
            state.bluePrintExcelData = '';
        },

        setUnitModules: (state, action: PayloadAction<any[]>) => {
            state.unitModules = action.payload;
        },
        clearUnitModules: (state) => {
            state.unitModules = [];
        },
        setDocFilename: (state, action: PayloadAction<string>) => {
            state.docFileName = action.payload;
        },
        clearDocFilename: (state) => {
            state.docFileName = ''; // Clear the string
        },
        setDocFileUrl: (state, action: PayloadAction<string>) => {
            state.docFileUrl = action.payload;
        },
        clearDocFileUrl: (state) => {
            state.docFileUrl = ''; // Clear the string
        },
        setSelectedCourseMap: (state, action: PayloadAction<any>) => {
            state.selectedCourseMap = action.payload;
        },
        clearSelectedCourseMap: (state) => {
            state.selectedCourseMap = null;
        },
    },
});

export const {
    setCourseNameSlice,
    clearCourseNameSlice,
    setModulesItems,
    clearModulesItems,
    setCourseId,
    clearCourseId,
    setGenerateModulesItems,
    clearGenerateModulesItems,
    setLoItems,
    clearLoItems,
    setGenerateOutlineParams,
    clearGenerateOutlineParams,
    setBluePrintData,
    clearBluePrintData,
    setUnitModules,
    clearUnitModules,
    setCourseCode,
    clearCourseCode,
    setDocFilename,
    clearDocFilename,
    setDocFileUrl,
    clearDocFileUrl,
    setSelectedCourseMap,
    clearSelectedCourseMap
} = courseCreationSlice.actions;
export default courseCreationSlice.reducer;