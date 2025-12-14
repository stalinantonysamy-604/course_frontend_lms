import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import * as Icons from '../../Icons';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
//import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';
import axiosInstance from "../../../Api/Axios";

import * as Images from './../../Images';



const AddTeamMembers: React.FC = () => {
    const token = useSelector((state: RootState) => state.login.token);
    const project = useSelector((state: RootState) => state.projectCreation.project);

    console.log("gedgergegerger", project)

    const navigate = useNavigate();
    const location = useLocation();
    const selectingRef = useRef(false);
    const dispatch = useDispatch();

    const [memberName, setMemberName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [teamList, setTeamList] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>(''); // store roleId
    const [selectedRoleName, setSelectedRoleName] = useState<string>(''); // display role name



    ///const [courseId, setCourseId] = useState<string>('');
    //const [productId, setProductId] = useState<string>('');



    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/role', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allRoles = res.data.data || [];
            setRoles(allRoles);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeamList = async () => {
        try {
            const response = await axiosInstance.get(`/invite`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const allMembers = response.data.data || [];
            setTeamList(allMembers); 
        } catch (error) {
            console.error('Error fetching team list:', error);
        }
    };





    useEffect(() => {
        fetchRoles();
        fetchTeamList();

    }, [])

    const filteredSuggestions = teamList.filter(member =>
        member.isActive &&
        member.name.toLowerCase().includes(memberName.toLowerCase()) &&
        !(member.project_id?.includes(project.projectId))
    );

    //console.log("filtersuggestions", filteredSuggestions);
    //console.log("temalist", teamList);


    const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;



    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: memberName,
            email: email,
            roles: [selectedRole],
            project_id: project.projectId,
            course_id: null
        };

        try {
            if (isDefaultValue?.userInviteId) {
                const updateUrl = `/invite/update/${isDefaultValue.userInviteId}`;

                await axiosInstance.put(updateUrl, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                toast.success("Updated team member successfully", { autoClose: 3000 });
            } else {

                await axiosInstance.post(
                    '/invite/creation',
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                toast.success("Added team member successfully", { autoClose: 3000 });
            }


            //setTeamList((prevList) => [...prevList, { id: generateUniqueId(), ...payload }]);
            await fetchTeamList(); 

            setMemberName('');
            setEmail('');
            setSelectedRole('');
            setIsDefaultValue(null);
        } catch (error) {
            console.error('Error adding/updating member:', error);
            toast.error("Something went wrong. Please try again.");
        }
    };



    const removeSelectedUser = (id: string) => {
        const updatedTeamList = teamList.filter(user => user.id !== id);
        setTeamList(updatedTeamList);

    };

    const handleDeleteProjectMembers = async (userInviteId: string) => {
            try {
                const payload = {
                    project_id: project.projectId,
                    course_id: null
                };
    
                const response = await axiosInstance.patch(
                    `/invite/delete/${userInviteId}`,
                    payload
                );
                console.log("userInviteId", userInviteId);
                if (response.status === 200) {
                    setTeamList(prev => prev.filter(member => member.userInviteId !== userInviteId));
                }
            } catch (error) {
                console.error("Failed to delete member:", error);
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

    const handleMemberNameSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMemberName(value);


        if (value.trim() === '') {
            setEmail('');
            setSelectedRole('');
            setIsDefaultValue('');
        }
    };

    const [isDefaultValue, setIsDefaultValue] = useState<any>();

    const handleMemberSelection = (suggestion: any) => {
        setMemberName(suggestion.name);
        setEmail(suggestion.email);
        // Ensure role is set automatically from the selected suggestion
        //debugger;
        console.log(roles);
        setIsDefaultValue(suggestion);
        setSelectedRole(suggestion.roles); // Assuming roles is an array and selecting the first role
        //setSelectedRole(Array.isArray(suggestion.roles) ? suggestion.roles[0] : suggestion.roles);

        setShowSuggestions(false);

    };

    //const filteredTeamList = teamList.filter(item => String(item.project_id) === String(project.projectId));
    const filteredTeamList = teamList.filter(item =>
        Array.isArray(item.project_id) &&
        item.project_id.includes(project.projectId) 
    );
     

    console.log("wesgegeg", filteredTeamList)

    //      console.log("Full teamList:", teamList);
    // console.log("Project ID:", project.projectId);
    // console.log("Filtered teamList:", filteredTeamList);


    return (

        <div className="p-6 space-y-6 bg-white" style={{ borderRadius: "16px" }}>
            <div className="flex flex-col lg:flex-row gap-6">

                <div className="w-full lg:w-1/2 space-y-4">
                    <div className="flex items-center space-x-3">
                        <button onClick={handleGoBack}>
                            <img style={{ height: "24px", width: "24px", flexShrink: "0" }} src={Icons.left_arrow_icon} alt="left_arrow_icon" />
                        </button>
                        <h2 style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "20px", fontStyle: "normal", fontWeight: "700", lineHeight: "28px" }}>Add team members</h2>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="relative">
                            <label htmlFor="memeber_name" style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "600", lineHeight: "22px" }}>
                                Member name
                            </label>
                            <input
                                type="text"
                                id="memeber_name"
                                placeholder="Enter member name"
                                value={memberName}
                                // onChange={(e) => setMemberName(e.target.value)}
                                onChange={handleMemberNameSearch}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Optional: hide on blur
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400"
                                autoComplete="off"
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto">
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onMouseDown={() => handleMemberSelection(suggestion)}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {suggestion.name}
                                        </li>
                                    ))}

                                </ul>
                            )}



                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <label htmlFor="email" style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "600", lineHeight: "22px" }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <div className="col-span-6">
                                <label style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "600", lineHeight: "22px" }} >Role</label>
                                {/* <Dropdown selected={(value: string) => setSelectedRole(value)} roles={roles} value={selectedRole} /> */}
                                {/* <Dropdown selected={(value: string) => setSelectedRole(value)} roles={roles} /> */}
                                <Dropdown
                                    selected={(value: string) => setSelectedRole(value)}
                                    roles={roles}
                                    defaultValue={isDefaultValue}
                                //value={selectedRole}
                                />

                            </div>
                        </div>

                        <button
                            type="submit"
                            // className="bg-gradient-to-r from-indigo-400 to-indigo-700 hover:from-indigo-500 hover:to-indigo-800 text-white py-2.5 px-8 rounded-full text-sm font-medium"
                            className="mt-5 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-10 py-2.5 text-center"
                            style={{ marginBottom: "15px", marginTop: "35px" }}
                        >
                            Add
                        </button>

                    </form>
                    <ToastContainer />
                </div>

                <div className="hidden lg:flex flex-col items-center justify-center px-4">
                    <div className="border-l border-gray-300 relative" style={{ height: '255px', marginTop: '40px', marginBottom: '' }}>
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[16px] font-bold text-gray-900">Or</span>
                    </div>
                </div>


                <div className="w-full lg:w-1/2 space-y-2 mt-[50px]">
                    <h3 style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "16px", fontStyle: "normal", fontWeight: "700", lineHeight: "24px" }}>Bulk upload team members</h3>

                    <p style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "400", lineHeight: "22px", marginTop: "6px" }}>
                        Upload a CSV or XLSX file to quickly add multiple team members.
                    </p>


                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center" style={{ padding: "14px", width: "553px", height: "187px", alignItems: "center", marginTop: "12px", }}>
                        <div className="flex justify-center mb-4">
                            <img
                                // src="https://img.icons8.com/ios/50/upload--v1.png"
                                src={Images.upload_image}
                                alt="upload"
                                className="w-[72px] h-[72px] mx-auto cursor-pointer"
                            />
                        </div>
                        <p style={{ color: "#40444D", textAlign: "center", fontFamily: "DM Sans", fontSize: "16px", fontStyle: "normal", fontWeight: "600", lineHeight: "20px" }}>
                            Choose a file or drag & drop here
                        </p>

                        <p style={{ color: "#7A7F89", textAlign: "center", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "400", lineHeight: "20px", marginTop: '5px' }}>
                            Supported files .csv & .xlsx with maximum size 100MB,💡Need help?
                            {/* <span className="cursor-pointer text-[#7A7F89] ml-1"</span> */}
                        </p>
                        <p style={{ color: "#7A7F89", textAlign: "center", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "400", lineHeight: "20px" }}>
                            Download sample files{' '}
                            <a href="#" className="text-[#4318FF] underline">sample.csv</a> &{' '}
                            <a href="#" className="text-[#4318FF] underline">sample.xlsx</a>
                        </p>

                    </div>

                </div>
            </div>


            <div>
                <h4 style={{ color: "#000", fontFamily: "DM Sans", fontSize: "16px", fontStyle: "normal", fontWeight: "700", lineHeight: "24px", }} >
                    Added team members ({filteredTeamList.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: "15px" }}>
                    {filteredTeamList.map((item) => {
                        const initials = item.name
                            .split(' ')
                            .slice(0, 2)
                            .map((word: string) => word[0].toUpperCase())
                            .join('');
                        return (
                            <div key={item.id} className="flex items-center mb-3 bg-white p-3 rounded-lg text-sm text-gray-700 border border-gray-200 shadow-lg" style={{ width: "", height: "68px" }}>
                                <div className="w-full">
                                    <span className="text-sm text-[#1D1F23] font-bold">
                                        {/* {item.roleName} */}
                                        {item.roleName
                                            ? item.roleName.charAt(0).toUpperCase() + item.roleName.slice(1)
                                            : '-'}
                                    </span>
                                    <div className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm mx-4">
                                        {initials}
                                    </div>
                                    <span className="text-sm">{item.name}</span>
                                    <span className="px-3 text-gray-300">|</span>
                                    <span>{item.email}</span>
                                </div>
                                <button title="Delete" onClick={() => handleDeleteProjectMembers(item.userInviteId)}
                                    //onClick={() => removeSelectedUser(item.id)} 
                                    className="text-gray-500 hover:text-gray-700">
                                    <img src={Icons.user_delete_icon} alt="user_delete_icon.svg" />
                                </button>
                                 
                                
                                
                            </div>
                        );
                    })}
                </div>
                {/* <div>
                    {teamList.map((user, index) => (
                        <div key={user.id || index}>
                            <span>{user.name} - {user.email} - {user.role}</span>
                            <button onClick={() => removeSelectedUser(user.id)}>Remove</button>
                        </div>
                    ))}
                </div> */}
            </div>
        </div>


    )
}



