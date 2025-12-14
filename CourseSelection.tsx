import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { RootState } from './../../store';

import * as Images from './../Images';
import * as Icons from './../Icons';

import { useDispatch } from 'react-redux';
import { setBreadCrumb, setTitle } from './../Navbar/NavbarSlice';

/* interface LocationState {
    project: any;
} */

const CourseSelection: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // const state = location.state as LocationState;
    // const { project }: any = state || {};

    const project = useSelector((state: RootState) => state.projectCreation.project);
    const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

    const handleCreateExistingCourseMap = () => {
        navigate('/course-creation/Assembly/Step-1');
    }

    const handleBluePrint = () => {
        navigate('/course-creation/Blueprint/Step-1');
    }

    const handleCreateCourseMap = () => {
        navigate('/course-creation/UMGC/Step-1');
    }

    useEffect(() => {
        dispatch(setTitle('My projects'));
        dispatch(setBreadCrumb(['Projects', project.title, 'Create course']));
    }, [])

    return (
        <div className="flex flex-col justify-center items-center h-full text-center">

            <h3 className="font-bold mb-8 text-[24px]">How would you like to begin?</h3>

            {permissions.CreateCoursecontent && <div className="grid grid-cols-3 grid-rows-1 gap-8" style={{ gridTemplateColumns: '275px 275px 275px', gridTemplateRows: '275px' }}>
                <a className="relative cursor-pointer block p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:bg-gray-100" onClick={handleCreateCourseMap}>
                    <img className="m-auto" src={Images.userflow_1} alt="image_1643.svg" />
                    <h6 className="my-3 text-base font-semibold">Create from course <br />map</h6>
                    <div className="absolute bottom-4 w-[80%]">
                        <img className="m-auto" src={Icons.arrow_right_circle_icon} alt="arrow_right_circle" />
                    </div>
                </a>
                <a className="relative cursor-pointer block p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:bg-gray-100" onClick={handleCreateExistingCourseMap}>
                    <img className="m-auto" src={Images.to_do_list_1} alt="image_1647.svg" />
                    <h6 className="my-3 text-base font-semibold">Create from existing <br />courses</h6>
                    <div className="absolute bottom-4 w-[80%]">
                        <img className="m-auto" src={Icons.arrow_right_circle_icon} alt="arrow_right_circle" />
                    </div>
                </a>
                <a className="relative cursor-pointer block p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:bg-gray-100">

                    <img className="m-auto" src={Images.image_1643} alt="image_1643.svg" />
                    <h6 className="my-3 text-base font-semibold">Create from scratch</h6>
                    <div className="absolute  bottom-4 w-[80%]">
                        <img className="m-auto" src={Icons.arrow_right_circle_icon} alt="arrow_right_circle" />
                    </div>

                </a>
            </div>}
        </div>
    )
}

export default CourseSelection;