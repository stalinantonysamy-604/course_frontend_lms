import React, { useEffect, useState } from 'react';
import Vector1 from '../../../Assets/Icons/Vector1.svg'
import Vector2 from '../../../Assets/Icons/Vector2.svg'
import * as Icons from '../../Icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import axiosInstance from '../../../Api/Axios';


type Course = {
    courseId: string;
    courseName: string;
    role?: string;
};

type Project = {
    projectId: string;
    projectName: string;
    courses: Course[];
};

const UserDetails: React.FC = () => {
    const token = useSelector((state: RootState) => state.login.token);
    const { userInviteId } = useParams<{ userInviteId: string }>();
    const navigate = useNavigate();

    const [expanded, setExpanded] = useState<number | null>(0);
    const [projects, setProjects] = useState<Project[]>([]);
    const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string }>({
        name: '',
        email: '',
        role: '',
    });

    const toggleExpand = (index: number) => {
        setExpanded(prev => (prev === index ? null : index));
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate("/project-creation/TeamAndRoles");
        }
    };

    // useEffect(() => {
    //     const fetchUserDetails = async () => {
    //         try {
    //             const response = await axiosInstance.get(
    //                 `/invite/view/${userInviteId}`,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );

    //             const { data } = response.data;
    //             console.log("view member", response.data);

    //             const nestedProjects = data.projects?.flatMap((p: any) => p.projects) || [];
    //             setProjects(nestedProjects);
    //             setUserInfo({
    //                 name: data.name,
    //                 email: data.email,
    //                 role: data.roles 
    //             });


    //         } catch (error) {
    //             console.error('Error fetching user details:', error);
    //         }
    //     };

    //     if (token && userInviteId) {
    //         fetchUserDetails();
    //     }
    // }, [token, userInviteId]);

   useEffect(() => {
    const fetchUserDetails = async () => {
        try {
            const response = await axiosInstance.get(
                `/invite/view/${userInviteId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { data } = response.data;
            console.log("view member", response.data);

            const nestedProjects = data.projects?.flatMap((roleEntry: any) =>
                roleEntry.projects.map((project: any) => ({
                    ...project,
                    courses: project.courses.map((course: any) => ({
                        ...course,
                        role: roleEntry.roleName,
                    }))
                }))
            ) || [];

            setProjects(nestedProjects);
            console.log("project details", nestedProjects);
            setUserInfo({
                name: data.name,
                email: data.email,
                role: data.roles
            });

        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    if (token && userInviteId) {
        fetchUserDetails();
    }
}, [token, userInviteId]);


    return (
        <div>

            <div className="flex items-center gap-2 mb-4">
                <button onClick={handleBack} className="p-0 border-none bg-transparent">
                    <img src={Icons.left_arrow_icon} alt="Back" />
                </button>
                <p className="text-[20px] font-bold text-[#1D1F23]">View member</p>
            </div>

            <div className="w-full mx-auto bg-white p-6 rounded-2xl shadow-md">
                <div className='w-[475px]'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-[14px] text-[#1D1F23] font-bold">Name</p>
                            <p className="text-[14px] text-[#40444D] font-normal">{userInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-[14px] text-[#1D1F23] font-bold">Email address</p>
                            <p className="text-[14px] text-[#40444D] font-normal">{userInfo.email}</p>
                        </div>
                        <div>
                            <p className="text-[14px] text-[#1D1F23] font-bold">Role</p>
                            {/* <p className="text-[14px] text-[#40444D] font-normal">{userInfo.role}</p> */}
                            <p className="text-[14px] text-[#40444D] font-normal">
                                {Array.isArray(userInfo.role) ? userInfo.role.join(', ') : userInfo.role}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[14px] text-[#1D1F23] font-bold mb-4">Assigned projects</p>
                        {projects.map((project, index) => (
                            <div
                                key={project.projectId}
                                className="border rounded-lg mb-3 bg-white shadow-sm"
                            >

                                <button
                                    className="w-full flex justify-between items-center px-4 py-3 text-left"
                                    onClick={() => toggleExpand(index)}
                                >
                                    <span className="text-[14px] text-[#1D1F23] font-bold">{project.projectName}</span>
                                    <img
                                        src={expanded === index ? Vector2 : Vector1}
                                        alt="Toggle Icon"
                                        className="w-4 h-4"
                                    />
                                </button>

                                {expanded === index && (
                                    <div className="px-4 pb-3">
                                        {project.courses.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-2 text-gray-400 text-sm border-b pb-1 mb-2">
                                                    <span className="text-[14px] text-[#1D1F23] font-medium">Courses</span>
                                                    <span className="text-[14px] text-[#1D1F23] font-medium">Role</span>
                                                </div>
                                                {project.courses.map((course, i) => (
                                                    <div
                                                        key={i}
                                                        className="grid grid-cols-2 text-sm py-1 text-gray-800"
                                                    >
                                                        <span className="text-[14px] text-[#40444D] font-medium">{course.courseName}</span>
                                                        <span className="text-[14px] text-[#40444D] font-medium">{course.role}</span>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No courses assigned</p>
                                        )}
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    {/* <div className="mt-6">
                        <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition">
                            Edit
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
