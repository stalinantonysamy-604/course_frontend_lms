import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import * as Images from './../Images';
import * as Icons from './../Icons';
import { WorkflowViewer } from "dictera-workflow";
import axiosInstance from "../../Api/Axios";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import vector_icon from '../../Assets/Icons/vector_icon.svg';
import plus_icon from '../../Assets/Icons/plus_icon.svg';
import { ToastContainer, toast } from 'react-toastify';



const CourseSettings: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { _activeTab, courseCard } = location.state || {};

    const project: any = useSelector((state: RootState) => state.projectCreation.project);
    const token = useSelector((state: RootState) => state.login.token);

    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);


    const [showAddCourse, setShowAddCourse] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const [courseName, setCourseName] = useState<string>('');
    const [courseCode, setCourseCode] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const [thumbnailUrl, setthumbnailUrl] = useState<string>('');
    const [isEditCourse, setEditCourse] = useState<boolean>(false);
    const [editCourseId, setEditCouseId] = useState<string>('');

    const [activeTab, setActiveTab] = useState('');
    const [workflowStates, setWorkflowStates] = useState<any[]>([]);

    const [isInviteMoreMembersModal, setIsInviteMoreMembersModal] = useState<boolean>(false);
    const [saveWorkflowId, setsaveWorkflowId] = useState<number | undefined>(undefined);

    const [workflows, setWorkflows] = useState<string>("");
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [showCard, setShowCard] = useState(false);
    const [workflowData, setWorkflowData] = useState<any[]>([]);
    const [workflowTitle, setWorkflowTitle] = useState('');
    const [workflowTitleError, setWorkflowTitleError] = useState('');
    const [dropDowndiasble, setDropDowndiasble] = useState(false);
    const { projectCard } = location.state;

    const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCourseName(e.target.value);
    };

    const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCourseCode(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleInviteMoreMembers = () => {
        setIsInviteMoreMembersModal(!isInviteMoreMembersModal);
    }

    const isFormValid =
        courseName !== '' &&
        description !== '' &&
        courseCode !== '' &&
        isDisabled === false
    // thumbnailUrl !== '';

    const handleAddCourse = async () => {
        setShowAddCourse(true);
    }

    const [users, setUsers] = useState<any>({
        author: [],
        reviewer: [],
        publisher: []
    });

    const [savedUsers, setSavedUsers] = useState<any>({
        author: [],
        reviewer: [],
        publisher: []
    });

    const [selectedUsers, setSelectedUsers] = useState<any>({
        author: null,
        reviewer: [],
        publisher: null
    });

    const handleUserSelection = (role: string, user: IDropDownUser | any[] | null) => {
        setSelectedUsers((prev: any) => {
            const currentValue = prev[role];

            if (Array.isArray(currentValue) && Array.isArray(user)) {
                return {
                    ...prev,
                    [role]: [...currentValue, ...user]
                };
            }

            return {
                ...prev,
                [role]: user
            };
        });

    };

    const getAvailableUsers = (currentRole: string) => {
        try {
            if (users[currentRole]) {
                return users[currentRole].filter((user: any) => {
                    const selectedUserIds = Object.entries(selectedUsers)
                    //.filter(([role, selectedUser]) => role !== currentRole && selectedUser !== null)
                    //.map(([_, user]: any) => user?.id);
                    //return !selectedUserIds.includes(user.id);
                    return selectedUserIds;
                });
            }
        } catch (error) {
            console.log(users[currentRole]);
            console.log(error);
        }

    };


    const handleSaveWorkFlow = async () => {
        try {
            const response = await axiosInstance.put(`/project/update/${project.projectId}`,
                {
                    "title": project.title,
                    "description": project.description,
                    "workflowId": selectedWorkflowId
                }
            );

            if (response.status === 200) {
                console.log(response.data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const saveTeamMemeber = async () => {
        const payLoad = {
            "projectId": project.projectId,
            "workflowId": saveWorkflowId,
            "courseId": courseCard.courseId,
            "users": [
                {
                    userInviteId: selectedUsers.author.userInviteId,
                    wStateId: selectedUsers.author.wStateId,
                    roleId: selectedUsers.author.roleId
                },
                ...selectedUsers.reviewer.map((r: any) => ({ userInviteId: r.userInviteId, wStateId: r.wStateId, roleId: r.roleId })),
                { userInviteId: selectedUsers.publisher.userInviteId, wStateId: selectedUsers.publisher.wStateId, roleId: selectedUsers.publisher.roleId }
            ]
        }

        try {
            const response = await axiosInstance.post('/workflow/addUsers', payLoad);

            if (response.status === 200) {
                console.log(response.data.data);
                toast.success("Team members added successfully");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleAdd = async (e: React.FormEvent): Promise<boolean> => {
        e.preventDefault();
        try {
            const payload = {
                projectId: project.projectId,
                title: courseName,
                description,
                code: courseCode,
                thumbnailUrl: thumbnailUrl ? [{ url: thumbnailUrl }] : [],
            };

            const response = await axiosInstance.put(`/course/update/${courseCard.courseId}`, payload, {
                headers: {
                    userId: '88796200-3f4c-4616-b0fc-34cb62222123456',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setShowAddCourse(false);
                return true;
            }
        } catch (error) {
            console.log(error);
        }

        return false;
    };


    const handleSwitchTab = async (tabName: string) => {
        switch (tabName) {
            case 'project_details':
                setActiveTab('tab-1');
                break;
            case 'workflow':
                setActiveTab('tab-2');
                break;
            case 'team_members':
                setActiveTab('tab-3');
                // await getWorkflowStatesList(project.workflowId);
                break;
        }
    }


    const getInitials = (fullName: string): string => {
        const names = fullName.trim().split(/[\s_]+/);

        if (names.length === 1) {
            return names[0][0].toUpperCase();
        }

        return (names[0][0] + names[1][0]).toUpperCase();
    };


    const getWorkflowUserListing = async (projectId: string, roleId: string, roleType: string, wStateId: number) => {
        try {
            const response = await axiosInstance.get(`/workflow/users/${projectId}/${roleId}`);

            if (response.status === 200) {
                if (roleType === "author") {
                    const author = response.data.data.map((value: any) => ({ id: value.userInviteId, selected: false, initials: getInitials(value.name), roleId: roleId, wStateId: wStateId, ...value }));
                    setUsers((prevUsers: any) => ({
                        ...prevUsers,
                        author: author
                    }));
                }

                if (roleType === "reviewer") {
                    const reviewer = response.data.data.map((value: any) => ({ id: value.userInviteId, selected: false, initials: getInitials(value.name), roleId: roleId, wStateId: wStateId, ...value }));

                    setUsers((prevUsers: any) => ({
                        ...prevUsers,
                        reviewer: reviewer
                    }));
                }

                if (roleType === "publisher") {
                    const publisher = response.data.data.map((value: any) => ({ id: value.userInviteId, selected: false, initials: getInitials(value.name), roleId: roleId, wStateId: wStateId, ...value }));

                    setUsers((prevUsers: any) => ({
                        ...prevUsers,
                        publisher: publisher
                    }));

                }
                //console.log(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getWorkflowStatesList = async (workflowId: string) => {
        try {
            const response = await axiosInstance.get(`/workflow/${workflowId}`);
            if (response.status === 200) {
                // const workflowStates = response.data.data.workflowStates.sort((a: any, b: any) => {
                //     if (a.type === "author") return -1;
                //     if (b.type === "author") return 1;
                //     if (a.type === "publisher") return 1;
                //     if (b.type === "publisher") return -1;
                //     return 0;
                // });


                //const _workflowStates: any[] = response.data.data.workflowStates.filter((workflow: any) => workflow.type !== null && (workflow.nextId !== null && workflow.previousId !== null))

                const _workflowStates: any[] = response.data.data.workflowStates.filter((workflow: any) => workflow.type !== null);

                /* let _workflowStates = workflowStates.map((item: any) => ({
                    ...item,
                    roleName: item.type.replace(/ - .*$/, '')
                })); */
                const sorted = _workflowStates.sort((a, b) => a.indexId - b.indexId);
                setWorkflowStates(sorted);
                setsaveWorkflowId(response.data.data.id);

                for await (const workflowState of response.data.data.workflowStates) {
                    getWorkflowUserListing(project.projectId, workflowState.roleId, workflowState.type, workflowState.id);
                }

                getProjectWorkflowUserListing(response.data.data.workflowStates);


            }
        } catch (error) {
            console.log(error);
        }
    }

    const [reviewerList, setReviewerList] = useState<any[]>([]);

    const getProjectWorkflowUserListing = async (workflowStates: any[]) => {
        try {
            const response = await axiosInstance.get(`/workflow/project/users/${project.projectId}?courseId=${courseCard.courseId}`);

            if (response.status === 200) {

                const data = response.data.data.map((list: any) => {
                    list.userDetails.type = list.type;
                    list.userDetails.id = list.userInviteId;
                    list.userDetails.selected = false;
                    list.userDetails.initials = getInitials(list.userDetails.name);
                    list.userDetails.wStateId = list.wStateId;
                    list.userDetails.roleId = list.roleId;
                    return list;
                });


                const savedList: any[] = data;


                const author: any[] = [];
                const reviewer: any[] = [];
                const publisher: any[] = [];

                // Extract role IDs from workflowStates based on roleName
                /*  const roleMap = {
                     author: workflowStates.find(state => state.type === "author")?.roleId,
                     reviewer: workflowStates.find(state => state.type === "reviewer")?.roleId,
                     publisher: workflowStates.find(state => state.type === "publisher")?.roleId,
                 }; */



                // Categorize savedList entries based on matching roleId
                savedList.forEach(entry => {
                    const role = entry.userDetails.type;

                    if (role === "author") {
                        author.push(entry.userDetails);
                    } else if (role === "reviewer") {
                        reviewer.push(entry.userDetails);
                    } else if (role === "publisher") {
                        publisher.push(entry.userDetails);
                    }
                });

                handleUserSelection('author', author[0]);
                handleUserSelection('reviewer', reviewer);
                handleUserSelection('publisher', publisher[0]);
                setReviewerList(reviewer);
            }
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        setActiveTab(_activeTab);
        getWorkflowStatesList(project.workflowId);
        //fetchWorkflows();
        //console.log(courseCard.workflows.length > 0);
        //console.log(project);
    }, [_activeTab]);

    useEffect(() => {
        if (selectedWorkflowId) {
            console.log("selectedWorkflowId useeffect", selectedWorkflowId);
            getWorkflowStatesList(selectedWorkflowId);
        }
    }, [selectedWorkflowId]);

    useEffect(() => {
        if (courseCard.workflowStateId === null) {
            console.log("TEST");
            setDropDowndiasble(true);
        }
    }, [courseCard]);

    useEffect(() => {
        if (courseCard) {
            setCourseName(courseCard.title);
            setCourseCode(courseCard.code);
            setDescription(courseCard.description);
            if (courseCard.thumbnailUrl.length > 0)
                setthumbnailUrl(courseCard.thumbnailUrl.at(0).url);


        }
    }, [_activeTab]);

    // const handleNextClick = async () => {
    //     if (!workflowTitle.trim()) {
    //         setWorkflowTitleError('Workflow title is required');
    //         return;
    //     }

    //     try {
    //         const response = await axios.post(
    //             'https://dev_sapi.dictera.com/api/v1/product/workflow',
    //             {
    //                 title: workflowTitle,
    //                 data: ''
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             }
    //         );

    //         if (response.status === 200 || response.status === 201) {
    //             console.log('Workflow created:', response.data);

    //             const createdWorkflowId = response.data.workflowId;

    //             console.log("createdWorkflowId", createdWorkflowId);

    //             navigate('/project-creation/Workflow', {
    //                 state: { workflowId: createdWorkflowId, workflowTitle: workflowTitle },

    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error creating workflow:', error);
    //     }
    // };

    const getWorkflow = async () => {
        try {
            const response: any = await axiosInstance.get('/workflow');
            if (response.status === 200) {
                const workflowData = response.data.data;
                workflowData.unshift({
                    "id": 0,
                    "title": "No workflow",
                    "clientId": 0,
                    "u_uniqueId": "",
                    "productId": 0,
                    "data": "",
                    "status": "ACTIVE",
                    "isDeleted": 0,
                    "createdAt": "",
                    "updatedAt": ""
                });
                setWorkflowData(workflowData);
            }
        } catch (error) {
            console.log('Error fetching workflows:', error);
        }
    };

    useEffect(() => {
        getWorkflow();
    }, [project]);

    useEffect(() => {
        if (courseCard) {
            setCourseName(courseCard.title);
            setCourseCode(courseCard.code);
            setDescription(courseCard.description);
            if (courseCard.thumbnailUrl.length > 0)
                setthumbnailUrl(courseCard.thumbnailUrl.at(0).url);


        }
    }, [_activeTab]);

    const handleNextClick = async () => {
        if (!workflowTitle.trim()) {
            setWorkflowTitleError('Workflow title is required');
            return;
        }

        try {
            const response = await axios.post(
                'https://dev_sapi.dictera.com/api/v1/product/workflow',
                {
                    title: workflowTitle,
                    data: ''
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log('Workflow created:', response.data);

                const createdWorkflowId = response.data.workflowId;

                console.log("createdWorkflowId", createdWorkflowId);

                navigate('/project-creation/Workflow', {
                    state: { workflowId: createdWorkflowId, workflowTitle: workflowTitle },

                });
            }
        } catch (error) {
            console.error('Error creating workflow:', error);
        }
    };

    useEffect(() => {
        if (project?.workflowId) {
            setSelectedWorkflowId(project.workflowId);
        }
    }, [project]);




    return (
        <>
            <div className="border rounded-2xl shadow-lg p-5 bg-white mt-2">
                <p className="mt-2 mb-4 text-base font-bold"><a className="cursor-pointer" onClick={() => navigate('/course-creation/CourseCards')}><img className="inline me-2" src={Icons.back_arrow_icon} alt="right_arrow.svg" /> Course settings</a></p>
                <div className="border rounded-2xl shadow-lg bg-white">
                    <div className="mb-2">
                        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                            <li className="me-2">
                                <button
                                    onClick={() => handleSwitchTab('project_details')}
                                    className={`inline-block p-4 border-b-2 text-base rounded-t-lg ${activeTab === 'tab-1'
                                        ? 'text-[#4318FF] border-[#4318FF] font-bold'
                                        : 'hover:text-gray-600 hover:border-gray-300 border-transparent font-medium'
                                        }`}
                                >
                                    Course details
                                </button>
                            </li>
                            <li className="me-2">
                                <button
                                    onClick={() => handleSwitchTab('workflow')}
                                    className={`inline-block p-4 border-b-2 text-base rounded-t-lg ${activeTab === 'tab-2'
                                        ? 'text-[#4318FF] border-[#4318FF] font-bold'
                                        : 'hover:text-gray-600 hover:border-gray-300 border-transparent font-medium'
                                        }`}
                                >
                                    Workflow
                                </button>
                            </li>
                            <li className="me-2">
                                <button
                                    onClick={() => handleSwitchTab('team_members')}
                                    className={`inline-block p-4 border-b-2 text-base rounded-t-lg ${activeTab === 'tab-3'
                                        ? 'text-[#4318FF] border-[#4318FF] font-bold'
                                        : 'hover:text-gray-600 hover:border-gray-300 border-transparent font-medium'
                                        }`}
                                >
                                    Team members
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className={`${activeTab === 'tab-1' ? 'block' : 'hidden'} p-4 rounded-lg`}>
                        <div>
                            {/* <form onSubmit={handleAdd}> */}
                            <form>
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
                                                disabled={!permissions.CreateeditCourseAttributesNamedescriptionimage}
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
                                                disabled={!permissions.CreateeditCourseAttributesNamedescriptionimage}
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
                                            disabled={!permissions.CreateeditCourseAttributesNamedescriptionimage}
                                            required
                                        />
                                    </div>

                                    <FileUploadButton onResponse={(url: string) => setthumbnailUrl(url)} courseName={courseName} description={description} onValid={(flag: boolean) => setIsDisabled(flag)} />


                                    {/* <button
                                    // type="submit"
                                    onClick={(e) => {
                                        // saveTeamMemeber();
                                        handleAdd(e);
                                        setActiveTab("tab-2")
                                    }}
                                    type="button"
                                    className={`mt-5 font-medium rounded-full text-sm px-10 py-2.5 text-center ${!isFormValid
                                        ? 'bg-[#D0D5DD] text-[#7A7F89] cursor-not-allowed font-bold'
                                        : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300'
                                        }`}
                                    disabled={!isFormValid}
                                >
                                    Save submit
                                </button> */}

                                    <button
                                        type="button"
                                        onClick={async (e) => {
                                            // saveTeamMemeber(); 
                                            const success = await handleAdd(e);
                                            if (success) {
                                                navigate('/course-creation/CourseCards');
                                            }
                                        }}
                                        className={`mt-5 font-medium rounded-full text-sm px-10 py-2.5 text-center ${!isFormValid
                                            ? 'bg-[#D0D5DD] text-[#7A7F89] cursor-not-allowed font-bold'
                                            : 'bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300'
                                            }`}
                                        disabled={!isFormValid}
                                    >
                                        Save
                                    </button>
                                </div>


                            </form>
                        </div>
                    </div>
                    <div className={`${activeTab === 'tab-2' ? 'block' : 'hidden'} p-4 rounded-lg`}>
                        <h4 className="font-bold text-[16px] mb-5">Course: {courseCard.code} - {courseCard.title}</h4>
                        {/* <div className="flex gap-2 w-[80%]">
                        <div className="w-[60%] p-2">
                            <p className="text-sm font-semibold inline-flex items-center gap-2 mb-2">
                                <span>Current workflow</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.99563 14C10.2069 14 10.3854 13.9281 10.5312 13.7844C10.6771 13.6406 10.75 13.4625 10.75 13.25V9.75C10.75 9.5375 10.6785 9.35937 10.5356 9.21562C10.3927 9.07187 10.2156 9 10.0044 9C9.79313 9 9.61458 9.07187 9.46875 9.21562C9.32292 9.35937 9.25 9.5375 9.25 9.75V13.25C9.25 13.4625 9.32146 13.6406 9.46438 13.7844C9.60729 13.9281 9.78438 14 9.99563 14ZM9.99563 7.5C10.2069 7.5 10.3854 7.42854 10.5312 7.28563C10.6771 7.14271 10.75 6.96563 10.75 6.75438C10.75 6.54313 10.6785 6.36458 10.5356 6.21875C10.3927 6.07292 10.2156 6 10.0044 6C9.79313 6 9.61458 6.07146 9.46875 6.21437C9.32292 6.35729 9.25 6.53437 9.25 6.74562C9.25 6.95687 9.32146 7.13542 9.46438 7.28125C9.60729 7.42708 9.78438 7.5 9.99563 7.5ZM10.0058 18C8.90472 18 7.86806 17.7917 6.89583 17.375C5.92361 16.9583 5.07292 16.3854 4.34375 15.6562C3.61458 14.9271 3.04167 14.0767 2.625 13.105C2.20833 12.1333 2 11.0951 2 9.99042C2 8.88569 2.20833 7.85069 2.625 6.88542C3.04167 5.92014 3.61458 5.07292 4.34375 4.34375C5.07292 3.61458 5.92333 3.04167 6.895 2.625C7.86667 2.20833 8.90486 2 10.0096 2C11.1143 2 12.1493 2.20833 13.1146 2.625C14.0799 3.04167 14.9271 3.61458 15.6562 4.34375C16.3854 5.07292 16.9583 5.92167 17.375 6.89C17.7917 7.85847 18 8.89319 18 9.99417C18 11.0953 17.7917 12.1319 17.375 13.1042C16.9583 14.0764 16.3854 14.9271 15.6562 15.6562C14.9271 16.3854 14.0783 16.9583 13.11 17.375C12.1415 17.7917 11.1068 18 10.0058 18ZM10 16.5C11.8056 16.5 13.3403 15.8681 14.6042 14.6042C15.8681 13.3403 16.5 11.8056 16.5 10C16.5 8.19444 15.8681 6.65972 14.6042 5.39583C13.3403 4.13194 11.8056 3.5 10 3.5C8.19444 3.5 6.65972 4.13194 5.39583 5.39583C4.13194 6.65972 3.5 8.19444 3.5 10C3.5 11.8056 4.13194 13.3403 5.39583 14.6042C6.65972 15.8681 8.19444 16.5 10 16.5Z" fill="#4318FF" />
                                </svg>

                            </p>
                            <DropdownWorkFlow currentWorkflow={workflows} onSeletedValue={(workflow: any) => { }} />
                        </div>
                        <div className="w-[40%] p-2">
                            <p className="text-sm font-semibold">Preview workflow</p>
                            <div id="workflowViewer" className="overflow-auto h-[330px]">
                                <WorkflowViewer
                                    workflow_id={project.workflowId}
                                    token={token}
                                    enviroment="dev"
                                />
                            </div>
                        </div>
                    </div> */}

                        <div className="flex w-full gap-4">
                            <div className="w-[45%] text-sm font-normal">

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mt-5 mb-2">
                                        <p className="text-sm font-bold text-gray-900">Current workflow</p>
                                        <img src={vector_icon} alt="info" className="w-[18px] h-[18px] flex-shrink-0" />
                                    </div>

                                    <select
                                        value={selectedWorkflowId || ""}
                                        // onChange={(e) => {

                                        //     e.preventDefault();
                                        // }}
                                        //onClick={(e) => e.stopPropagation()} 
                                        onChange={(e) => {
                                            setSelectedWorkflowId(e.target.value);
                                        }}
                                        // className="w-full mt-2 p-2 border rounded cursor-not-allowed" // show disabled cursor
                                        className="bg-[#fff] w-[428px] h-[45px] border border-[#CAD2FF] hover:bg-gray-100 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-base px-4 py-2 text-[#40444D] appearance-none bg-no-repeat bg-right bg-[length:20px_20px]"
                                        disabled={!dropDowndiasble}
                                    >
                                        {workflowData.map((item) => (
                                            <option key={item.id} value={item.id} className="bg-[#fff] ">
                                                {item.title}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                <button
                                    type="button"
                                    className="mt-4 text-[#4318FF] text-sm bg-white border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] inline-flex items-center rounded-full font-bold text-[13px] px-4 py-2.5 w-[145px]"
                                    onClick={() => setShowCard(true)}
                                >
                                    <img src={plus_icon} alt="add" className="w-[15px] h-[12px] mr-2" />
                                    Create new
                                </button>



                                {showCard && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                        <div className="bg-white rounded-xl shadow-lg p-6 w-[300px]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-md font-semibold">Create Workflow</h3>
                                                <button
                                                    // onClick={() => setShowCard(false)}
                                                    onClick={() => {
                                                        setShowCard(false);
                                                        setWorkflowTitleError('');
                                                    }}
                                                >
                                                    <img src={Images.circle_cross_icon} alt="circle_cross_icon" />
                                                </button>
                                            </div>
                                            <label className="text-sm font-medium text-[#40444D]">Title</label>
                                            <input
                                                type="text"
                                                value={workflowTitle}
                                                onChange={(e) => setWorkflowTitle(e.target.value)}
                                                placeholder="Workflow Title"
                                                className="mt-2 bg-gray-50 border w-full h-[40px] border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                            />
                                            {workflowTitleError && (
                                                <p className="text-red-600 text-sm mt-1">{workflowTitleError}</p>
                                            )}
                                            <div className="flex gap-4 mt-5">
                                                <button className="w-full text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2.5 text-center"
                                                    onClick={handleNextClick}
                                                >
                                                    Next
                                                </button>
                                                <button
                                                    //onClick={() => setShowCard(false)}
                                                    onClick={() => {
                                                        setShowCard(false);
                                                        setWorkflowTitleError('');
                                                    }}
                                                    className="w-full text-[#4318FF] text-sm bg-white border border-[#4318FF] hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-[#4318FF] rounded-full font-bold px-4 py-2.5 text-center"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}



                            </div>



                            <div className="flex flex-col w-1/2">
                                <p className="text-sm font-bold text-gray-900 mb-2" style={{ marginTop: "5%" }}>Preview workflow</p>
                                <div
                                    className="rounded-lg overflow-auto"
                                    style={{
                                        width: '500px',
                                        height: '404px',
                                        flexShrink: 0,
                                        backgroundColor: '#F7F8FC',
                                        padding: '20px',
                                        boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                                        marginTop: "10px"
                                    }}
                                >
                                    {/* {selectedWorkflowId && (
                                    <WorkflowViewer
                                        workflow_id={selectedWorkflowId}
                                        token={token}
                                        enviroment="dev"
                                    />
                                )} */}

                                    {selectedWorkflowId && (
                                        <WorkflowViewer
                                            key={selectedWorkflowId} // ← Force re-mount
                                            workflow_id={selectedWorkflowId}
                                            token={token}
                                            enviroment="dev"
                                        />
                                    )}
                                </div>
                            </div>

                        </div>
                        <button
                            onClick={(e) => {
                                //saveTeamMemeber();
                                handleSaveWorkFlow();
                                handleAdd(e);
                                setActiveTab("tab-3")
                            }}
                            type="button"
                            className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-bold rounded-full text-base px-10 py-2 text-center"
                        >
                            Save...
                        </button>

                    </div>
                    <div className={`${activeTab === 'tab-3' ? 'block' : 'hidden'} py-2 px-4 rounded-lg`}>
                        <h4 className="font-bold text-base mb-6">Course: {courseCard.code} - {courseCard.title}</h4>
                        <p className="text-[#40444D] text-sm mt-4 font-semibold">Assign team members as per the workflow</p>
                        <div className={`grid grid-cols-3 gap-8 min-h-80 mt-4`}>
                            {workflowStates.map(workflow => (
                                <div key={workflow.id}>
                                    {/* <p className="text-sm font-semibold">Author Unit Content</p> */}
                                    <p className="text-sm font-semibold">{workflow.title}</p>
                                    <RoleDropdown
                                        role={workflow.type.toLowerCase()}
                                        usersData={getAvailableUsers(workflow.type.toLowerCase())}
                                        selectedUser={selectedUsers[workflow.type.toLowerCase()]}
                                        onUserSelect={(user) => handleUserSelection(workflow.type.toLowerCase(), user)}
                                        showLeadReviewer={workflow.type === 'Reviewer'}
                                        onReviewerSelected={(rUsers: any[]) => handleUserSelection(workflow.type.toLowerCase(), rUsers)}
                                        onReviewerList={reviewerList}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={saveTeamMemeber}
                            type="button"
                            className="text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-bold rounded-full text-base px-10 py-2 text-center"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
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

    const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

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
                disabled={!permissions.CreateeditCourseAttributesNamedescriptionimage}
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
                        {/* <a className="inline-block me-2 cursor-pointer"><img src={Icons.highlight_off_icon} alt="pause_icon.svg" /></a> */}
                        <button
                            type="button"
                            onClick={() => {
                                setPreview(null);
                                setShowProgress(false);
                                setProgress(0);
                                onResponse('');
                            }}
                            className="inline-block me-2 cursor-pointer"
                        >
                            <img src={Icons.highlight_off_icon} alt="remove_thumbnail_icon" />
                        </button>

                    </div>
                )}
            </div>}
        </div >
    );
};

interface IDropDownUser {
    id: string;
    name: string;
    selected: boolean;
    initials: string;
    email: string;
}

interface RoleDropdownProps {
    role: string;
    usersData: IDropDownUser[];
    selectedUser: IDropDownUser | null;
    showLeadReviewer?: boolean
    onUserSelect: (user: IDropDownUser | null) => void;
    onReviewerSelected: (user: IDropDownUser[]) => void;
    //onSavedUser: any | null;
    onReviewerList: any[];
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({ role, usersData, selectedUser, showLeadReviewer, onUserSelect, onReviewerSelected, onReviewerList }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedUsers, setTempSelectedUsers] = useState<any[]>([]);
    const [reviewerList, setReviewerList] = useState<any[]>([]);

    const toggleDropdown = () => {
        if(!permissions.CreateeditCourseAttributesNamedescriptionimage) return;
        setIsOpen(!isOpen)
    };

    const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const toggleUserSelection = (user: IDropDownUser) => {
        const isSelected = tempSelectedUsers.some(u => u.id === user.id);
        if (isSelected) {
            setTempSelectedUsers(tempSelectedUsers.filter(u => u.id !== user.id));
        } else {
            setTempSelectedUsers([...tempSelectedUsers, user]);
        }
    };

    const handleAdd = () => {
        if (tempSelectedUsers.length > 0) {
            if (role === 'reviewer') {
                setReviewerList(prevData => [...prevData, tempSelectedUsers[0]]);
                onReviewerSelected(tempSelectedUsers);
                setTempSelectedUsers([]);

            } else {
                onUserSelect(tempSelectedUsers[0]);
                setTempSelectedUsers([]);

            }
            setIsOpen(false);
            setSearchTerm('');

        }
    };

    const removeSelectedUser = (id?: string) => {
        if (role === 'reviewer') {
            setReviewerList(prevList => prevList.filter(item => item.id !== id));
        }

        onUserSelect(null);
    };

    //const filteredUsers = usersData.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredUsers = usersData
        .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(user => {
            // Prevent already selected users from showing up again
            if (role === 'reviewer') {
                return !reviewerList.some(selected => selected.id === user.id);
            } else {
                return selectedUser?.id !== user.id;
            }
        });

    useEffect(() => {
        setReviewerList(onReviewerList);
    }, [onReviewerList]);


    return (
        <div className="relative">
            <div className="flex gap-4 mt-2">
                <button
                    onClick={toggleDropdown}
                    className="w-full h-11 border justify-between border-[#CAD2FF] hover:bg-gray-100 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-base px-4 py-2 text-[#8D95A4] inline-flex items-center"
                    type="button"
                >
                    {/* <span>{selectedUser ? Array.isArray(selectedUser) ? selectedUser.map(user => user.name).join(", ") : selectedUser?.name : 'Select'}</span> */}
                    <span>Select</span>
                    <img src={Icons.gray_down_arrow_icon} alt="gray_down_arrow_icon.svg" />
                </button>

                <button
                    onClick={handleAdd}
                    type="button"
                    className={`${tempSelectedUsers.length > 0 ? 'text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)]' : 'text-[#7A7F89] bg-[#D0D5DD]'} border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-full font-bold text-sm px-5 py-2.5 me-2 mb-2`}
                >
                    Add
                </button>
            </div>

            {isOpen && (
                <div className="z-10 bg-white rounded-xl shadow w-[80%] absolute">
                    <div className="p-1">
                        <label htmlFor={`input-group-search-${role}`} className="sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
                                <img src={Icons.search_icon} alt="search_icon.svg" />
                            </div>
                            <input
                                type="text"
                                id={`input-group-search-${role}`}
                                className="block w-full p-2 ps-10 text-sm border-0 bg-white border-transparent focus:border-transparent focus:ring-0 focus-visible:outline-none"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <ul className="h-48 py-2 overflow-y-auto text-gray-700">
                        {filteredUsers.map(user => (
                            <li key={user.id}>
                                <button
                                    onClick={() => toggleUserSelection(user)}
                                    className={`w-full flex items-center px-4 py-2 hover:bg-gray-100 ${tempSelectedUsers.some(u => u.id === user.id) ? 'bg-gray-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#E0E5F2] text-[#2B3674] text-sm me-2">
                                        {user.initials}
                                    </div>
                                    {user.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {role === 'reviewer' ? reviewerList.map((user, index) => (
                <div className="mt-4" key={index}>
                    <div className="flex items-start mb-3 bg-white p-3 rounded-lg text-sm text-gray-700 border border-gray-200 shadow-lg">
                        <div className="w-full flex">
                            <div className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm me-2">
                                {user.initials}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="p-1">
                                    <span className="text-sm">{user.name}</span>
                                    <span className="px-3 text-gray-300">|</span>
                                    <span>{user.email}</span>
                                </div>
                                {showLeadReviewer && <div className="flex items-center p-1">
                                    <input id="lead-reviewer" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500" />
                                    <label htmlFor="lead-reviewer" className="ms-2 text-sm font-medium text-gray-900">Lead reviewer</label>
                                </div>}
                            </div>
                        </div>
                        <button
                            onClick={() => removeSelectedUser(user.id)}
                            disabled={!permissions.CreateeditCourseAttributesNamedescriptionimage}
                            className="text-gray-500 hover:text-gray-700 p-1"
                        >
                            <img src={Icons.user_delete_icon} alt="user_delete_icon.svg" />
                        </button>
                    </div>
                </div>
            )) : selectedUser && (
                <div className="mt-4">
                    <div className="flex items-start mb-3 bg-white p-3 rounded-lg text-sm text-gray-700 border border-gray-200 shadow-lg">
                        <div className="w-full flex">
                            <div className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm me-2">
                                {selectedUser.initials}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="p-1">
                                    <span className="text-sm">{selectedUser.name}</span>
                                    <span className="px-3 text-gray-300">|</span>
                                    <span>{selectedUser.email}</span>
                                </div>
                                {showLeadReviewer && (
                                    <div className="flex items-center p-1">
                                        <input id="lead-reviewer" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500" />
                                        <label htmlFor="lead-reviewer" className="ms-2 text-sm font-medium text-gray-900">Lead reviewer</label>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => removeSelectedUser()}
                            disabled={!permissions.CreateeditCourseAttributesNamedescriptionimage}
                            className="text-gray-500 hover:text-gray-700 p-1"
                        >
                            <img src={Icons.user_delete_icon} alt="user_delete_icon.svg" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


interface IDropdownWorkFlow {
    currentWorkflow: string;
    onSeletedValue: (value: string) => void;
}

const DropdownWorkFlow: React.FC<IDropdownWorkFlow> = ({ currentWorkflow, onSeletedValue }) => {
    const token = useSelector((state: RootState) => state.login.token);
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('Select');

    const handleSelect = (workflow: string) => {
        setSelected(workflow);
        onSeletedValue(workflow);
        setIsOpen(false);
    };

    useEffect(() => {
        setSelected(currentWorkflow);
    }, [currentWorkflow])


    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 border justify-between border-[#CAD2FF] hover:bg-gray-100 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-base px-4 py-2 text-[#40444D] inline-flex items-center"
                type="button"
            >
                {selected}
                <img src={Icons.down_arrow} alt="down_arrow" />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 border border-gray-200 rounded-lg shadow-lg w-full">
                    <ul className="py-2 text-sm text-gray-700">
                        <li>
                            <button
                                onClick={() => handleSelect(currentWorkflow)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                {currentWorkflow}
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CourseSettings;