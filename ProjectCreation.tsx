import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Navbar from '../Navbar/Navbar';
import Asidebar from '../Navbar/Asidebar';

import * as Icons from '../Icons';

import { RootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { setHasPermissions, setPermission } from '../Login/LoginSlice';
import axiosInstance from '../../Api/Axios';
import SidebarLayout from '../Navbar/SidebarLayout';


const ProjectCreation: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const role: any = useSelector((state: RootState) => state.login.role);
    const token = useSelector((state: RootState) => state.login.token);


    const roleID = role?.role_id;

    const [permissions, setPermissions] = useState<any[] | null>(null);
    const [roleType, setRoleType] = useState<string | null>(null);


    const getPermissionsKey = async (): Promise<any | undefined> => {
        try {
            const productId = 14;
            const res = await axiosInstance.get(`/permission/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200) {
                return res.data.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getPermissions = async (role_id: any) => {
        try {
            const response = await axiosInstance.get(`role/${role_id}`);

            if (response.status === 200) {
                const permissionsRes = response.data.data;
                dispatch(setPermission(permissionsRes));
                setPermissions(permissionsRes);

                const permissionsKeyResponse: any[] = await getPermissionsKey();

                const permissionsKey = permissionsKeyResponse.flatMap(o => o.actions.map((i:any) => i.name));

                const normalizeKey = (str: string): string => {
                    return str.replace(/[^\w]/g, "").replace(/\s+/g, "");
                };

                const generatePermissionsObject = (permissions: any[], keys: string[]) => {
                    const normalizedKeys = keys.map(key => normalizeKey(key));

                    const result: Record<string, boolean> = {};

                    normalizedKeys.forEach(key => {
                        result[key] = false;
                    });

                    permissions.forEach(permission => {
                        permission.actions.forEach((action: any) => {
                            const actionKey = normalizeKey(action.name);
                            if (normalizedKeys.includes(actionKey)) {
                                result[actionKey] = true;
                            }
                        });
                    });

                    return result;
                };

                // Usage
                const permissionsObject = generatePermissionsObject(permissionsRes.permissions, permissionsKey);

                //console.log(permissionsObject);

                dispatch(setHasPermissions(permissionsObject))

                // Save role type to state
                const roleType = response.data.data.type;
                setRoleType(roleType);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getPermissions(roleID);
    }, [roleID]);

    /* useEffect(() => {
        navigate('/project-creation/ProjectCards'); // or any default route
      }, []); */

    return (
        <>
            <SidebarLayout roleType={roleType ?? ''}>
                <div className="bg-cover bg-center h-screen w-full flex">
                    {/* <Asidebar
                    Buttons={[
                        { icon: Icons.performance_icon, active: Icons.performance_icon_active, name: 'Project-List' },
                        { icon: Icons.folder_icon, active: Icons.folder_icon_active, name: 'Course-List' },
                        { icon: Icons.connection_icon, active: Icons.connection_icon_active, name: 'connection' },
                        { icon: Icons.users_icon, active: Icons.users_icon_active, name: 'Users' }
                    ]}
                    onChangeBtn={(selected) => {
                        console.log("selected",selected);
                        
                        if (selected === 'Course-List') {
                            navigate('/project-creation/ProjectCards');
                        } else if (selected === 'Users') {
                            navigate(`/project-creation/TeamAndRoles`); 
                        } else if (selected === 'Project-List') {
                            if (roleType === 'author') {
                                navigate('/project-creation/AuthorDashboard');
                            } else if (roleType === 'reviewer') {
                                navigate('/project-creation/ReviewerDashboard');
                            } else if (roleType === 'publisher') {
                                navigate('/project-creation/PmDashboard');
                            }
                        } else {
                            navigate('/project-creation');
                        }
                    }}
                /> */}

                    <div className="flex-1 ml-[3.5rem] flex flex-col">
                        <Navbar />
                        <div className="px-8 pb-5 flex flex-col h-[calc(100vh-92px)] overflow-auto scrollbar-big">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </SidebarLayout>
        </>
    )
}

export default ProjectCreation;