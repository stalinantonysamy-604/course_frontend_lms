import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import { useFeatureGate } from "@statsig/react-bindings";
import { useDispatch } from 'react-redux';
import { setBreadCrumb, setTitle } from './../Navbar/NavbarSlice';
import { setModulesItems, setCourseNameSlice, setCourseId, clearGenerateOutlineParams, setCourseCode } from './CourseCreationSlice';

import { useSelector } from 'react-redux';
import { RootState } from './../../store';

import axiosInstance from './../../Api/Axios';

import * as Images from './../Images';
import * as Icons from './../Icons';
import axios from 'axios';
import edit_icon from '../../Assets/Icons/edit_icon.svg';
import search_icon from '../../Assets/Icons/search_icon.svg';
import plus_white from '../../Assets/Icons/plus_white.svg';

import { WorkflowViewer } from 'dictera-workflow';
//import './../../../node_modules/dictera-workflow/dist/styles/style.css'
//import './../../../node_modules/reactflow/dist/style.css';

//import './../../Assets/dictera-workflow_style/dist/styles/style.css';
//import './../../Assets/dictera-workflow_style/dist_rflow/style.css';

//import 'reactflow/dist/style.css';
//import 'dictera-workflow/dist/styles.css';


interface Member {
    name: string;
    email: string;
    roles: number[];
    assignedProject: string;
    status?: string;
    roleName?: string;
    courseName?: string;
    assignedCourse?: string;
    isActive?: boolean;
    userInviteId: string;
}


