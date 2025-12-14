import React, { useState, useEffect } from "react";
import axios from 'axios';
import * as Icons from '../../Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import axiosInstance from "../../../Api/Axios";

import * as Images from './../../Images';


const Invite: React.FC = () => {
    const token = useSelector((state: RootState) => state.login.token);
    const navigate = useNavigate();
    const location = useLocation();

    const [memberName, setMemberName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [teamList, setTeamList] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
   
    // const [dropdownKey, setDropdownKey] = useState(0);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axiosInstance.get('/role', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const allRoles = res.data.data || [];
                setRoles(allRoles);
                console.log("roles", allRoles);
            } catch (err) {
                console.error("Error fetching roles:", err);
            }
        };

        fetchRoles();

    }, []);


    

    const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newMember = {
            name: memberName,
            email: email,
            roles: [selectedRole],
            project_id: null,
            course_id: null

        };

        try {
            const response = await axiosInstance.post(
                '/invite/creation',
                newMember,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Invite sent successfully:', response.data);
            toast.success("Invite shared successfully!", { autoClose: 3000 });

            setTeamList((prevList) => [...prevList, { id: generateUniqueId(), ...newMember }]);

            setMemberName('');
            setEmail('');
            setSelectedRole('');
            //setDropdownKey(k => k + 1); 

        } catch (error) {
            console.error('Failed to send invite:', error);
            toast.error("Failed to share invite. Please try again.");
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
        <div className="min-h-screen bg-white p-8">
            <div className="w-full mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={handleGoBack} className="mr-3">
                        <img
                            src={Icons.left_arrow_icon}
                            alt="back"
                            className="w-6 h-6"
                        />
                    </button>
                    <h2 className="text-[#1D1F23] text-[20px] font-bold font-['DM Sans']">
                        Invite a team member
                    </h2>
                </div>

                <form onSubmit={handleFormSubmit} className="w-full">
                    <div className="flex flex-wrap gap-4 w-full items-end">
                        <div className="flex flex-col" style={{ width: "439px" }}>
                            <label className="text-sm font-semibold text-[#1D1F23]">Enter member name</label>
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
                            <label className="text-sm font-semibold text-[#1D1F23] mt-4">Email address</label>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <div className="flex flex-col w-[200px]">
                            <label className="text-sm font-semibold text-[#1D1F23] mt-4">Role</label>
                            <Dropdown selected={(value: string) => setSelectedRole(value)} roles={roles} />
                        </div>

                        <div className="flex flex-col px-4">
                            <button
                                type="submit"
                                className="w-full mt-6 text-white bg-gradient-to-r from-indigo-400 to-indigo-700 hover:from-indigo-500 hover:to-indigo-800 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-10 py-2.5 text-center"
                            >
                                Invite
                            </button>
                        </div>
                    </div>
                </form>

                <p className="mx-1 text-[#1D1F23] font-bold" style={{ marginTop: "25px", marginBottom: "25px", fontSize: "16px" }}>Or</p>

                <div className="space-y-2 w-full">
                    <h3 style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "16px", fontStyle: "normal", fontWeight: "700", lineHeight: "24px" }}>Bulk upload team members</h3>
                    <p style={{ color: "#1D1F23", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "400", lineHeight: "22px", marginTop: "6px", marginBottom: "2%" }}>
                        Upload a CSV or XLSX file to quickly add multiple team members.
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center" style={{ padding: "14px", height: "200px", alignItems: "center", }}>
                        <div className="flex justify-center mb-4">
                            <img
                                src={Images.upload_image}
                                alt="upload"
                                className="w-[72px] h-[72px] mx-auto cursor-pointer"
                            />
                        </div>
                        <p style={{ color: "#40444D", textAlign: "center", fontFamily: "DM Sans", fontSize: "16px", fontStyle: "normal", fontWeight: "600", lineHeight: "20px" }}>
                            Choose a file or drag & drop here
                        </p>

                        <p style={{ color: "#7A7F89", textAlign: "center", fontFamily: "DM Sans", fontSize: "14px", fontStyle: "normal", fontWeight: "400", lineHeight: "20px", marginTop: '5px' }}>
                            Supported files .csv & .xlsx with maximum size 100MB,💡Need help? Download sample files{' '}
                            <a href="#" className="text-[#4318FF] underline">sample.csv</a> &{' '}
                            <a href="#" className="text-[#4318FF] underline">sample.xlsx</a>
                        </p>
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

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
                {/* {selectedItem ? <span className="text-[#40444D]">{selectedItem}</span> : "Select"} */}
                {selectedItem ? <span className="text-[#40444D]">{selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}</span> : "Select"}

                <img
                    src={Icons.gray_down_arrow_icon}
                    alt="gray_down_arrow_icon.svg"
                    className="ml-2 w-[10px] h-[10px] object-contain"
                />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-lg bg-white border shadow-md max-h-48 overflow-auto">
                    {roles.map((role) => (
                        <button
                            key={role.roleId}
                            onClick={() => handleItemClick(role)}
                            className="w-full text-left px-4 py-2 text-sm text-[#40444D] hover:bg-[#F3F4F6]"
                        >
                            {/* {role.roleName} */}
                            {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
                        </button>
                    ))}
                </div>
            )}
            
        </div>
    );
};

export default Invite;