// interface DropdownProps {
//     value: string;
//     selected: (value: string) => void;
//     roles: { id: number; roleName: string }[];
// }

// const Dropdown: React.FC<DropdownProps> = ({ value, selected, roles }) => {
//     const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         selected(e.target.value);  // Ensure selected value is being passed correctly
//     };

//     return (
//         <select
//             value={value}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400"
//         >
//             <option value="">Select Role</option>
//             {roles.map((role) => (
//                 <option key={role.id} value={String(role.id)}> {/* Make sure value is a string */}
//                     {role.roleName}
//                 </option>
//             ))}
//         </select>
//     );
// };


interface DropdownProps {
    selected: (value: string) => void;
    roles: any[];
    defaultValue: any;
}

const Dropdown: React.FC<DropdownProps> = ({ selected, roles, defaultValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };


    const handleItemClick = (role: any) => {
        if (role) {
            setSelectedItem(role.roleName);
            setIsOpen(false);
            selected('roleId' in role ? role.roleId : role.roles);
            console.log("roleId", role.roleId);
        }
    };


    useEffect(() => {
        //debugger;
        handleItemClick(defaultValue);
        console.log("defautvalue", defaultValue);
    }, [defaultValue])

    return (
        <div className="relative">
            <button
                className="w-full h-11 border justify-between border-[#CAD2FF] hover:bg-gray-100 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-base px-4 py-2 text-[#8D95A4] inline-flex items-center"
                type="button"
                onClick={toggleDropdown}
            >
                {/* {selectedItem ? <span className="text-[#40444D]">{selectedItem}</span> : "Select"} */}
                {selectedItem ? <span className="text-[#40444D]">{selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}</span> : "Select"}
                <img
                    src={Icons.gray_down_arrow_icon}
                    alt="gray_down_arrow_icon.svg"
                    className="ml-2"
                />
            </button>

            {isOpen && (
                <ul className="absolute w-full py-1 mt-2 bg-white border border-[#e6ebf1] rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out">
                    {roles.map((role) => (
                        <li
                            key={role.roleId}
                            onClick={() => handleItemClick(role)}
                            className="block px-4 py-2 text-gray-700 cursor-pointer hover:bg-blue-200 hover:text-blue-600 rounded-md transition-colors duration-200 ease-in-out"
                        >
                            {/* {role.roleName} */}
                            {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
                        </li>
                    ))}
                </ul>
            )}


        </div>
    )
}



export default AddTeamMembers;

