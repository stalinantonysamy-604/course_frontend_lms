import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
// import 'dictera-workflow/dist/styles/style.css';
import 'reactflow/dist/style.css';
import { WorkflowEditor, WorkflowEditorRef } from 'dictera-workflow';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../../Api/Axios';
import * as Icons from '../../Icons';



interface IRole {
  roleId: number;
  roleName: string;
  id: number;
  r_id: number;
  name: string;
  description: string;
  clientId: number;
  u_uniqueId: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}


const WorkFlow = () => {
  const token = useSelector((state: RootState) => state.login.token);
  const [isDefault, setIsDefault] = useState(false);
  const location = useLocation();
  const workflowId = location.state?.workflowId;
  const workflowTitle = location.state?.workflowTitle;
  const [workflowName, setWorkflowName] = useState(workflowTitle || '');
  const [showRoles] = useState(false);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);


  console.log(roles);
  const ref = useRef<WorkflowEditorRef>(null);

  useEffect(()=>{
        console.log("ref", ref.current); 
  }, [ref])

  const getAllRole = async () => {
    try {
      const res = await axiosInstance.get('/role', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allRoles = Array.isArray(res.data.data) ? res.data.data : [];
      setRoles(allRoles);
      console.log("allroles", allRoles);

    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  }

  useEffect(() => {
    getAllRole();
  }, [])


  console.log("workflowid", workflowId);
  console.log("workflowTitle", workflowTitle);

  //console.log("token is ", token)

const addNode = (role: IRole) => {
  if (ref.current) {
    ref.current.processId?.(role);
    // Add this role to nodes
    setNodes((prevNodes) => [...prevNodes, { data: { roleId: role.roleId } }]);
  }
};


  return (

    <div className="bg-[#FFF] p-6 rounded-[16px] shadow-sm" style={{ marginTop: "2%" }}>
      <div>

        <div className="flex items-center gap-2 mb-4">
          <img
            src={Icons.left_arrow_icon}
            alt="Back"
            className="cursor-pointer w-5 h-5"
            onClick={() => window.history.back()}
          />
          <h2 className="text-[20px] leading-[28px] ml-2 font-bold text-[#1D1F23] font-dmSans">Create a new workflow</h2>
        </div>


        <label className="text-[#40444D] font-semibold text-[14px] leading-[22px] font-dmSans">
          Name
        </label>


        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            className="mt-2 bg-gray-50 border w-[322px] h-[40px] border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            placeholder="Workflow name"
            value={location.state?.workflowTitle}
            readOnly
          />

          <label className="mt-2 ml-2 flex items-center gap-2 text-[14px] font-semibold leading-[22px] text-[#40444D] font-dmSans">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-[18px] h-[18px] flex-shrink-0"
            />
            Set as default workflow
          </label>
        </div>


        <label className="text-[#40444D] text-[14px] font-semibold leading-[22px] font-dmSans">
          Create your workflow
        </label>

        <div className="WorkflowViewer mt-2 w-[516px] flex-shrink-0 rounded-[12px] shadow-custom  mb-6">
          <WorkflowEditor
            ref={ref}
            token={token}
            workflow_id={String(workflowId)}
            enviroment={'dev'}
            showRoles={true}
          />
        </div>

        {/* <button
          type="submit"
          className="mt-1 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-10 py-2.5 text-center"
        >
          Create
        </button> */}

        {/* {!showRoles &&

          <>
            <p className="text-sm text-gray-500 mb-4">
              Please add role to start creating your workflow.
            </p>

            <div className="gap-4 mb-6" style={{ width: '450px' }}>
              {roles.map((role) => {
                const isDisabled = nodes.some(
                  (node) => node.data.roleId === role.roleId
                );

                return (
                  <button
                    key={role.roleId}
                    onClick={() => !isDisabled && addNode(role)}
                    disabled={isDisabled}
                    className={`px-5 py-2 border font-medium rounded-full mr-2 mb-2 transition ${isDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-[#4318FF] text-[#4318FF] hover:bg-[#f0f0ff]'
                      }`}
                  >
                    {role.roleName}
                  </button>
                );
              })}
            </div>



          </>
        } */}


      </div>
    </div>


  )
}

export default WorkFlow