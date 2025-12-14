import React, { useEffect, useState } from "react";
import { WorkflowViewer } from "dictera-workflow";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import axiosInstance from "../../../Api/Axios";
import vector_icon from '../../../Assets/Icons/vector_icon.svg';
import search_icon from '../../../Assets/Icons/search_icon.svg';
import plus_white from '../../../Assets/Icons/plus_white.svg';
import edit_icon from '../../../Assets/Icons/edit_icon.svg';
import * as Icons from './../../Icons';
import * as Images from './../../Images';
import { useNavigate } from "react-router-dom";
import axios from "axios";


const WorkFlowList = () => {
    const token = useSelector((state: RootState) => state.login.token);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showCard, setShowCard] = useState(false);
    const [workflowTitle, setWorkflowTitle] = useState('');
    const [workflowTitleError, setWorkflowTitleError] = useState('');

    const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

    const navigate = useNavigate();

    const fetchWorkflows = async () => {
        try {
            const response = await axiosInstance.get("/workflow");
            //console.log("response", response.data.data)

            if (response.status === 200 && Array.isArray(response.data.data)) {
                setWorkflows(response.data.data);
                setSelectedWorkflowId(response.data.data[0]?.id?.toString() ?? null);
            } else {
                console.error("Unexpected API response:", response.data);
            }
        } catch (error) {
            console.error("Error fetching workflows:", error);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const filteredWorkflows = workflows.filter((workflow) =>
        workflow.title.toLowerCase().includes(search.toLowerCase())
    );

    const selectedWorkflow = workflows.find(
        (w) => w.id.toString() === selectedWorkflowId
    );


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
        <div>
            <h3 className="mb-6 mt-5 text-[28px] leading-[28px] font-bold text-[#1D1F23] font-['DM_Sans']">
                Workflows
            </h3>
            <div className="min-h-screen bg-[#fff] p-6 font-sans rounded-xl">

                <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                    <div className="flex gap-4 flex-wrap">

                        <div className="relative w-[466px]" >
                            <input
                                type="text"
                                placeholder="Search by name"
                                className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2 text-sm focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                <img src={search_icon} alt="search" className="w-4 h-4" />
                            </span>
                        </div>


                        {/* <select className="border border-gray-300 px-3 py-2 rounded-md text-sm w-[200px]">
                            <option value="All">Status : Select</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select> */}
                    </div>

                    <div className="flex w-full md:w-auto md:ml-auto gap-3">
                        {permissions.CreateNewWF && <button
                            onClick={() => setShowCard(true)}
                            className="mt-5 w-[148px] h-[40px] text-[14px] text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] font-medium rounded-full flex items-center justify-center gap-2"
                            style={{ width: "126px", height: "44px", marginTop: "-1%" }}
                        >
                            <img src={plus_white} alt="add" className="w-[9px] h-[9px]" />
                            <span className="text-white text-[16px] font-medium leading-[100%] tracking-[-0.28px] font-['DM Sans']">
                                Create
                            </span>
                        </button>}
                    </div>

                </div>


                {showCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[300px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-semibold">Create Workflow</h3>
                                <button
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



                <p className="flex items-center gap-2 text-sm text-[#2B3674] mb-4">
                    <img src={vector_icon} alt="info" className="w-4 h-4" />
                    All the workflows being used are not editable.
                </p>

                {permissions.WFlist && <div className="bg-white shadow-md rounded-md overflow-hidden flex">

                    <div className="flex-1">
                        <div className="grid grid-cols-3 font-semibold text-[#1D1F23] px-4 py-3 border-b bg-[#fff]">
                            <div>Name</div>
                            <div className="text-center">Roles</div>
                            <div className="text-center">Actions</div>
                        </div>

                        {filteredWorkflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className={`grid grid-cols-3 items-start px-4 py-4 text-sm border-b cursor-pointer ${selectedWorkflowId === workflow.id.toString()
                                    ? "bg-[#F2F4FF]"
                                    : "bg-[#fff]"
                                    }`}
                                onClick={() => setSelectedWorkflowId(workflow.id.toString())}
                            >
                                <div>
                                    <div className="text-[#40444D] font-['DM_Sans'] text-sm font-medium leading-7">
                                        {workflow.title}
                                    </div>
                                    <p className="text-[#40444D] font-['DM_Sans'] text-sm font-normal leading-4">
                                        Created By {workflow.createdAt ? workflow.createdAt.slice(0, 16).replace('T', ' T ') : 'System'}
                                    </p>
                                </div>
                                <div className="text-center text-[#40444D] font-['DM_Sans'] text-sm font-normal leading-7">
                                    {workflow.roles?.join(", ") || "-"}
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[#40444D]">
                                    {permissions.DeleteWF && <button title="Delete">
                                        <img src={Icons.user_delete_icon} alt="delete" />
                                    </button>}
                                    {permissions.UpdateWF && <button title="Edit">
                                        <img src={edit_icon} alt="edit" />
                                    </button>}
                                    {/* - */}
                                </div>
                            </div>
                        ))}
                    </div>


                    {selectedWorkflowId && (
                        <div className="w-[424px] flex-shrink-0 border-l p-4">
                            <p className="text-md font-semibold text-[#1D1F23] mb-4 -mt-1">Workflow preview</p>
                            <div className=" bg-white shadow rounded p-2">
                                {/* h-[500px] overflow-y-auto */}
                                <WorkflowViewer
                                    key={selectedWorkflow?.id}
                                    workflow_id={selectedWorkflowId}
                                    token={token}
                                    enviroment="dev"
                                />
                            </div>
                        </div>
                    )}
                </div>}
            </div>
        </div>
    );

};

export default WorkFlowList;
