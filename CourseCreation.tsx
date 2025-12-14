import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Navbar from '../Navbar/Navbar';
import Asidebar from '../Navbar/Asidebar';

import * as Icons from '../Icons';

const CourseCreation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [disableStrollbar, setDisableSrollbar] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (location.pathname === "/course-creation/Editor") {
            setDisableSrollbar(!disableStrollbar);
            if (divRef.current) {
                divRef.current.scrollTop = 0;
            }
        };
    }, [location]);

    return (
        <div className="bg-cover bg-center h-screen w-full flex">
            <Asidebar Buttons={[
                { icon: Icons.performance_icon, active: Icons.performance_icon_active, name: 'Project-List' },
                { icon: Icons.folder_icon, active: Icons.folder_icon_active, name: 'Course-List' },
                { icon: Icons.connection_icon, active: Icons.connection_icon_active, name: 'Connection' },
                { icon: Icons.users_icon, active: Icons.users_icon_active, name: 'Users' }
            ]} onChangeBtn={(seleted) => {
                if (seleted === 'Course-List') {
                    navigate('/project-creation/ProjectCards');
                }
                if (seleted === 'Connection') {
                    navigate('/project-creation/WorkflowList');
                }

                if (seleted === 'Users') {
                    navigate('/project-creation/TeamAndRoles');
                }
            }} />

            <div className="flex-1 ml-[3.5rem] flex flex-col">
                <Navbar />
                <div ref={divRef} className={`px-8 pb-5 flex flex-col h-[calc(100vh-92px)] ${disableStrollbar ? 'overflow-unset' : 'overflow-auto'} scrollbar-big`}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default CourseCreation;