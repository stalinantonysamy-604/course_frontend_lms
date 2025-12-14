import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import axiosInstance from "../../Api/Axios";
import { useNavigate } from "react-router-dom";

const CourseContentProgress: React.FC = () => {

    const navigate = useNavigate();
    const permissions = useSelector((state: RootState) => state.login.permissions);
    const project: any = useSelector((state: RootState) => state.projectCreation.project);
    const userId: any = useSelector((state: RootState) => state.login.userId);

    const courseCode = useSelector((state: RootState) => state.courseCreation.courseCode);
    const courseName = useSelector((state: RootState) => state.courseCreation.courseName);
    const courseId = useSelector((state: RootState) => state.courseCreation.courseId);
    const username = useSelector((state: RootState) => state.login.username);


    const [unit, setUnit] = useState<any[]>([]);
    const [courseProgress, setCourseProgress] = useState<any[]>([]);

    const [showPublishBtnForPM, setShowPublishBtnForPM] = useState<boolean>(false);
    const [showViewBtn, setShowViewBtn] = useState<boolean>(false);

    const getCourseDetailsbyId = async (courseId: any): Promise<any | undefined> => {
        try {
            const response = await axiosInstance.get(`/course/${courseId}`);

            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const convertDateFormat = (isoDate: string) => {
        const date = new Date(isoDate);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const formatted = `${months[date.getUTCMonth()]} ${date.getUTCDate()} ${date.getUTCFullYear()}`;

        return formatted;
    }


    const getWorkflowStatesList = async (workflowStateId: string, workflowId: string, workflows: any[]) => {
        try {
            const response = await axiosInstance.get(`/workflow/${workflowId}`);
            if (response.status === 200) {

                /* console.log(workflows);
                const updatedList = response.data.data.workflowStates.map((item: any) => ({
                    ...item,
                    currentProgress: item.id === workflowStateId ? "In Progress" : ""
                })); */

                if (response.data.data.workflowStates.find((o: any) => o.id === workflowStateId && permissions.type === o.type)) {
                    setShowPublishBtnForPM(true);
                }


                const updatedList: any[] = response.data.data.workflowStates.map((state: any) => {
                    const matchedWorkflow = workflows.find(wf => wf.wStateId === state.id);

                    console.log(state.userInviteId === userId);

                    return {
                        ...state,
                        workflow: matchedWorkflow || null,
                        currentProgress: state.id === workflowStateId ? "In Progress" : ""
                    };
                });


                //setCoursePublished(updatedList.every(o => o.workflow.isActive === true))

                //console.log(updatedList);
                setCourseProgress(updatedList);

            }
        } catch (error) {
            console.log(error);
        }
    }


    const handleView = () => {
        navigate('/course-creation/Editor')
    }

    const courseWorkflowStatusUpdate = async (status: string) => {
        try {
            const response = await axiosInstance.patch(`/course/workflowStatusUpdate/${courseId}`, {
                "projectId": project.projectId,
                "status": status//"next"
            });

            if (response.status === 200) {
                console.log(response.data.data);
                init();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const init = async () => {
        setUnit([]);
        const response = await getCourseDetailsbyId(courseId);

        //console.log(userId, "login user id");
        //console.log(permissions);
        if (response) {
            if ('modules' in response) {
                response?.modules.map((module: any) => {
                    setUnit(prevData => [...prevData, module.moduleDetails.name]);
                });
            }

            const publishBtn = response.workflows.some((o: any) => o.userInviteId === userId && o.wStateId === response.workflowStateId);
            setShowPublishBtnForPM(publishBtn);

            if ('step' in response) setShowViewBtn(true);

            getWorkflowStatesList(response.workflowStateId, response.workflowId, response.workflows);
        }

    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div className="flex h-full gap-6">
            <div className="w-[68%] shadow-[0px_0px_15px_1px_rgba(0,_0,_0,_0.1)] p-5 bg-white overflow-y-auto custom-scrollbar rounded-2xl mb-4">
                <h2 className="text-xl font-bold text-[#1D1F23] mb-2">{courseCode} - {courseName}</h2>
                <div className="text-sm inline-flex items-center gap-2 text-[#2B3674] font-medium mb-6">
                    <span>Last updated Feb 23, 2025</span>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="6" height="6" rx="3" fill="#CBD5E1" />
                    </svg>
                    <span>By {username}</span>
                </div>

                <table className="w-[80%]">
                    <thead></thead>
                    <colgroup>
                        <col className="w-[15%]" />
                        <col className="w-[65%]" />
                    </colgroup>
                    <tbody className="text-sm">
                        <tr className="h-10">
                            <td className="font-bold">Course Code:</td>
                            <td>{courseCode}</td>
                        </tr>
                        <tr className="h-10">
                            <td className="font-bold">Course Title:</td>
                            <td>{courseName}</td>
                        </tr>
                        {unit.length > 0 && <tr className="h-10">
                            <td className="font-bold">Unit name:</td>
                            <td>
                                {unit.map((list, index) => (
                                    <p className="mb-2" key={index}>{list}</p>
                                ))}
                            </td>
                        </tr>}
                    </tbody>
                </table>

                {permissions.type === "publisher" &&
                    <>
                        {showPublishBtnForPM && <button
                            type="button"
                            onClick={() => courseWorkflowStatusUpdate('next')}
                            className="mt-4 font-bold rounded-full text-base px-10 py-2.5 text-center bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300 mr-2"
                        >
                            Publish now
                        </button>}
                        {showViewBtn && <button
                            type="button"
                            onClick={handleView}
                            className="text-[#4318FF] ms-2 bg-white border-[#4318FF]' font-bold border border-[#4318FF] focus:outline-none hover:bg-gray-200 focus:ring-1 focus:ring-[#4318FF] rounded-full text-base px-10 py-2.5 me-4"
                        >
                            View
                        </button>}
                    </>}
                {(permissions.type === 'admin' || permissions.type === 'projectManager') &&
                    <>
                        {showPublishBtnForPM && <button
                            type="button"
                            onClick={() => courseWorkflowStatusUpdate('next')}
                            className="mt-4 font-bold rounded-full text-base px-10 py-2.5 text-center bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300 mr-2"
                        >
                            Publish now
                        </button>}
                        {showViewBtn && <button
                            type="button"
                            onClick={handleView}
                            className="mt-4 font-bold rounded-full text-base px-10 py-2.5 text-center bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300 mr-2"
                        >
                            View
                        </button>}
                    </>}
                {(permissions.type === "author" || permissions.type === 'reviewer') &&
                    <>
                        {showViewBtn && <button
                            type="button"
                            onClick={handleView}
                            className="mt-4 font-bold rounded-full text-base px-10 py-2.5 text-center bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] text-white hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:ring-blue-300 mr-2"
                        >
                            View
                        </button>}
                    </>
                }
            </div>
            <div className="w-[32%] shadow-[0px_0px_15px_1px_rgba(0,_0,_0,_0.1)] bg-white overflow-y-auto custom-scrollbar rounded-2xl">
                <div className="p-5 mb-2 border border-[#F2F4FF]">
                    <h2 className="text-xl font-bold text-[#1D1F23] mb-2">Course content progress</h2>
                    <p className="text-[#40444D] text-sm">See your progress and what's ahead</p>
                </div>
                <div className="p-5 border-t border-[#F2F4FF]">
                    {courseProgress.map((status, index) => (
                        <React.Fragment key={index}>
                            <div className="shadow-[0px_8px_24px_0px_#959DA533] p-4 rounded-lg flex flex-col gap-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-semibold text-[#1D1F23]">{status.title}</span>
                                    {status.workflow?.updatedWorkflowStateBy?.isActive
                                        ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.88 11.44L7.16 9.72C7.01333 9.57333 6.82667 9.5 6.6 9.5C6.37333 9.5 6.18667 9.57333 6.04 9.72C5.89333 9.86667 5.82 10.0533 5.82 10.28C5.82 10.5067 5.89333 10.6933 6.04 10.84L8.32 13.12C8.48 13.28 8.66667 13.36 8.88 13.36C9.09333 13.36 9.28 13.28 9.44 13.12L13.96 8.6C14.1067 8.45333 14.18 8.26667 14.18 8.04C14.18 7.81333 14.1067 7.62667 13.96 7.48C13.8133 7.33333 13.6267 7.26 13.4 7.26C13.1733 7.26 12.9867 7.33333 12.84 7.48L8.88 11.44ZM10 18C8.89333 18 7.85333 17.79 6.88 17.37C5.90667 16.95 5.06 16.38 4.34 15.66C3.62 14.94 3.05 14.0933 2.63 13.12C2.21 12.1467 2 11.1067 2 10C2 8.89333 2.21 7.85333 2.63 6.88C3.05 5.90667 3.62 5.06 4.34 4.34C5.06 3.62 5.90667 3.05 6.88 2.63C7.85333 2.21 8.89333 2 10 2C11.1067 2 12.1467 2.21 13.12 2.63C14.0933 3.05 14.94 3.62 15.66 4.34C16.38 5.06 16.95 5.90667 17.37 6.88C17.79 7.85333 18 8.89333 18 10C18 11.1067 17.79 12.1467 17.37 13.12C16.95 14.0933 16.38 14.94 15.66 15.66C14.94 16.38 14.0933 16.95 13.12 17.37C12.1467 17.79 11.1067 18 10 18Z" fill="#05AB0B" />
                                        </svg>
                                        : <>
                                            {status.currentProgress !== '' && <span className="bg-[#D9CDFD] text-[#2B3674] text-xs px-2 py-1 rounded-md">{status.currentProgress}</span>}
                                        </>
                                    }
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#40444D] text-xs">{status?.workflow && 'updatedWorkflowStateBy' in status?.workflow ? status.workflow?.updatedWorkflowStateBy.userName : ''}</span>
                                    {status.currentProgress !== '' && <span className="text-[#40444D] text-xs">{convertDateFormat(status?.workflow && 'updatedWorkflowStateOn' in status?.workflow ? status?.workflow?.updatedWorkflowStateOn : status?.updatedAt)}</span>}
                                </div>
                            </div>
                            {index < (courseProgress.length - 1) && <svg className="ms-4" width="4" height="25" viewBox="0 0 4 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.50001 2C1.5597 18.0718 1.5254 21.472 1.50001 30.5" stroke="#4318FF" strokeWidth="3" strokeLinecap="square" strokeDasharray="6 8" />
                            </svg>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CourseContentProgress;