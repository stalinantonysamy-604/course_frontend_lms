import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { setTitle, clearBreadCrumb } from './../../Navbar/NavbarSlice';
import { setProject } from './../ProjectCreationSlice';

import axiosInstance from './../../../Api/Axios';

import * as Icons from './../../Icons';
import * as Images from './../../Images';

const ProjectCardView: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const role = useSelector((state: RootState) => state.login.role);
    const username = useSelector((state: RootState) => state.login.username);
    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);


    const [projectCards, setProjectCards] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState<SortOption>({ label: 'Newest', value: 'Newest' });
    const [isEditProject, setEditProject] = useState<boolean>(false);
    const [editProjectId, setEditProjectId] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [thumbnailUrl, setthumbnailUrl] = useState<string>('');
    const [showAddProject, setShowAddProject] = useState<boolean>(false);

    const fetchProjectListing = async (page: number, limit: number): Promise<any[] | null> => {
        try {
            const response: any = await axiosInstance.get(`/project/?page=${page}&limit=${limit}`);

            if (response.status === 200) {
                if (response.data.message === "No data found") {
                    return null;
                } else {
                    return response.data.data.details;
                }
            } else {
                console.error(`Error: Received status code ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error("An error occurred while fetching the project listing:", error);
            return null;
        }
    };

    const fetchProjectlistSort = async (page: number, limit: number, sortOrder: string) => {
        setProjectCards([]);
        // if (projectId === null) return;
        try {
            const response: any = await axiosInstance.get(`/project/?page=${page}&limit=${limit}&sort=${sortOrder}`);

            if (response.status === 200 && response.data.message === "Success") {
                setProjectCards(response.data.data.details);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const filteredProjects = projectCards.filter((project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchProjectList = async (page: number, limit: number, sortOrder: string) => {

        try {
            const response: any = await axiosInstance.get(`/project/?page=${page}&limit=${limit}&sort=${sortOrder}`);


            if (response.status === 200 && response.data.message === "Success") {
                setProjectCards(response.data.data.details);
            } else {
                setProjectCards([]);
            }

            //console.log(response.data.message);


        } catch (error) {
            console.log(error);
        }
    }


    const handleUpdateCardView = async () => {
        try {
            const projectLising = await fetchProjectListing(1, 20);
            if (projectLising) {
                setProjectCards(projectLising);
            } else {
                setProjectCards([]);

            }
        } catch (error) {
            setProjectCards([]);
        }

    }

    useEffect(() => {
        dispatch(setTitle('My projects'));
        dispatch(clearBreadCrumb());

        const init = async () => {
            const projectLising = await fetchProjectListing(1, 20);
            if (projectLising) {
                setProjectCards(projectLising);
            }
        }
        init();

    }, []);

    const handleUpdatedCard = () => {
        fetchProjectList(1, 20, "asc");
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditProject) {
            try {
                try {
                    const payload = {

                        "title": projectName,
                        "description": description,

                        "thumbnailUrl": thumbnailUrl ? [{ url: thumbnailUrl }] : [], // Ensure empty array if not uploaded
                    };
                    const response = await axiosInstance.put(`/project/update/${editProjectId}`, payload, {
                        headers: {
                            'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.status === 200) {
                        //console.log(response);
                        setShowAddProject(false);
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

                    "title": projectName,
                    "description": description,
                    "thumbnailUrl": thumbnailUrl ? [{ url: thumbnailUrl }] : [], // Ensure empty array if not uploaded
                };
                const response = await axiosInstance.post('/project/creation', payload, {
                    headers: {
                        'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                    },
                });

                if (response.status === 200) {
                    //console.log(response);
                    // dispatch(setProjectId(response.data.data.courseId));
                    setShowAddProject(false);
                    handleUpdatedCard();

                }
            } catch (error) {
                console.log(error);
            }
        }
    }



    const handleDropdownMenu = (action: string, cardId: number) => {
        if (action === 'edit') {
            navigate("/project-creation/CreateProject", { state: { projectName: filteredProjects[cardId].projectName, description: filteredProjects[cardId].description } })
            setEditProject(true);
            //setEditProjectId(filteredProjects[cardId].projectId);
            setProjectName(filteredProjects[cardId].projectName);

            setDescription(filteredProjects[cardId].description);
            setShowAddProject(true);
        }
    }
    const handlesort = (sort: any) => {
        console.log(sort)
        if (sort.value === "Newest") {
            fetchProjectlistSort(1, 10, "desc");
        } else if (sort.value === "Oldest") {
            fetchProjectlistSort(1, 10, "asc");
        } else if (sort.value === "AToZ") {
            fetchProjectlistSort(1, 10, "az");
        } else if (sort.value === "ZToA") {
            fetchProjectlistSort(1, 10, "za");
        }

    }


    return (
        <>
            <div className="flow-root mt-2">
                <div className="float-left w-[44%]">
                    {/* <SearchCard onSearchQuery={(searchQuery) => setSearchQuery(searchQuery)} onSortBy={(sort) => console.log(sort)} /> */}
                    <p className="text-base my-4">Create and organize your projects to build courses more effortlessly.</p>
                </div>
                <div className="float-right">
                    {permissions?.CreatenewProject && <button
                        type="button"
                        className="flex items-center mx-auto text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-bold text-base rounded-full px-5 py-2.5 text-center"
                        data-modal-target="default-modal"
                        data-modal-toggle="default-modal"
                        onClick={() => navigate('/project-creation/CreateProject')}
                    >
                        <img src={Icons.plus_white} alt="create_project_icon" className="w-4 h-4 mr-2" />
                        Create project
                    </button>}
                </div>
            </div>
            <div className="border rounded-2xl shadow-[0px_0px_24px_0px_#00000014] p-4 bg-white">
                <div className="flex items-center justify-between">
                    <SearchCard onSearchQuery={(searchQuery) => setSearchQuery(searchQuery)} onSortBy={(sort) => handlesort(sort)} />

                    {/* <button
                        type="button"
                        className="flex items-center text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-bold text-base rounded-full px-5 py-2.5 text-center"
                        data-modal-target="default-modal"
                        data-modal-toggle="default-modal"
                    >
                        <img src={Icons.filter} alt="filter icon" className="w-4 h-4 mr-2" />
                        Filter
                    </button> */}
                </div>
                <div className="flex flex-wrap gap-4 overflow-y-auto scrollbar">
                    <ProjectCardList projectCards={filteredProjects} onUpdatedCard={handleUpdateCardView} onUpdateSelected={(action: string, cardId: number) => handleDropdownMenu(action, cardId)} />
                </div>
            </div>
        </>
    )
}

interface IProjectCard {
    projectCards: any[];
    onUpdatedCard: () => void;
    onUpdateSelected: (action: string, cardId: number) => void;

}

const ProjectCardList: React.FC<IProjectCard> = ({ projectCards, onUpdatedCard, onUpdateSelected }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const username = useSelector((state: RootState) => state.login.username);
    const role = useSelector((state: RootState) => state.login.role);
    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);

    const handleView = async (projectId: string) => {
        try {
            const response: any = await axiosInstance.get(`/project/${projectId}`);

            if (response.status === 200) {
                const project = {
                    projectId: response.data.data.projectId,
                    title: response.data.data.title,
                    workflowId: response.data.data.workflowId,
                    description: response.data.data.description
                };


                dispatch(setProject(project));

                navigate('/course-creation/CourseCards');
            } else {
                console.error(`Error: Received status code ${response.status}`);
            }
        } catch (error) {
            console.error("An error occurred while fetching the project listing:", error);
        }
    }

    const handleDelete = async (projectId: string) => {
        try {
            const response: any = await axiosInstance.delete(`project/delete/${projectId}`, {
                headers: {
                    'userId': '88796200-3f4c-4616-b0fc-34cb62222123456'
                }
            });

            if (response.status === 200) {
                //console.log(response);
                onUpdatedCard();
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleSelected = (action: string, cardId: number) => {
        onUpdateSelected(action, cardId);
    }

    return (
        projectCards.map((projectCard, index) => (
            <div
                key={index}
                className="bg-white rounded-lg shadow-[0px_0px_24px_0px_#00000014] mt-5 mb-4 h-full p-4 max-w-sm w-[318px] cursor-pointer"
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.delete-btn')) return;
                    handleView(projectCard.projectId);
                }}
            >

                <div className="mb-4 relative">
                    {/* <div className="bg-blue-100 rounded">
                        <img src={projectCard.thumbnailUrl.at(0).url} alt="card image" className="rounded-lg border border-gray-300 w-[286px] h-[128px]" />
                    </div> */}
                    <div className="w-[286px] h-[128px] rounded-lg border border-gray-300 overflow-hidden">
                        <img src={projectCard.thumbnailUrl?.at(0)?.url || Images.placeholder} alt="Describe the image here" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-2 right-2">
                        <Dropdown projectCard={projectCard} onDeleteProject={(projectId: string) => handleDelete(projectId)} />
                    </div>
                </div>
                <div className="flex w-full flex-col justify-between h-[15rem]">
                    <div className="mb-auto">
                        <div className="text-base font-semibold mb-2">{projectCard.title}</div>
                        <p
                            className="text-[#1D1F23] text-sm line-clamp-3"
                            title={projectCard.description}
                        >
                            {projectCard.description}
                        </p>

                    </div>
                    <div className="mt-auto">
                        <div className="text-[#5F5F5F] text-sm mt-3 mb-4">Courses: {projectCard.courses_count}</div>

                        <div className="flex items-center mb-4">
                            <img className="h-8 w-8 rounded-full mr-2" src={Images.user_img} alt="Profile image" />
                            <div className="text-[#40444D] text-xs">
                                <span className="mb-1 block text-[12px]">Created by:</span>

                                <span className="font-bold text-[#1D1F23] text-normal">{username}</span>
                            </div>


                        </div>
                        <div className="flex-1 mt-auto flex gap-2">
                            <button
                                type="button"
                                className="text-white w-[112px] h-[32px] bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm text-center flex items-center justify-center me-2 mb-2"
                                onClick={() => handleView(projectCard.projectId)}
                            >
                                View
                            </button>

                            {permissions?.DeleteProject && <button
                                type="button"
                                className="text-[#4318FF] delete-btn hover:text-white w-[112px] h-[32px] border border-[#4318FF] hover:bg-[#4318FF] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-1.5 text-center me-2 mb-2"
                                onClick={() => handleDelete(projectCard.projectId)}
                            >
                                Delete
                            </button>}
                        </div>
                    </div>
                </div>
            </div>
        ))
    )
}

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
    projectCard: any;
    onDeleteProject: (projectId: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ projectCard, onDeleteProject }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const permissions: any = useSelector((state: RootState) => state.login.hasPermissions);


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const getProjectDetail = async (): Promise<boolean | undefined> => {
        try {
            const response: any = await axiosInstance.get(`/project/${projectCard.projectId}`);

            if (response.status === 200) {
                const project = {
                    projectId: response.data.data.projectId,
                    title: response.data.data.title,
                    workflowId: response.data.data.workflowId,
                    description: response.data.data.description
                };

                dispatch(setProject(project));

                return true;

            } else {
                console.error(`Error: Received status code ${response.status}`);
            }
        } catch (error) {
            console.error("An error occurred while fetching the project listing:", error);
        }
    }

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


    const handleMenuItemClick = async (action: string) => {
        //console.log(`Card ${cardId}: ${action}`);

        try {
            const response: any = await axiosInstance.get(`/project/${projectCard.projectId}`);

            if (response.status === 200) {
                const project = {
                    projectId: response.data.data.projectId,
                    title: response.data.data.title,
                    workflowId: response.data.data.workflowId,
                    description: response.data.data.description
                };


                dispatch(setProject(project));

                switch (action) {
                    case 'add_course':
                        navigate('/course-creation/CourseCards');
                        break;
                    case 'add_team_member':
                        navigate('/course-creation/CourseCards', { state: { _activeTab: 'tab-2' } });
                        break;
                    case 'assign_team_member':
                        if (await getProjectDetail()) {
                            navigate('/project-creation/ProjectSettings', { state: { _activeTab: 'tab-3', projectCard: projectCard } });
                        }
                        break;
                    case 'add_workflow':
                        navigate('/project-creation/ProjectSettings', { state: { _activeTab: 'tab-2', projectCard: projectCard } });
                        break;
                    case 'edit':
                        navigate('/project-creation/ProjectSettings', { state: { _activeTab: 'tab-1', projectCard: projectCard } });
                        break;
                    case 'settings':
                        navigate('/project-creation/ProjectSettings', { state: { _activeTab: 'tab-4', projectCard: projectCard } });
                        break;
                    case 'delete':
                        onDeleteProject(projectCard.projectId);
                        break;
                }

            } else {
                console.error(`Error: Received status code ${response.status}`);
            }
        } catch (error) {
            console.error("An error occurred while fetching the project listing:", error);
        }



        setIsOpen(false);
    };

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
                    <ul className="text-sm text-[#2B3674]">
                        <li>
                            {permissions.CreateeditCourseAttributesNamedescriptionimage && <a
                                href="#"
                                className="block text-sm px-4 py-3 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMenuItemClick('add_course');
                                }}
                            >
                                Add course
                            </a>}
                            {permissions.ApplyWFtoProject && <>
                                <a
                                    href="#"
                                    className="block text-sm px-4 py-3 hover:bg-gray-100"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMenuItemClick('add_team_member');
                                    }}
                                >
                                    Add team member
                                </a>
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
                            </>}
                            {permissions.EditUpdateProject && <a
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
                            {permissions.DeleteProject &&
                                <a
                                    href="#"
                                    className="block text-sm px-4 py-3 hover:bg-gray-100"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMenuItemClick('delete');
                                    }}
                                >
                                    Delete
                                </a>}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};


export default ProjectCardView;