const CourseCardView: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { _activeTab } = location.state || {};
    const token = useSelector((state: RootState) => state.login.token);

    const project: any = useSelector((state: RootState) => state.projectCreation.project);
    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);

    //console.log("gedgerg", project)

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [courseList, setCourseList] = useState<any[]>([])
    const [showAddCourse, setShowAddCourse] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const [courseName, setCourseName] = useState<string>('');
    const [courseCode, setCourseCode] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedSort, setSelectedSort] = useState<SortOption>({ label: 'Newest', value: 'Newest' });

    const [thumbnailUrl, setthumbnailUrl] = useState<string>('');
    const [isEditCourse, setEditCourse] = useState<boolean>(false);
    const [editCourseId, setEditCouseId] = useState<string>('');

    const [activeTab, setActiveTab] = useState('');
    const [activeCourseTab, setActiveCourseTab] = useState('');

    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [teamList, setTeamList] = useState<any[]>([]);
    const displayedMembers = teamList.slice(0, 4);
    const [showCourseTeamScreen, setShowCourseTeamScreen] = useState<boolean>(false);
    const [courseIdForTeamScreen, setCourseIdForTeamScreen] = useState<string>('');
    //console.log("courseId",courseIdForTeamScreen );
    const [workflowData, setWorkflowData] = useState<any[]>([]);
    const [showSendModal, setShowSendModal] = useState<boolean>(false);

    const handleInvite = () => {
        navigate('/project-creation/AddTeamMembers');
    };


    const handleCourseInvite = () => {
        //debugger;
        navigate('/course-creation/CourseTeamMembers', { state: { courseId: courseIdForTeamScreen } });
    };



    useEffect(() => {
        const fetchMembers = async () => {
            //if (!project?.projectId) return;

            try {
                const response = await axiosInstance.get(
                    `/invite/project/${project.projectId}`
                );

                console.log("projectId", project.projectId);
                const fetchedData: Member[] = response.data.data;

                //console.log("Fetched Members:", fetchedData);

                // if (Array.isArray(fetchedData)) {
                //     fetchedData.forEach((member: Member) => {
                //         console.log("Fetched Member:", member);
                //         console.log("Fetched Member Name:", member.name);
                //         console.log("Fetched Member Email:", member.email);

                //     });
                // }

                const filteredMembers = fetchedData.filter(
                    (member) => member.assignedProject === project.projectId
                );

                setMembers(fetchedData);
                //console.log("filterdsnd", fetchedData)

                //console.log("Filtered team members for project:", filteredMembers);

            } catch (error) {
                console.error("Error fetching invite data:", error);
            }
        };

        fetchMembers();
    }, [project?.projectId]);


    const filteredData = members.filter((member) => {
        const matchSearch =
            member.name?.toLowerCase().includes(search.toLowerCase()) ||
            member.email?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === 'All' || member.status === statusFilter;

        return matchSearch && matchStatus;
    });

    //console.log("Filtered Dataergergerg:", filteredData);

    //line 749

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
                setMembers(prev => prev.filter(member => member.userInviteId !== userInviteId));
            }
        } catch (error) {
            console.error("Failed to delete member:", error);
        }
    };




    //inside course added team member list 470 line

    useEffect(() => {
        const fetchCourseMembers = async () => {
            //if (!courseIdForTeamScreen) return;

            try {
                const response = await axiosInstance.get(
                    `/invite/course/${courseIdForTeamScreen}`
                );

                console.log("courseId", courseIdForTeamScreen);
                const fetchedData: Member[] = response.data.data;

                //console.log("Fetched Members:", fetchedData);

                // if (Array.isArray(fetchedData)) {
                //     fetchedData.forEach((member: Member) => {
                //         console.log("Fetched Member:", member);
                //         console.log("Fetched Member Name:", member.name);
                //         console.log("Fetched Member Email:", member.email);

                //     });
                // }

                const filteredMembers = fetchedData.filter(
                    (member) => member.assignedProject === project.projectId
                );

                setMembers(fetchedData);
                //console.log("filterdsnd", fetchedData)

                //console.log("Filtered team members for project:", filteredMembers);

            } catch (error) {
                console.error("Error fetching invite data:", error);
            }
        };

        fetchCourseMembers();
    }, [courseIdForTeamScreen]);


    const filteredDataCourse = members.filter((member) => {
        const matchSearch =
            member.name?.toLowerCase().includes(search.toLowerCase()) ||
            member.email?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === 'All' || member.status === statusFilter;

        return matchSearch && matchStatus;
    });

    // console.log("courseid", courseIdForTeamScreen);
    const handleDeleteCourseMembers = async (userInviteId: string) => {
        try {
            const payload = {
                project_id: project.projectId,
                course_id: courseIdForTeamScreen
            };

            const response = await axiosInstance.patch(
                `/invite/delete/${userInviteId}`,
                payload
            );
            console.log("userInviteId", userInviteId);
            if (response.status === 200) {
                setMembers(prev => prev.filter(member => member.userInviteId !== userInviteId));
            }
        } catch (error) {
            console.error("Failed to delete member:", error);
        }
    };



    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }
    const sortedCourses = [...courseList].sort((a, b) => {
        if (selectedSort.value === 'AToZ') {
            return a.title.localeCompare(b.title); // A-Z
        } else if (selectedSort.value === 'ZToA') {
            return b.title.localeCompare(a.title); // Z-A
        } else if (selectedSort.value === 'Newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
        } else if (selectedSort.value === 'Oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Oldest first
        }
        return 0;
    });


    const filteredCourses = sortedCourses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCourse = async () => {
        setShowAddCourse(true);
    }

    const fetchCouseList = async (page: number, limit: number, projectId: string | null) => {
        if (projectId === null) return;
        try {
            const response: any = await axiosInstance.get(`/course/?page=${page}&limit=${limit}&projectId=${projectId}`);

            if (response.status === 200 && response.data.message === "Success") {
                setCourseList(response.data.data.details);
            } else {
                setCourseList([]);
            }

            //console.log(response.data.message);


        } catch (error) {
            console.log(error);
        }
    }

    const fetchCourseListSort = async (page: number, limit: number, projectId: string | null, sortOrder: string) => {
        setCourseList([]);
        if (projectId === null) return;
        try {
            const response: any = await axiosInstance.get(`/course/?page=${page}&limit=${limit}&projectId=${projectId}&sort=${sortOrder}`);

            if (response.status === 200 && response.data.message === "Success") {
                setCourseList(response.data.data.details);
            }

        } catch (error) {
            console.log(error);
        }
    }




    const handleEdit = () => {
        navigate('/course-creation');
    };

    useEffect(() => {
        //console.log(_activeTab);
        if (_activeTab) {
            setActiveTab(_activeTab);
        } else {
            setActiveTab('tab-1');
        }

    }, [_activeTab]);


    useEffect(() => {
        dispatch(setTitle('Projects'));
        dispatch(setBreadCrumb(['Projects', project.title, 'Create course']));
    }, [])


    const handleUpdatedCard = () => {
        fetchCouseList(1, 10, project.projectId);
        console.log("object")
    }


    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditCourse) {
            try {
                try {
                    const payload = {
                        "projectId": project.projectId,
                        "title": courseName,
                        "description": description,
                        "code": courseCode,
                        "thumbnailUrl": thumbnailUrl ? [{ url: thumbnailUrl }] : [], // Ensure empty array if not uploaded
                    };
                    const response = await axiosInstance.put(`/course/update/${editCourseId}`, payload, {
                        headers: {
                            'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.status === 200) {
                        //console.log(response);
                        setShowAddCourse(false);
                        handleUpdatedCard();

                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const payload = {
                    "projectId": project.projectId,
                    "title": courseName,
                    "description": description,
                    "code": courseCode,
                    "thumbnailUrl": thumbnailUrl ? [{ url: thumbnailUrl }] : [], // Ensure empty array if not uploaded
                };
                const response = await axiosInstance.post('/course/creation', payload, {
                    headers: {
                        'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                    },
                });

                if (response.status === 200) {
                    //console.log(response);
                    dispatch(setCourseId(response.data.data.courseId));
                    setShowAddCourse(false);
                    handleUpdatedCard();

                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    const handleDropdownMenu = (action: string, cardId: number) => {
        if (action === 'edit') {
            setEditCourse(true);
            setEditCouseId(filteredCourses[cardId].courseId);
            setCourseName(filteredCourses[cardId].title);
            setCourseCode(filteredCourses[cardId].code);
            setDescription(filteredCourses[cardId].description);
            setShowAddCourse(true);
        }
        else if (action === 'assign_team_member') {
            setCourseIdForTeamScreen(filteredCourses[cardId].courseId);
            setActiveCourseTab('tab-1');
            setShowCourseTeamScreen(true);
        }
    }



    const handlesort = (sort: any) => {
        console.log(sort)
        if (sort.value === "Newest") {
            fetchCourseListSort(1, 10, project.projectId, "desc");
        } else if (sort.value === "Oldest") {
            fetchCourseListSort(1, 10, project.projectId, "asc");
        } else if (sort.value === "AToZ") {
            fetchCourseListSort(1, 10, project.projectId, "az");
        } else if (sort.value === "ZToA") {
            fetchCourseListSort(1, 10, project.projectId, "za");
        }
    }

    const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCourseName(e.target.value);
    };

    const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCourseCode(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const isFormValid =
        courseName !== '' &&
        description !== '' &&
        courseCode !== '' &&
        isDisabled === false
    // thumbnailUrl !== '';

    const getWorkflow = async () => {
        try {
            const response: any = await axiosInstance.get('/workflow');

            if (response.status === 200) {
                console.log("workflows data", response.data);
                setWorkflowData(response.data.data);
            }



        } catch (error) {
            console.log('Error fetching workflows:', error);
        }
    }

    const [workflowId, setWorkflowId] = useState<string>('');

    const [sendCourseCardItem, setSendCourseCardItem] = useState<any>({});

    const courseWorkflowStatusUpdate = async (courseId: string, status: string) => {
        //navigate('/course-creation/CourseContentProgress')
        try {
            const response = await axiosInstance.patch(`/course/workflowStatusUpdate/${courseId}`, {
                "projectId": project.projectId,
                "status": status//"next"
            });

            if (response.status === 200) {
                console.log(response.data.data);
                //navigator()
                setShowSendModal(!showSendModal);
                navigate('/course-creation/CourseContentProgress')
            }
        } catch (error) {
            console.log(error);
            setShowSendModal(!showSendModal);
        }
    }


    useEffect(() => {
        setWorkflowId(project.workflowId)
        dispatch(setBreadCrumb(['Project', project.title]));
        fetchCouseList(1, 10, project.projectId);
        getWorkflow();
    }, [project]);


    // const { value: isNewLayoutEnabled } = useFeatureGate("coursebuilder");
    // console.log("Feature Gate Status:", isNewLayoutEnabled);

    return (
        <>
            <div className="border rounded-2xl shadow-lg p-5 bg-white mt-2">
                <h2 className="text-2xl font-bold mb-8">{project.title}</h2>
                {!showCourseTeamScreen &&
                    <>
                        {!showAddCourse && <div className="border rounded-2xl shadow-lg bg-white">

                            <div className="mb-2">
                                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                                    <li className="me-2">
                                        <button
                                            onClick={() => setActiveTab('tab-1')}
                                            className={`inline-block p-4 text-base border-b-2 rounded-t-lg ${activeTab === 'tab-1'
                                                ? 'text-[#4318FF] border-[#4318FF] font-bold'
                                                : 'hover:text-gray-600 hover:border-gray-300 border-transparent font-medium'
                                                }`}
                                        >
                                            Course ({courseList.length})
                                        </button>
                                    </li>
                                    <li className="me-2">
                                        <button
                                            onClick={() => setActiveTab('tab-2')}
                                            className={`inline-block p-4 border-b-2 text-base rounded-t-lg ${activeTab === 'tab-2'
                                                ? 'text-[#4318FF] border-[#4318FF] font-bold'
                                                : 'hover:text-gray-600 hover:border-gray-300 border-transparent font-medium'
                                                }`}
                                        >
                                            Team members ({filteredData.length})
                                        </button>
                                    </li>
                                    {permissions.ApplyWFtoProject && <li className="me-2">
                                        <button
                                            onClick={() => setActiveTab('tab-3')}
                                            className={`inline-block p-4 border-b-2 text-base rounded-t-lg ${activeTab === 'tab-3'
                                                ? 'text-[#4318FF] border-[#4318FF] font-bold'
                                                : 'hover:text-gray-600 hover:border-gray-300 border-transparent font-medium'
                                                }`}
                                        >
                                            Workflow
                                        </button>
                                    </li>}
                                </ul>
                            </div>

                            <div>
                                <div
                                    className={`${activeTab === 'tab-1' ? 'block' : 'hidden'
                                        } p-4 rounded-lg`}
                                >
                                    <div className="flex w-full justify-between items-center mb-6">
                                        {/* <div className="w-[367px]">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e)}
                                        className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1"
                                    />

                                    <img className="absolute right-3 top-3 text-gray-400 w-4 h-4" src={Icons.p_search_icon} alt="p_search_icon.svg" />
                                </div>
                            </div> */}
                                        <SearchCard onSearchQuery={(searchQuery) => setSearchQuery(searchQuery)} onSortBy={(sort) => handlesort(sort)} />


                                        <div>
                                            {permissions.CreateeditCourseAttributesNamedescriptionimage && <button
                                                type="button"
                                                onClick={handleAddCourse}
                                                className="text-white inline-flex items-center gap-2 bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] 
               hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none 
               focus:ring-blue-300 font-medium rounded-full text-base px-6 py-2.5 whitespace-nowrap min-w-fit"
                                            >
                                                <img src={Icons.plus_white} alt="Add Course" />
                                                <span>Add course</span>
                                            </button>}

                                        </div>
                                    </div>


                                    {courseList.length > 0
                                        ?
                                        <div className="flex flex-wrap gap-4 min-h-[calc(100vh-24rem)]">
                                            <CourseCardList
                                                courseCards={filteredCourses}
                                                projectName={project.title}
                                                onUpdatedCard={handleUpdatedCard}
                                                onUpdateSelected={(action: string, cardId: number) => handleDropdownMenu(action, cardId)}
                                                onSendCard={(sendCourseCard: any) => {
                                                    setShowSendModal(true);
                                                    setSendCourseCardItem(sendCourseCard)
                                                }}
                                            />
                                        </div>
                                        :
                                        <div className="flex justify-center items-center min-h-[calc(100vh-22rem)]">
                                            <div className="text-center">
                                                <img className="m-auto w-[65%]" src={Images.kickstart_course} alt="kickstart_course.svg" />
                                                <h3 className="text-2xl font-bold mb-2">Kickstart your first course!</h3>
                                                <p className="text-[#40444D] text-base mb-5">Get started by creating your first course. define units, topics, and <br /> lessons to build a structured learning path for your learners.</p>
                                            </div>
                                        </div>
                                    }


                                </div>
                                <div
                                    className={`${activeTab === 'tab-2' ? 'block' : 'hidden'
                                        } p-4 rounded-lg bg-white`}
                                >
                                    <div className="p-6">

                                        <div className="bg-white">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                                <div className="relative w-full sm:w-[60%] md:w-[40%] lg:w-[29%]">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2 text-sm focus:outline-none"
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                                        <img src={search_icon} alt="search" className="w-4 h-4" />
                                                    </span>
                                                </div>



                                                <div className="flex w-full md:w-auto md:ml-auto gap-3">
                                                    <button
                                                        onClick={handleInvite}
                                                        className="mt-5 w-[148px] h-[40px] text-[14px] text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] font-medium rounded-full flex items-center justify-center gap-2"
                                                        style={{ width: "200px", height: "44px", marginTop: "-1%" }}
                                                    >
                                                        <img src={plus_white} alt="add" className="w-[9px] h-[9px]" />
                                                        <span className="text-white text-[14px] font-medium leading-[100%] tracking-[-0.28px] font-['DM Sans']">
                                                            Invite team member
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm table-fixed">
                                                    <thead>
                                                        <tr className="text-left text-[#1D1F23] font-medium text-[14px]">
                                                            <th className="px-3 py-2 w-[20%]">Name</th>
                                                            <th className="px-3 py-2 w-[18%]">Role</th>
                                                            <th className="px-3 py-2 w-[18%]">Course</th>
                                                            <th className="px-3 py-2 w-[16%]">Status</th>
                                                            <th className="px-3 py-2 w-[10%] ">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredData.map((member, index) => {
                                                            const initials = member.name
                                                                .split(' ')
                                                                .slice(0, 2)
                                                                .map((word: string) => word[0].toUpperCase())
                                                                .join('');

                                                            return (
                                                                <tr key={index} className="text-[#40444D] text-[14px]">
                                                                    <td className="px-3 py-3 flex items-center gap-3">
                                                                        <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold">
                                                                            {initials}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-[#1D1F23]">{member.name}</div>
                                                                            {/* <div className="text-xs text-gray-500">{member.email}</div> */}
                                                                        </div>
                                                                    </td>
                                                                    {/* <td className="px-3 py-3">{member.roleName}</td> */}
                                                                    <td className="px-3 py-3">
                                                                        {member.roleName
                                                                            ? member.roleName.charAt(0).toUpperCase() + member.roleName.slice(1)
                                                                            : '-'}
                                                                    </td>

                                                                    <td className="px-3 py-3">{member.courseName || '-'}</td>
                                                                    {/* <td className="px-3 py-3 ">{member.status || 'Invited'}</td> */}
                                                                    <td className="px-3 py-3 ">
                                                                        {member.isActive === false ? 'Invited' : 'Active'}
                                                                    </td>
                                                                    <td className="px-3 py-3 ">
                                                                        <div className="flex items-center gap-2">
                                                                            {/* <button title="Delete">
                                                                            <img src={Icons.user_delete_icon} alt="delete" />
                                                                        </button> */}
                                                                            <button title="Delete" onClick={() => handleDeleteProjectMembers(member.userInviteId)}>
                                                                                <img src={Icons.user_delete_icon} alt="delete" />
                                                                            </button>


                                                                            <button title="Edit">
                                                                                {/* <img src={edit_icon} alt="edit" /> */}
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    {/* <tbody>
                                            {filteredData.length > 0 ? (
                                                filteredData.map((member, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 text-[14px] text-[#40444D] border-b">
                                                        <td className="px-3 py-2">{member.name}</td>
                                                        <td className="px-3 py-2">{member.email}</td>
                                                        <td className="px-3 py-2">{member.roles.join(', ')}</td>
                                                        <td className="px-3 py-2 text-center">Invited</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <button title="Delete"><img src={Icons.user_delete_icon} alt="delete" /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-3 py-2 text-center" colSpan={5}>No members found.</td>
                                                </tr>
                                            )}
                                        </tbody> */}


                                                </table>
                                            </div>


                                        </div>

                                    </div>


                                </div>
                                <div
                                    className={`${activeTab === 'tab-3' ? 'block' : 'hidden'
                                        } p-4 rounded-lg bg-gray-50`}
                                >
                                    <div className="relative w-full sm:w-[60%] md:w-[40%] lg:w-[29%]">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2 text-sm focus:outline-none"
                                            value={search}
                                        //onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                            <img src={search_icon} alt="search" className="w-4 h-4" />
                                        </span>
                                    </div>
                                    <div className="flex w-full gap-4">
                                        <div className="w-[60%] text-sm font-normal">

                                            <div className="grid grid-cols-3 mt-5 px-8 py-2 font-bold text-[#1F1F1F] text-left">
                                                <p style={{ marginLeft: "-10%" }}>Workflow name</p>
                                                <p style={{ marginLeft: "35%" }}>Courses</p>
                                                <p style={{ marginLeft: "45%" }}>Created by</p>
                                            </div>

                                            {/* <div className="flex justify-between bg-[#F2F4FF] p-4">
                                            <div className="inline-flex gap-4">
                                                <div>ARP</div>
                                                <div><span className="bg-white p-1">Default</span></div>
                                            </div>
                                            <div>-</div>
                                            <div>
                                                <p>System</p>
                                                <p>May 7, 2025 | 03:45 PM</p>
                                            </div>
                                        </div> */}
                                            {workflowData
                                                ?.filter((item) => item.id === project.workflowId)
                                                .map((item, index) => (
                                                    <div key={index} className="flex justify-between bg-[#F2F4FF] p-4 mb-2 rounded">
                                                        <div className="inline-flex gap-4">
                                                            <div>{item.title}</div>
                                                            {item.isDefault && (
                                                                <div><span className="bg-white px-2 py-1 rounded">Default</span></div>
                                                            )}
                                                        </div>
                                                        <div>-</div>
                                                        <div>
                                                            <p>{item.createdAt ? item.createdAt.slice(0, 16).replace('T', ' T ') : 'System'}</p>

                                                        </div>
                                                    </div>
                                                ))}

                                        </div>
                                        <div className="w-[40%] mt-7">
                                            <p className=' text-sm font-semibold'>Preview workflow</p>
                                            <div id="workflowViewer" className='mt-3'>
                                                <WorkflowViewer
                                                    workflow_id={project.workflowId}
                                                    token={token}
                                                    enviroment="dev"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>


                        </div>
                        }
                        {showAddCourse &&
                            <div>
                                <p className="mt-2 mb-4 text-base font-bold"><a className="cursor-pointer" onClick={() => setShowAddCourse(false)}><img className="inline me-2" src={Icons.back_arrow_icon} alt="right_arrow.svg" /> Add course</a></p>
                                <form onSubmit={handleAdd}>

                                    <div className="shadow-[0px_0px_15px_1px_rgba(0,_0,_0,_0.1)] p-5 bg-white overflow-y-auto max-h-[90%] custom-scrollbar rounded-xl">
                                        <div className="grid gap-8 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="course_name" className="block mb-2 text-sm font-bold text-gray-900">Course name <span className="text-red-700">*</span></label>
                                                <input

                                                    type="text"
                                                    id="course_name"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    placeholder="Enter course name"
                                                    value={courseName}
                                                    onChange={handleCourseNameChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="description" className="block mb-2 text-sm font-bold text-gray-900">Course code <span className="text-red-700">*</span></label>
                                                <input
                                                    type="text"
                                                    id="description"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    placeholder="Enter course code"
                                                    value={courseCode}
                                                    onChange={handleCourseCodeChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <label htmlFor="learners" className="block mb-2 text-sm font-bold text-gray-900">
                                                Description <span className="text-[#F6292D]">*</span>
                                            </label>
                                            <textarea
                                                id="learners"
                                                rows={6}
                                                className="block resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 scrollbar"
                                                placeholder="Enter description"
                                                value={description}
                                                onChange={handleDescriptionChange}
                                                required
                                            />
                                        </div>

                                        <FileUploadButton onResponse={(url: string) => setthumbnailUrl(url)} courseName={courseName} description={description} onValid={(flag: boolean) => setIsDisabled(flag)} />


                                    </div>

                                    {!isEditCourse && <button
                                        type="submit"
                                        className={`mt-5 font-medium rounded-full text-sm px-10 py-2.5 text-center ${!isFormValid
                                            ? 'bg-[#D0D5DD] text-[#7A7F89] cursor-not-allowed font-bold'
                                            : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300'
                                            }`}
                                        disabled={!isFormValid}
                                    >
                                        Add
                                    </button>}
                                    {isEditCourse && <button
                                        type="submit"
                                        className={`mt-5 font-medium rounded-full text-sm px-10 py-2.5 text-center ${!isFormValid
                                            ? 'bg-[#D0D5DD] text-[#7A7F89] cursor-not-allowed font-bold'
                                            : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300'
                                            }`}
                                        disabled={!isFormValid}
                                    >
                                        Save
                                    </button>}
                                </form>
                            </div>
                        }
                    </>}
            </div>

            <SendModal isOpen={showSendModal} CourseCard={sendCourseCardItem} onClose={() => setShowSendModal(!showSendModal)} onConfirm={() => { courseWorkflowStatusUpdate(sendCourseCardItem.courseId, 'next') }} />
        </>
    )
}

interface ICourseCard {
    courseCards: any[];
    projectName: string;
    onUpdatedCard: () => void;
    onUpdateSelected: (action: string, cardId: number) => void;
    onSendCard: (courseCard: any) => void;
}

const CourseCardList: React.FC<ICourseCard> = ({ courseCards, projectName, onUpdatedCard, onUpdateSelected, onSendCard }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const permissions = useSelector((state: RootState) => state.login.permissions);
    const userId = useSelector((state: RootState) => state.login.userId);

    const [modulesSelectedItem, setModulesSelectedItem] = useState<any[]>([]);
    const username = useSelector((state: RootState) => state.login.username);

    const fetchCourseDetails = async (courseId: string | undefined) => {
        try {
            const response: any = await axiosInstance.get(`/course/${courseId}`);

            if (response.status === 200 && response.data.message === "Success") {
                //console.log(response.data.data.modules);
                const ListData: any[] = response.data.data.modules.reduce((obj: any, v: any) => {
                    obj.push({
                        title: v.moduleDetails.name.replace(/<\/?[^>]+(>|$)/g, ""),
                        content: '',
                        moduleId: v.moduleId
                    });
                    return obj;
                }, []);

                //setModulesSelectedItem(ListData);
                return ListData;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleView = async (course: any) => {

        //const ListData: any = await fetchCourseDetails(course.courseId);

        clearGenerateOutlineParams();

        dispatch(setCourseId(course.courseId));

        dispatch(setCourseNameSlice(course.title));

        dispatch(setCourseCode(course.code));

        //dispatch(setModulesItems(ListData));

        //navigate('/course-creation/UMGC/Editor');
    }

    const handleDelete = async (course: any) => {
        try {
            const response = await axiosInstance.delete(`course/delete/${course.courseId}`,
                {
                    headers: {
                        'userId': '88796200-3f4c-4616-b0fc-34cb62222123456'
                    }
                }
            );

            if (response.status === 200) {
                onUpdatedCard();
            }
        } catch (error) {
            console.log(error);
        }

    }

    const getCourseDetailsbyId = async (course: any): Promise<any | undefined> => {
        try {
            const response = await axiosInstance.get(`/course/${course.courseId}`);

            if (response.status === 200) {
                //console.log(response.data);
                return response.data.data;
                //setUnit(response.data.data.modules.map((module: any, index: number) => { return { id: index, label: module.moduleDetails.name, moduleId: module.moduleDetails.moduleId } }));
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSelected = (action: string, cardId: number) => {

        if (action === 'delete') {
            handleDelete(courseCards[cardId]);
        }
        else if (action === 'assign_team_member') {
            onUpdateSelected(action, cardId)
        }
        else {
            onUpdateSelected(action, cardId);
        }

    }

    const handleCreate = async (courseCard: any) => {
        handleView(courseCard);
        if (permissions.type === 'admin' || permissions.type === 'projectManager') {
            if (courseCard.workflowId) {
                navigate('/course-creation/CourseContentProgress');
                return;
            }

            //return;
        }

        if (permissions.type === "publisher") {
            navigate('/course-creation/CourseContentProgress');
            return;
        }
        const response = await getCourseDetailsbyId(courseCard);


        //const workflowStateId = response.workflowStateId;
        const currectWorkflowStateId = response.workflows.some((o:any) => o.wStateId === response.workflowStateId && o.userInviteId === userId);

        if(!currectWorkflowStateId && (('workflowId' in response && response.workflowId === 0) && response.workflows.length > 0)){
            navigate('/course-creation/CourseContentProgress');
            return;
        }

        dispatch(setCourseId(courseCard.courseId));

        if (response) {
            switch (response.step) {
                case "step_1":
                    navigate('/course-creation/UMGC/Step-1');
                    break;
                case "step_2":
                    navigate('/course-creation/UMGC/Step-2');
                    break;
                case "step_3":
                    navigate('/course-creation/Editor');
                    break;
                case "step_4":
                case "step_5":
                case "step_6":
                    navigate('/course-creation/Editor');
                    break;
                default:
                    navigate('/course-creation/CourseSelection');
                    break;
            }
        }
    }

    return (
        courseCards.map((courseCard, index) => (
            <div
                key={index}
                className="bg-white rounded-lg shadow-[0px_0px_24px_0px_#00000014] mt-5 mb-4 h-full p-4 max-w-sm w-[318px] cursor-pointer hover:shadow-lg transition"
                onClick={() => { handleCreate(courseCard); }}
            >
                <div className="mb-4">
                    <div className="mb-3 flex justify-between">
                        <span className="text-base font-bold">{courseCard.title}</span>

                        {/* Prevent card click when clicking dropdown */}
                        <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                                courseCard={courseCard}
                                onSend={(currentCourseCard) => { handleView(currentCourseCard); onSendCard(currentCourseCard) }}
                                onDelete={(currentCourseCard: any) => handleDelete(currentCourseCard)}
                            />
                        </div>
                    </div>

                    <div className="w-[286px] h-[128px] rounded-lg border border-gray-300 overflow-hidden">
                        <img
                            src={courseCard.thumbnailUrl?.at(0)?.url || Images.placeholder}
                            alt="Describe the image here"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex w-full flex-col justify-between h-[12rem]">
                    <div className="mb-auto">
                        <p title={courseCard.description} className="text-[#1D1F23] text-sm mb-3 line-clamp-2">
                            {courseCard.description}
                        </p>
                    </div>

                    <div className="mt-auto">
                        <div className="text-[#40444D] text-sm mb-2">
                            Course code: <span className="text-[#1D1F23]">{courseCard.code}</span>
                        </div>

                        <div className="flex items-center mb-4">
                            <img className="h-8 w-8 rounded-full mr-2" src={Images.user_img} alt="Profile image" />
                            <div className="text-[#40444D] text-xs">
                                <span className="mb-1 block text-[12px]">Created by:</span>
                                <span className="font-bold text-[#1D1F23] text-normal">{username}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                className="text-white w-[112px] h-[32px] bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm text-center flex items-center justify-center me-2"
                            // No onClick here - Card itself handles it
                            >
                                View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ))
    )
}

interface IFileUploadButton {
    onResponse: (url: string) => void;
    courseName: string;
    description: string;
    onValid: (flag: boolean) => void;
}
const FileUploadButton: React.FC<IFileUploadButton> = ({ onResponse, courseName, description, onValid }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number>(0);
    const [preview, setPreview] = useState<string | null>(null);
    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [isGenerate, setIsGenerate] = useState<boolean>(false);

    const simulateProgress = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            let progress = 0;

            const updateProgress = () => {
                progress += 1;

                //console.log(`${progress}%`);
                setProgress(progress);

                if (progress < 100) {
                    setTimeout(updateProgress, 100);
                } else {
                    resolve();
                }
            };

            updateProgress();
        });
    }


    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);

            setShowProgress(true);

            const data = new FormData();
            data.append('file', file);

            try {
                setProgress(90);

                const response: any = await axiosInstance.post('/media/image', data, {
                    headers: {
                        userId: '88796200-3f4c-4616-b0fc-34cb62222123456',
                    },
                    //...( { maxBodyLength: Infinity } as any), 
                });

                if (response.status === 200) {
                    setProgress(100);
                    setPreview(previewUrl);
                    onResponse(response.data.data.url);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const handleGenerateImage = async () => {
        if (!courseName.trim() || !description.trim()) {
            return;
        }
        setIsGenerate(true)
        onValid(true)
        setShowProgress(true);

        try {
            setProgress(60);
            let data = {
                title: courseName,
                description
            }
            setTimeout(() => setProgress(60), 6000);
            const response: any = await axiosInstance.post('/docs/generateImage', data, {});

            if (response.status === 200) {
                setProgress(100);
                setPreview(response.data.data.url);
                onResponse(response.data.data.url);
                onValid(false)
            }
        } catch (error) {
            onValid(false)
            console.error('Error uploading image:', error);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('File uploaded:', file.name);
            // You can handle the file upload here
        }
    };

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div className="mt-6">
            <label htmlFor="file-upload" className="block mb-2 font-bold text-sm">
                Upload thumbnail
            </label>
            <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                accept=".png, .jpg"
                style={{ display: 'none' }}
                onChange={handleImageChange}
            />
            <div className="flex items-center">
                <button
                    type="button"
                    className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-[#4318FF] focus:outline-none bg-white rounded-full border border-[#4318FF] hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                    onClick={handleButtonClick}
                >
                    <span className="text-[#4318FF] font-bold">+ Upload</span>
                </button>
                <div>
                    <span className="text-xs text-[#40444D]">Accepted formats: JPG, PNG.</span>
                    <span className="mx-2 font-bold text-sm">Or</span>
                    <button type={courseName && description ? "button" : undefined} onClick={handleGenerateImage}>
                        <img className="inline-block me-2 w-[24px] align-top" src={Images.magic_wand_auto_fix_button} alt="gen_ai_icon.svg" />
                        <span className='text-[#4318FF]'> Generate with AI</span>
                    </button>

                </div>
            </div>
            {showProgress && <div className="rounded-[16px] border border-gray-300 w-[502px] p-4  mt-3">
                {!preview && (<>
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-bold leading-6">{isGenerate ? 'Generating...' : 'Uploading...'}<br /> <span className="font-normal text-[#40444D]">{progress}%  • 30 seconds remaining</span></p>
                        <div className="w-[15%]">
                            <a className="inline-block me-2 cursor-pointer"><img src={Icons.pause_icon} alt="pause_icon.svg" /></a>
                            <a className="inline-block cursor-pointer"><img src={Icons.stop_icon} alt="stop_icon.svg" /></a>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-[#4318FF] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </>)}
                {preview && (
                    <div className="flex flex-row justify-between items-center">
                        <div className="w-16 h-16 shrink-0">
                            <img
                                src={preview}
                                alt="Thumbnail"
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                        <a className="inline-block me-2 cursor-pointer"><img src={Icons.highlight_off_icon} alt="pause_icon.svg" /></a>
                    </div>
                )}
            </div>}
        </div >
    );
};
interface SortOption {
    label: string;
    value: string;
}


interface ISearchCard {
    onSearchQuery: (text: string) => void;
    onSortBy: (sort: string) => void;
}

const SearchCard: React.FC<ISearchCard> = ({ onSearchQuery, onSortBy }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState('');
    const [courseList, setCourseList] = useState<any[]>([])

    const [isOpen, setIsOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState<SortOption>({
        label: 'Newest',
        value: 'Newest'
    });

    const sortOptions: SortOption[] = [
        { label: 'A-Z', value: 'AToZ' },
        { label: 'Z-A', value: 'ZToA' },
        { label: 'Newest', value: 'Newest' },
        { label: 'Oldest', value: 'Oldest' }
    ];



    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearchQuery(e.target.value);
    }



    const handleSort = (option: any) => {
        setSelectedSort(option);
        setIsOpen(false);
        onSortBy(option);


    }



    return (
        <div className="flex gap-4 items-center w-full">
            <div className="relative    ">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e)}
                    className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1"
                />
                <img className="absolute right-3 top-3 text-gray-400 w-4 h-4" src={Icons.p_search_icon} alt="search icon" />
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex text-sm items-center gap-4 w-full px-4 py-2.5 justify-between bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <div>
                        <span className="text-[#8D95A4]">Sort by</span>
                        <span className="font-medium ms-4">{selectedSort.label}</span>
                    </div>
                    <img className="w-3 h-3 text-gray-500" src={Icons.down_arrow} alt="dropdown arrow" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSort(option)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

    );
};

interface DropdownProps {
    courseCard: any;
    onSend: (courseCard: any) => void;
    onDelete: (action: any) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ courseCard, onSend, onDelete }) => {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [showStart, setStart] = useState<boolean>();
    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleMenuItemClick = (action: string) => {
        switch (action) {
            case "assign_team_member":
                navigate('/course-creation/CourseSettings', { state: { _activeTab: 'tab-3', courseCard: courseCard } });
                break;
            case "add_team_member":
                navigate('/course-creation/CourseTeamMembers', { state: { courseId: courseCard.courseId } });
                break;
            case "add_workflow":
                navigate('/course-creation/CourseSettings', { state: { _activeTab: 'tab-2', courseCard: courseCard } });
                break;
            case "edit":
                navigate('/course-creation/CourseSettings', { state: { _activeTab: 'tab-1', courseCard: courseCard } });
                break;
            case "settings":
                navigate('/course-creation/CourseSettings', { state: { _activeTab: 'tab-1', courseCard: courseCard } });
                break;
            case 'start':
                onSend(courseCard);
                break;
            case 'delete':
                onDelete(courseCard);
                break;
        }
        setIsOpen(false);

    };

    useEffect(() => {
        console.log(courseCard);
    }, [courseCard])


    return (
        <div className="relative inline-block text-left delete-btn" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="inline-flex group items-center px-3 py-2 text-sm font-medium text-center text-white bg-white opacity-75 hover:bg-[#4318FF] hover:opacity-100 rounded-full border-none"
                type="button"
            >
                <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.99563 12C1.58188 12 1.22917 11.8527 0.9375 11.5581C0.645833 11.2635 0.5 10.9094 0.5 10.4956C0.5 10.0819 0.647291 9.72917 0.941875 9.4375C1.23646 9.14583 1.59062 9 2.00437 9C2.41812 9 2.77083 9.14729 3.0625 9.44188C3.35417 9.73646 3.5 10.0906 3.5 10.5044C3.5 10.9181 3.35271 11.2708 3.05812 11.5625C2.76354 11.8542 2.40938 12 1.99563 12ZM1.99563 7.5C1.58188 7.5 1.22917 7.35271 0.9375 7.05813C0.645833 6.76354 0.5 6.40938 0.5 5.99563C0.5 5.58188 0.647291 5.22917 0.941875 4.9375C1.23646 4.64583 1.59062 4.5 2.00437 4.5C2.41812 4.5 2.77083 4.64729 3.0625 4.94188C3.35417 5.23646 3.5 5.59062 3.5 6.00437C3.5 6.41813 3.35271 6.77083 3.05812 7.0625C2.76354 7.35417 2.40938 7.5 1.99563 7.5ZM1.99563 3C1.58188 3 1.22917 2.85271 0.9375 2.55812C0.645833 2.26354 0.5 1.90937 0.5 1.49562C0.5 1.08187 0.647291 0.729167 0.941875 0.4375C1.23646 0.145833 1.59062 0 2.00437 0C2.41812 0 2.77083 0.147292 3.0625 0.441875C3.35417 0.736459 3.5 1.09063 3.5 1.50438C3.5 1.91813 3.35271 2.27083 3.05812 2.5625C2.76354 2.85417 2.40938 3 1.99563 3Z" fill="#4318FF" className="group-hover:fill-white" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-1 bg-white border-[#E0E5F2] divide-y divide-gray-100 rounded-xl shadow-[0px_48px_100px_0px_#110C2E26] w-44"
                >
                    <div className="text-sm text-[#2B3674]">
                        <div>
                            {courseCard.workflowId && !('step' in courseCard) && courseCard?.workflows.length > 0 && <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('start');
                                }}
                            >
                                Start
                            </a>}

                            {permissions.ApplyWFtoProject && <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('add_team_member');
                                }}
                            >
                                Add team member
                            </a>
}

                            {courseCard.workflowStateId === null && permissions.ApplyWFtoProject &&
                                <>
                                    <a
                                        href="#"
                                        className="block text-sm px-4 py-3 hover:bg-gray-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMenuItemClick('assign_team_member');
                                        }}
                                    >
                                        Assign team member



                                    </a>
                                    <a
                                        href="#"
                                        className="block text-sm px-4 py-3 hover:bg-gray-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMenuItemClick('add_workflow');
                                        }}
                                    >
                                        Add workflow


                                    </a>
                                </>
                            }

                            {permissions.CreateCoursecontent && <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('edit');
                                }}
                            >
                                Edit
                            </a>}
                            <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('settings');
                                }}
                            >
                                Settings
                            </a>
                            {/* <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('duplicate');
                                }}
                            >
                                Duplicate
                            </a> */}
                            {permissions.DeleteCoursecontent && <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('delete');
                                }}
                            >
                                Delete
                            </a>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface ISendModal {
    isOpen: boolean;
    CourseCard: any;
    onClose: () => void;
    onConfirm: () => void;
}

const SendModal: React.FC<ISendModal> = ({ isOpen, CourseCard, onClose, onConfirm }) => {
    const [username, setUsername] = useState<string>("");

    const getCourseDetailsbyId = async (course: any): Promise<any | undefined> => {
        try {
            const response = await axiosInstance.get(`/course/${course.courseId}`);

            if (response.status === 200) {
                //console.log(response.data);
                return response.data.data;
                //setUnit(response.data.data.modules.map((module: any, index: number) => { return { id: index, label: module.moduleDetails.name, moduleId: module.moduleDetails.moduleId } }));
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        const init = async () => {
            const response = await getCourseDetailsbyId(CourseCard);

            if (response) {
                console.log(response);
                if (response.workflowStateId === null) {
                    setUsername(response.workflows[0].userInfo.name);
                }

            }
        }

        if (CourseCard) init();

    }, [CourseCard]);

    if (!isOpen) return null;

    return (
        <div
            id="popup-modal"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-[#000000] bg-opacity-50"
        >
            <div className="relative p-4 bg-white rounded-[30px] shadow text-center w-[30%]">
                <img className="mb-6 w-full" src={Images.send_modal} alt="loading" />
                <h4 className="text-2xl font-bold text-[#393B46] mb-4">
                    Are you sure you want to send the <br /> {CourseCard.title} <br /> course content to <br /> <span className="text-[#4318FF]">{username}</span>?
                </h4>
                <p className="text-[12px] mb-8" style={{ lineHeight: "20px" }}>
                    Once submitted, the course content will be locked for <br /> further edits until the review is complete.
                </p>

                <button
                    type="button"
                    className="font-bold rounded-full text-base px-10 py-2.5 text-center bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300 mr-2"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
                <p className="mt-4"><a className="text-[#4318FF] text-sm" onClick={onClose}>Cancel</a></p>
            </div>
        </div>
    );
};

export default CourseCardView;