
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import * as Icons from '../../Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

import * as Images from './../../Images';

const AddTeamMembers: React.FC = () => {
    const token = useSelector((state: RootState) => state.login.token);
    const navigate = useNavigate();
    const location = useLocation();
    const selectingRef = useRef(false);


    const [memberName, setMemberName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [teamList, setTeamList] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    // const [dropdownKey, setDropdownKey] = useState(0);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);


    const fetchRoles = async () => {
        try {
            const res = await axios.get('https://dev-apicoursebuilder.dictera.com/role', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allRoles = res.data.data || [];
            setRoles(allRoles);
            console.log("roles", allRoles)

        } catch (err) {
            console.error(err);
        }
    };


    const fetchTeamList = async () => {
        try {
            const response = await axios.get('https://dev-apicoursebuilder.dictera.com/invite');
            setTeamList(response.data.data || []);
            //console.log('Team list:', response.data.data);

        } catch (error) {
            console.error('Error fetching team list:', error);
        }
    };

    useEffect(() => {

        fetchRoles();
        fetchTeamList();

    }, []);



    useEffect(() => {
        if (selectingRef.current) {
            selectingRef.current = false;
            return;
        }

        if (memberName.trim() === "") {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        else {
            const filtered = teamList.filter((m) =>
                m.name.toLowerCase().includes(memberName.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        }
    }, [memberName, teamList]);


    const handleSuggestionClick = (member: any) => {
        selectingRef.current = true;
        setMemberName(member.name);
        setEmail(member.email);
        setSelectedRole(member.roles[0].toString());
        setShowSuggestions(false);

    };


    // const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // const handleFormSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     const newMember = {
    //         name: memberName,
    //         email: email,
    //         roles: [selectedRole],
    //     };

    //     try {

    //         const response = await axios.post(
    //             'https://dev-apicoursebuilder.dictera.com/invite/creation',
    //             newMember,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //             }
    //         );

    //         console.log('Member added successfully:', response.data);

    //         const selectedRoleName = roles.find((role) => role._id === selectedRole)?.roleName || selectedRole;

    //         setTeamList((prevList) => [
    //             ...prevList,
    //             {
    //                 id: generateUniqueId(),
    //                 name: memberName,
    //                 email: email,
    //                 roleName: selectedRoleName,
    //             },
    //         ]);

    //         // setTeamList((prevList) => [
    //         //     ...prevList,
    //         //     {
    //         //         id: generateUniqueId(),
    //         //         name: memberName,
    //         //         email: email,
    //         //         role: selectedRole,
    //         //     },
    //         // ]);

    //         // setMemberName('');
    //         // setEmail('');
    //         // setSelectedRole('');

    //         toast.success('Added team members successfully', {
    //             onClose: () => {
    //                 setMemberName('');
    //                 setEmail('');
    //                 setSelectedRole('');
    //                 //setDropdownKey(k => k + 1); 

    //             },
    //         });

    //     } catch (err) {

    //         console.error('Error adding member:', err);
    //         toast.error('Failed to add team member');
    //     }
    // };

    const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newMember = {
            name: memberName,
            email: email,
            roles: [selectedRole],
        };

        try {

            const response = await axios.post(
                'https://dev-apicoursebuilder.dictera.com/invite/creation',
                newMember,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Member added successfully:', response.data);


            setTeamList((prevList) => [
                ...prevList,
                {
                    id: generateUniqueId(),
                    name: memberName,
                    email: email,
                    role: selectedRole,
                },
            ]);

            // setMemberName('');
            // setEmail('');
            // setSelectedRole('');

            toast.success('Added team members successfully', {
                onClose: () => {
                    setMemberName('');
                    setEmail('');
                    setSelectedRole('');
                },
            });

        } catch (err) {

            console.error('Error adding member:', err);
            toast.error('Failed to add team member');
        }
    };



    const removeSelectedUser = (id: string) => {
        setTeamList(prevList => prevList.filter(user => user.id !== id));
    };

    const handleGoBack = () => {
        switch (location.pathname) {
            /* case '/course-creation/CourseStructure':
                navigate('/course-creation/CourseCards');
                break; */
            case '/course-creation/UMGC/CourseCards':
                navigate('/project-creation/ProjectCards');
                break;

            default:
                navigate(-1); // Default behavior to go back;
        }
    };


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
                                onChange={(e) => setMemberName(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400"
                                autoComplete="off"
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 bg-white border mt-1 rounded shadow-md max-h-48 overflow-y-auto z-10">
                                    {suggestions.map((member) => (
                                        <li
                                            key={member._id}
                                            onClick={() => handleSuggestionClick(member)}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            {member.name}
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
                                <Dropdown selected={(value: string) => setSelectedRole(value)} roles={roles} />

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
                    Added team members ({teamList.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: "15px" }}>

                    {teamList.map((item) => {
                        const initials = item.name
                            .split(' ')
                            .slice(0, 2)
                            .map((word: string) => word[0].toUpperCase())
                            .join('');

                        return (
                            <div key={item.id} className="flex items-center mb-3 bg-white p-3 rounded-lg text-sm text-gray-700 border border-gray-200 shadow-lg" style={{ width: "", height: "68px" }}>
                                <div className="w-full">
                                    <span className="text-sm text-[#1D1F23] font-bold">{item.roleName}</span>
                                    <div className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm mx-4">
                                        {initials}
                                    </div>
                                    <span className="text-sm">{item.name}</span>
                                    <span className="px-3 text-gray-300">|</span>
                                    <span>{item.email}</span>
                                </div>
                                <button
                                    // onClick={() => removeSelectedUser(item.id)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <img src={Icons.user_delete_icon} alt="user_delete_icon.svg" />
                                </button>
                            </div>
                        );
                    })}

                
                </div>
            </div>
        </div>


    )
}

// interface DropdownProps {

//     roles: { roleId: number; roleName: string }[];
//     value: string;
//     selected: (value: string) => void;

// }

// const Dropdown: React.FC<DropdownProps> = ({ selected, roles, value }) => {
//     const [isOpen, setIsOpen] = useState(false);

//     const selectedRoleName = roles.find(r => r.roleId.toString() === value)?.roleName ?? '';

//     const toggleDropdown = () => setIsOpen(open => !open);
//     const handleItemClick = (role: { roleId: number; roleName: string }) => {
//         selected(role.roleId.toString());
//         setIsOpen(false);
//     };


//     return (
//         <div className="relative">
//             <button
//                 type="button"
//                 onClick={toggleDropdown}
//                 className="
//                 w-full h-11
//                 border border-[#CAD2FF]
//                 justify-between
//                 rounded-xl
//                 px-4 py-2
//                 text-base text-[#8D95A4]
//                 font-medium
//                 inline-flex items-center
//                 hover:bg-gray-100
//                 focus:ring-1 focus:ring-blue-300 focus:outline-none"
//             >
//                 <span className={selectedRoleName ? "text-[#000]" : "text-[#8D95A4]"}>
//                     {selectedRoleName || 'Select'}
//                 </span>
//                 <img
//                     src={Icons.gray_down_arrow_icon}
//                     alt="toggle"
//                     className="ml-2 w-[10px] h-[10px] object-contain"
//                 />
//             </button>

//             {isOpen && (
//                 <div className="absolute z-10 mt-2 w-full rounded-lg bg-white border shadow-md max-h-48 overflow-auto">
//                     {roles.map(role => (
//                         <button
//                             key={role.roleId}
//                             onClick={() => handleItemClick(role)}
//                             className="
//                             w-full text-left
//                             px-4 py-2 text-sm text-[#40444D]
//                             hover:bg-[#F3F4F6]
//                             focus:outline-none"
//                         >
//                             {role.roleName}
//                         </button>
//                     ))}
//                 </div>
//             )}

//             <ToastContainer />

//         </div>
//     )
// }

interface DropdownProps {
    selected: (value: string) => void;
    roles: any[];
}

const Dropdown: React.FC<DropdownProps> = ({ selected, roles }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

   
    const handleItemClick = (role: any) => {
        setSelectedItem(role.roleName);
        setIsOpen(false);
        selected(role.roleId);  
    };

    return (
        <div className="relative">
            <button
                className="w-full h-11 border justify-between border-[#CAD2FF] hover:bg-gray-100 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-base px-4 py-2 text-[#8D95A4] inline-flex items-center"
                type="button"
                onClick={toggleDropdown}
            >
                {selectedItem ? <span className="text-[#40444D]">{selectedItem}</span> : "Select"}
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
                            {role.roleName}
                        </li>
                    ))}
                </ul>
            )}

            <ToastContainer />
        </div>
    )
}



export default AddTeamMembers;
