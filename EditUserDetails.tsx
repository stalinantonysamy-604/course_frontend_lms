import React, { useState, useEffect } from "react";
import axios from 'axios';
import * as Icons from '../../Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import axiosInstance from "../../../Api/Axios";

interface Role {
    roleId: string;
    roleName: string;
}


const EditUserDetails: React.FC = () => {
    const token = useSelector((state: RootState) => state.login.token);
    const navigate = useNavigate();
    const location = useLocation();

    const [memberName, setMemberName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<string[]>([]);
    const [teamList, setTeamList] = useState<any[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const { userInviteId, name, email: stateEmail, roleName: stateRole } = location.state || {};

    console.log("State role from location:", stateRole);

    // const [dropdownKey, setDropdownKey] = useState(0);

    useEffect(() => {
        if (name) setMemberName(name);
        if (stateEmail) setEmail(stateEmail);

        const fetchRoles = async () => {
            try {
                const res = await axiosInstance.get('/role', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const roleData: Role[] = res?.data?.data || [];
                setRoles(roleData);

                if (!stateRole) {
                    setSelectedRole([]);
                    return;
                }

                // Normalize stateRole to array of strings
                let rolesFromState: string[] = [];
                if (Array.isArray(stateRole)) {
                    rolesFromState = stateRole.map(r => r.toString().trim().toLowerCase());
                } else if (typeof stateRole === 'string') {
                    rolesFromState = stateRole.split(',').map(r => r.trim().toLowerCase());
                }

                // Find matching roleIds for all roles in rolesFromState
                const matchedRoleIds = roleData
                    .filter(role => {
                        const roleIdStr = role.roleId?.toString().trim().toLowerCase();
                        const roleNameStr = role.roleName?.toString().trim().toLowerCase();
                        return rolesFromState.includes(roleIdStr) || rolesFromState.includes(roleNameStr);
                    })
                    .map(role => role.roleId);

                setSelectedRole(matchedRoleIds);
            } catch (err) {
                console.error("Error fetching roles:", err);
                toast.error("Failed to fetch roles");
            }
        };

        if (token) {
            fetchRoles();
        }
    }, [name, stateEmail, stateRole, token]);



    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userInviteId = location?.state?.userInviteId;
        if (!userInviteId) {
            toast.error("Missing userInviteId");
            return;
        }
        const { projectId, courseId } = location.state || {};
        console.log("projectid", projectId)
        console.log("courseid", courseId);

        try {
            const response = await axiosInstance.put(
                `/invite/update/${userInviteId}`,
                {
                    name: memberName,
                    email: email,
                    roles: [Number(selectedRole)],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Response:', response.data);
            toast.success("Member name updated successfully!", { autoClose: 3000 });
            navigate(-1);
        } catch (error) {
            console.error('Failed to update member name:', error);
            toast.error("Failed to update name. Please try again.");
        }
    };




    const handleGoBack = () => {
        switch (location.pathname) {
            case '/course-creation/UMGC/CourseCards':
                navigate('/project-creation/ProjectCards');
                break;
            default:
                navigate(-1);
        }
    }; 


    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={handleGoBack} className="mr-3">
                    <img
                        src={Icons.left_arrow_icon}
                        alt="back"
                        className="w-6 h-6"
                    />
                </button>
                <h2 className="text-[#1D1F23] text-[20px] font-bold font-['DM Sans']">
                    Edit member
                </h2>
            </div>

            <div className="min-h-screen bg-white p-8 rounded-[16px]">
                <div className="w-full mx-auto">
                    <form onSubmit={handleFormSubmit} className="w-full">
                        <div className="flex flex-wrap gap-4 w-full items-start">
                            <div className="flex flex-col" style={{ width: "439px" }}>
                                <label className="text-sm font-semibold text-[#40444D] mb-1">
                                    Enter member name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter member name"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400"
                                    required
                                />
                            </div>

                            <div className="flex flex-col w-[250px]">
                                <label className="text-sm font-semibold text-[#40444D] mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    disabled
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col w-[200px]">
                                <label className="text-sm font-semibold text-[#40444D] mb-1">
                                    Role
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-[84px] overflow-y-auto">
                                    {selectedRole.map((roleId) => {
                                        const role = roles.find((r) => r.roleId === roleId);
                                        return (
                                            <div
                                                key={roleId}
                                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                                            >
                                                {role ? role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1) : roleId}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col justify-start px-4 pt-6">
                                <button
                                    type="submit"
                                    className="text-white bg-gradient-to-r from-indigo-400 to-indigo-700 hover:from-indigo-500 hover:to-indigo-800 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-10 py-2.5 text-center"
                                >
                                    Submit
                                </button>
                            </div>

                        </div>
                    </form>
                    <ToastContainer />
                </div>
            </div>


        </div>
    );
};

// interface DropdownProps {
//     selected: (value: string) => void;
//     roles: any[];
//     disabled?: boolean;
//     selectedValue?: string;
// }

// const Dropdown: React.FC<DropdownProps> = ({ selected, roles, disabled = false, selectedValue = '' }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [selectedItem, setSelectedItem] = useState<string | null>(null);

//     useEffect(() => {
//         if (selectedValue && roles.length > 0) {
//             const selectedRole = roles.find(
//                 (role) =>
//                     role.roleId === selectedValue ||
//                     role.roleName === selectedValue
//             );

//             if (selectedRole) {
//                 setSelectedItem(selectedRole.roleName);
//                 selected(selectedRole.roleId);
//             } else {
//                 setSelectedItem(null);
//             }
//         }
//     }, [selectedValue, roles]);



//     const toggleDropdown = () => {
//         if (!disabled) setIsOpen(!isOpen);
//     };

//     const handleItemClick = (role: any) => {
//         setSelectedItem(role.roleName);
//         setIsOpen(false);
//         selected(role.roleId);
//     };

//     return (
//         <div className="relative">
//             <button
//                 className={`w-full h-11 border justify-between border-[#CAD2FF] font-medium rounded-xl text-base px-4 py-2 text-[#8D95A4] inline-flex items-center ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100 focus:ring-1 focus:outline-none focus:ring-blue-300'}`}
//                 type="button"
//                 onClick={toggleDropdown}
//                 disabled={disabled}
//             >
//                 <span className="text-[#40444D]">
//                     {selectedItem ? selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1) : "Select"}
//                 </span>
//                 <img
//                     src={Icons.gray_down_arrow_icon}
//                     alt="arrow"
//                     className="ml-2 w-[10px] h-[10px]"
//                 />
//             </button>

//             {isOpen && (
//                 <div className="absolute z-10 mt-2 w-full rounded-lg bg-white border shadow-md max-h-48 overflow-auto">
//                     {roles.map((role) => (
//                         <button
//                             key={role.roleId}
//                             onClick={() => handleItemClick(role)}
//                             className="w-full text-left px-4 py-2 text-sm text-[#40444D] hover:bg-[#F3F4F6]"
//                         >
//                             {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
//                         </button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };


export default EditUserDetails;
