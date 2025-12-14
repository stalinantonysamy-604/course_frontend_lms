import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { setBreadCrumb, setTitle } from './../../Navbar/NavbarSlice';
import { WorkflowViewer } from 'dictera-workflow';

import plus_icon from '../../../Assets/Icons/plus_icon.svg';


import * as Icons from './../../Icons';
import * as Images from './../../Images';
import axiosInstance from './../../../Api/Axios';
import { RootState } from '../../../store';

import './CreateProject.scss';


const CreateProject: React.FC = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const token = useSelector((state: RootState) => state.login.token);
    const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const location = useLocation();
    const editProject = location.state?.editProject;

    const [projectName, setProjectName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [thumbnailUrl, setthumbnailUrl] = useState<string>('');
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [teamList, setTeamList] = useState<any[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<{ id: number; title: string } | null>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const displayedMembers = teamList.slice(0, 4);
    const [previewWorkflowId, setPreviewWorkflowId] = useState<number | null>(null);
    const [previewWorkflowTitle, setPreviewWorkflowTitle] = useState<string>('');
    const [showCard, setShowCard] = useState(false);
    const [workflowTitle, setWorkflowTitle] = useState('');
    const [workflowTitleError, setWorkflowTitleError] = useState('');



    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        //        if (projectName === '' || thumbnailUrl === '') return;

        if (!isUpdate) {
            const _thumbnailUrl = thumbnailUrl !== '' ? {


                "thumbnailUrl": [
                    {
                        "url": thumbnailUrl
                    }
                ]
            } : {};

            const workflowId = permissions.ApplyWFtoProject ? { "workflowId": selectedWorkflow?.id } : {};

            try {
                const response = await axiosInstance.post('/project/creation', {
                    "title": projectName,
                    "description": description,
                    ...workflowId,
                    ..._thumbnailUrl

                }, {
                    //...( { maxBodyLength: Infinity } as any),
                    headers: {
                        userId: '88796200-3f4c-4616-b0fc-34cb62222123456',
                    },
                });

                if (response.status === 200) {
                    //console.log(response);
                    navigate('/project-creation/ProjectCards');
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const response = await axiosInstance.put(`/project/update/${editProject.projectId}`, {
                    "title": projectName,
                    "description": description,
                },
                    {
                        headers: {
                            'userId': '88796200-3f4c-4616-b0fc-34cb62222123456',
                            'Content-Type': 'application/json'
                        }
                    });

                if (response.status === 200) {
                    navigate('/project-creation/ProjectCards');
                }
            } catch (error) {
                console.log(error);
            }
        }

    }


    const handlePreviewClick = async () => {
        if (!selectedWorkflow?.id) {
            alert("Please select a workflow to preview.");
            return;
        }
        try {
            const response = await axiosInstance.get('/workflow');
            const workflows = response.data.data;

            const matchedWorkflow = workflows.find(
                (wf: any) => wf.id === selectedWorkflow?.id
            );

            if (matchedWorkflow) {
                setPreviewWorkflowId(matchedWorkflow.id);
                setPreviewWorkflowTitle(matchedWorkflow.title);
                setIsDrawerOpen(true);
            } else {
                console.log("Selected workflow not found");
            }
        } catch (error) {
            console.log('Error fetching workflows:', error);
        }
    };




    const handAddTeamMemeber = () => {
        navigate('/project-creation/AddTeamMembers');
    }

    const handleWorkflow = () => {
        navigate('/project-creation/Workflow');
    }

    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/role');
            const allRoles = res.data.data || [];
            setRoles(allRoles);
            //console.log("roles", allRoles)

        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeamList = async () => {
        try {
            const response = await axiosInstance.get('/invite');
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
        if (editProject) {
            setProjectName(editProject.title);
            setDescription(editProject.description);
            setIsUpdate(true);
        }
    }, [editProject])

    useEffect(() => {
        dispatch(setTitle('Project'));
        dispatch(setBreadCrumb(['Project', 'New project']));
    }, []);


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



    return (
        <>
            <form onSubmit={handleCreate}>
                <div className="border rounded-2xl shadow-lg p-5 bg-white">
                    <div className="border rounded-2xl shadow-lg p-5 bg-white">
                        <h6 className="text-sm font-bold mb-2">Basic information</h6>
                        <p className="text-sm mb-5">
                            {/* <img className="inline" src={Icons.info_icon} alt="info_icon.svg" />  */}
                            You can start creating your project by entering the project name. Adding team members and settings are optional and can be configured later.</p>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-5">
                                <label htmlFor="course_name" className="block mb-2 text-sm font-bold text-gray-900">Project name <span className="text-red-700">*</span></label>
                                <input
                                    type="text"
                                    id="course_name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Enter project name"
                                    value={projectName}
                                    onChange={handleProjectNameChange}
                                    required
                                />
                            </div>
                            <div className="col-span-7">
                                <label htmlFor="description" className="block mb-2 text-sm font-bold text-gray-900">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Enter project description"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                />
                            </div>
                        </div>

                        <FileUploadButton onResponse={(url: string) => setthumbnailUrl(url)} />

                        {permissions.ApplyWFtoProject && <>
                            <p className="block mb-2 mt-5 text-sm font-bold text-gray-900">Select a workflow</p>
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-5">
                                    <DropdownWorkFlow onSeletedValue={(workflow) => setSelectedWorkflow(workflow)} />
                                </div>
                                <div className="col-span-7">
                                    <button
                                        type="button"
                                        className="text-[#4318FF] text-sm bg-white border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] me-4 inline-flex items-center rounded-full font-bold text-[13px] px-4 py-2.5"
                                        onClick={handlePreviewClick}
                                    >
                                        <img className="align-text-top me-2" src={Icons.preview_eye_icon} alt="preview_eye_icon.svg" />
                                        Preview
                                    </button>

                                    <span style={{ width: "17px", marginRight: "10px", color: "#1D1F23" }}>Or</span>
                                    <button
                                        type="button"
                                        className="text-[#4318FF] text-sm bg-white border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] me-4 inline-flex items-center rounded-full font-bold text-[13px] px-4 py-2.5"
                                        onClick={() => setShowCard(true)}
                                    >
                                        <img src={plus_icon} alt="add" className="w-[15px] h-[12px] mr-2" />
                                        Create new
                                    </button>
                                </div>
                            </div>
                        </>}

                    </div>
                   
                    <div>
                        {!isUpdate && <div>
                            <button
                                type="submit"
                                className="mt-5 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-10 py-2.5 text-center"
                            >
                                Create
                            </button>
                        </div>}
                        {isUpdate &&
                            <button
                                type="submit"
                                className="mt-5 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-10 py-2.5 text-center"
                            >
                                Save
                            </button>
                        }
                    </div>
                </div>
            </form>

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


            {isDrawerOpen && (
                previewWorkflowId ? (
                    <RightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                        <h3 className="text-md font-semibold mb-5" style={{ fontSize: "14px", color: "#40444D" }}> Workflow name </h3>
                        <h3 className="mb-5" style={{ color: "#2B3674", fontSize: "14px", fontWeight: "600" }}>{previewWorkflowTitle}</h3>
                        <div id="">
                            {/* workflowViewer1" */}
                            <WorkflowViewer
                                workflow_id={previewWorkflowId.toString()}
                                token={token}
                                enviroment="dev"
                            />

                        </div>
                    </RightDrawer>
                ) : (
                    <div className="text-center mt-4">
                        <img src={Images.preview_flow} alt="preview_flow.png" className="mx-auto" />
                    </div>
                )
            )}
        </>
    )
}

interface IFileUploadButton {
    onResponse: (url: string) => void;
}
const FileUploadButton: React.FC<IFileUploadButton> = ({ onResponse }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number>(0);
    const [preview, setPreview] = useState<string | null>(null);
    const [showProgress, setShowProgress] = useState<boolean>(false);

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
        const placeholder = Images.placeholder
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
                Upload thumbnail <img className="inline ms-2" src={Icons.info_blue_icon} alt="info_blue_icon.svg" />
            </label>
            <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                accept=".png, .jpg"
                style={{ display: 'none' }}
                onChange={handleImageChange}
            />
            <button
                type="button"
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-[#4318FF] focus:outline-none bg-white rounded-full border border-[#4318FF] hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                onClick={handleButtonClick}
            >
                <span className="text-[#4318FF] font-bold">+ Upload</span>
            </button>
            <p className="text-xs text-[#40444D]">Accepted formats: JPG, PNG.</p>

            {showProgress && <div className="rounded-[16px] border border-gray-300 w-[502px] p-4  mt-3">
                {!preview && (<>
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-bold leading-6">Uploading...<br /> <span className="font-normal text-[#40444D]">{progress}%  • 30 seconds remaining</span></p>
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

interface RightDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    imageUrl?: string;
    selectedWorkflow?: {
        title?: string;

    };
}


const RightDrawer: React.FC<RightDrawerProps & { imageUrl?: string }> = ({ isOpen, onClose, children, imageUrl, selectedWorkflow }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
        >

            <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b border-gray-200">
                <h3 className="" style={{ fontSize: "24px", fontWeight: "700", color: "#1D1F23" }}>Preview Workflow</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors text-2xl leading-none"
                >
                    <img src={Images.circle_cross_icon} alt="circle_cross_icon" />

                </button>
            </div>

            <div className="mt-4">
                {selectedWorkflow?.title && (
                    <>
                        <p className="text-sm font-semibold mb-4">Workflow name</p>
                        <p className="text-sm mb-3">{selectedWorkflow.title}</p>
                    </>
                )}
            </div>

            <div className="px-6 py-4 overflow-y-auto h-[calc(100%-72px)]">

                {children}

                {/* <div className='mt-5'>
                    <span style={{ width: "17px", marginRight: "10px", color: "#1D1F23" }}>Or</span>
                </div>
                <button
                    type="button"
                    className="mt-5 mb-5 text-[#4318FF] text-sm bg-white border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] me-4 inline-flex items-center rounded-full font-bold text-[13px] px-4 py-2.5"
                    onClick={() => navigate('/project-creation/Workflow')}
                >
                    <img src={plus_icon} alt="add" className="w-[15px] h-[12px] mr-2" />
                    Create new
                </button> */}
            </div>
        </div>
    );
};

interface IDropdownWorkFlow {
    onSeletedValue: (value: { id: number; title: string }) => void;
}

const DropdownWorkFlow: React.FC<IDropdownWorkFlow> = ({ onSeletedValue }) => {
    const token = useSelector((state: RootState) => state.login.token);
    const [isOpen, setIsOpen] = useState(false);
    const [workflows, setWorkflows] = useState<{ id: number; title: string }[]>([]);
    const [selected, setSelected] = useState('Select');

    // const handleSelect = (value: string) => {
    //     setSelected(value);
    //     setIsOpen(false);

    //     onSeletedValue(value);
    // };

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const response = await axiosInstance.get('/workflow');

                console.log("workflow response:", response.data);

                const workflowData = response.data?.data || [];
                // const filtered = workflowData.filter((item: any) => item.title !== 'Test Workflow');
                //const workflowTitles = workflowData.map((item: any) => item.title);
                //const workflowTitles = filtered.map((item: any) => item.title);

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



                setWorkflows(workflowData);

                handleSelect(workflowData[0]);

                //console.log("workflows", workflowData);

            } catch (error) {
                console.error('Error fetching workflows:', error);
            }
        };

        fetchWorkflows();
    }, []);

    const handleSelect = (workflow: { id: number; title: string }) => {
        setSelected(workflow.title);
        onSeletedValue(workflow);
        setIsOpen(false);
    };



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

            {/* {isOpen && (
                <div className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 border border-gray-200 rounded-lg shadow-lg w-full">
                    <ul className="py-2 text-sm text-gray-700">
                        <li>
                            <button
                                onClick={() => handleSelect('ARP Workflow')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                ARP Workflow
                            </button>
                        </li>
                    </ul>
                </div>
            )} */}

            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto h-[10rem]">
                    {workflows.map((workflow) => (
                        <li key={workflow.id}>
                            <button
                                onClick={() => handleSelect(workflow)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                {workflow.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
};

export default CreateProject;