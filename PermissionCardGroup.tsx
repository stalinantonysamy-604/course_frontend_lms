import React, { useState, useEffect } from 'react';
import axios from 'axios';
import vector_icon from '../../../Assets/Icons/vector_icon.svg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import axiosInstance from '../../../Api/Axios';



interface PermissionCardGroupProps {
  permissions: {
    id: number;
    name: string;
    actions: {
      id: number;
      name: string;
    }[];
  }[];
  onBack?: () => void;
}

const PermissionCardGroup: React.FC<PermissionCardGroupProps> = ({ permissions, onBack }) => {
  const token = useSelector((state: RootState) => state.login.token);
  const [roleType, setRoleType] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [roleNameError, setRoleNameError] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});
  const navigate = useNavigate();
  const [existingRoleNames, setExistingRoleNames] = useState<string[]>([]);



  const handlePermissionToggle = (permId: number) => {
    setSelectedPermissions((prev) => {

      const isCurrentlyChecked = prev[permId]?.length > 0;

      if (isCurrentlyChecked) {

        const updated = { ...prev };
        delete updated[permId];
        return updated;
      }
      else {

        const allActions = permissions.find((p) => p.id === permId)?.actions.map((a) => a.id) || [];
        return { ...prev, [permId]: allActions };
      }

    });
  };

  const handleActionToggle = (permId: number, actionId: number) => {
    setSelectedPermissions((prev) => {
      const current = prev[permId] || [];
      let updatedActions;

      if (current.includes(actionId)) {
        updatedActions = current.filter((id) => id !== actionId);
      } else {
        updatedActions = [...current, actionId];
      }

      const updated = { ...prev };
      if (updatedActions.length === 0) {
        delete updated[permId];
      } else {
        updated[permId] = updatedActions;
      }

      return updated;

    });
  };

  useEffect(() => {
    const fetchExistingRoles = async () => {
      try {
        const response = await axiosInstance.get('/role', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const roleNames = response.data.map((role: any) => role.roleName.toLowerCase());
        setExistingRoleNames(roleNames);
      } catch (error) {
        console.error('Error fetching existing roles:', error);
      }
    };

    fetchExistingRoles();
  }, []);

  const handleRoleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewRoleName(value);

    const formattedValue = value.trim().toLowerCase();
    if (formattedValue && existingRoleNames.includes(formattedValue)) {
      setRoleNameError('Role name already exists.');
    } else {
      setRoleNameError('');
    }

  };


  const handleCreateRole = async () => {

    const trimmedRoleName = newRoleName.trim().toLowerCase();

    if (!trimmedRoleName.trim()) {
      toast.error("Role name is required.");
      return;
    }

    // if (!roleType.trim()) {
    //   toast.error('Please select a role type.');
    //   return;
    // }

    // const trimmedRoleName = newRoleName.trim();
    // const capitalizedRegex = /^[A-Z].*$/;

    // if (!trimmedRoleName.trim()) {
    //   toast.error("Role name is required.");
    //   return;
    // }

    // if (!capitalizedRegex.test(trimmedRoleName)) {
    //   toast.error("First letter of Role name must be capital. (e.g., Author)");
    //   return;
    // }

    // if (existingRoleNames.includes(trimmedRoleName.toLowerCase())) {
    //   toast.error("Role name already exists.");
    //   return;
    // }

    // if (formattedValue && existingRoleNames.includes(formattedValue)) {
    //   setRoleNameError('Role name already exists.');
    // }

    if (Object.keys(selectedPermissions).length === 0) {
      toast.error('Please select at least one permission with actions.');
      return;
    }

    // validation
    // const hasInvalidPermission = permissions.some(
    //   (perm) =>
    //     selectedPermissions.hasOwnProperty(perm.id) && selectedPermissions[perm.id]?.length === 0
    // );

    // if (hasInvalidPermission) {
    //   toast.error('Please select at least one action for each selected permission.');
    //   return;
    // }

    const payloadPermissions = permissions
      .filter((perm) => selectedPermissions[perm.id]?.length > 0)
      .map((perm) => ({
        id: perm.id,
        name: perm.name,
        description: perm.name,
        status: 1,
        actions: perm.actions
          .filter((act) => selectedPermissions[perm.id]?.includes(act.id))
          .map((act) => ({
            id: act.id,
            name: act.name,
            description: act.name,
            status: 1,
          })),
      }));

    // roleType
    const payload = {
      type: roleType,
      name: trimmedRoleName,
      description: `This is ${roleType} role`,
      permissions: payloadPermissions,
    };

    console.log('Payload to submit:', payload);

    try {
      const res = await axiosInstance.post(
        '/role/creation',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('The role has been created successfully!');
      console.log("role created successfully");
      setNewRoleName('');
      setSelectedPermissions({});

      // setTimeout(() => {
      //   navigate('/project-creation/RolesAndPermissions', { state: { activeTab: 'roles' } });
      // }, 2000);

      setTimeout(() => {
        if (typeof onBack === 'function') {
          onBack();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 2000);


    } catch (err) {
      console.error('Error creating role:', err);
      toast.error('Error creating role. Please try again.');
    }
  };

  // const isDisabledGroup = (permName: string, roleType: string) => {
  //   const disableFor = ['author', 'publisher', 'reviewer'];
  //   const groupsToDisable = ['Roles Access', 'Team Management', 'Workflow', 'Project',];
  //   return disableFor.includes(roleType) && groupsToDisable.includes(permName);
  // };

  const isDisabledGroup = (permName: string, roleType: string) => {
    const roleBasedDisabledPermissions: Record<string, string[]> = {
      author: [
        'Can Publish',
        'Can Review',
        'Roles Access',
        'Team Management',
        'Workflow',
        'Project'
      ],
      publisher: [
        'Can Author',
        'Can Review',
        'Roles Access',
        'Team Management',
        'Workflow',
        'Project'
      ],
      reviewer: [
        'Can Author',
        'Can Publish',
        'Roles Access',
        'Team Management',
        'Workflow',
        'Project'
      ],
    };

    const disabledGroups = roleBasedDisabledPermissions[roleType?.toLowerCase()] || [];

    return disabledGroups.some(
      (disabledName) => disabledName.toLowerCase() === permName.toLowerCase()
    );
  };

  const isDisabledAction = (permName: string, actionName: string, roleType: string) => {
    const isGlobalCourseAction = permName.toLowerCase() === 'global course actions';
    const isTargetAction = actionName.toLowerCase() === 'create/edit course attributes (name description image)';
    const isAcceptRejectSuggestions = actionName.toLowerCase() === 'accept or reject suggestions';

    const allowedPublisherActions = [
      'view course content',
      'view course toc',
    ];


    if ((roleType.toLowerCase() === 'author' || roleType.toLowerCase() === 'reviewer') && isGlobalCourseAction && isTargetAction) {
      return true;
    }

    if (roleType.toLowerCase() === 'reviewer' && isGlobalCourseAction && isAcceptRejectSuggestions) {
      return true;
    }

    if (roleType.toLowerCase() === 'publisher' && isGlobalCourseAction) {
      return !allowedPublisherActions.includes(actionName.toLowerCase());
    }

    return false;
  };

  useEffect(() => {
    const lowerRole = roleType.toLowerCase();

    if (lowerRole === 'author' || lowerRole === 'reviewer' || lowerRole === 'publisher') {
      const targetPermission = permissions.find(
        (perm) => perm.name.toLowerCase() === 'global course actions'
      );

    if (targetPermission) {
      setSelectedPermissions((prev) => {
        let updatedActions = [...(prev[targetPermission.id] || [])];

        
        const createEditAction = targetPermission.actions.find(
          (action) =>
            action.name.toLowerCase() === 'create/edit course attributes (name description image)'
        );

        const rejectSuggestionsAction = targetPermission.actions.find(
          (action) =>
            action.name.toLowerCase() === 'accept or reject suggestions'
        );

        if (lowerRole === 'author' && createEditAction) {
          updatedActions = updatedActions.filter(id => id !== createEditAction.id);
        }

        if (lowerRole === 'reviewer') {
          if (createEditAction) {
            updatedActions = updatedActions.filter(id => id !== createEditAction.id);
          }
          if (rejectSuggestionsAction) {
            updatedActions = updatedActions.filter(id => id !== rejectSuggestionsAction.id);
          }
        }

        if (lowerRole === 'publisher') {
          const allowed = ['view course content', 'view course toc'];
          const allowedIds = targetPermission.actions
            .filter((action) =>
              allowed.includes(action.name.toLowerCase())
            )
            .map((action) => action.id);

          updatedActions = updatedActions.filter(id => allowedIds.includes(id));
        }

        if (updatedActions.length === 0) {
          const updated = { ...prev };
          delete updated[targetPermission.id];
          return updated;
        }

        return {
          ...prev,
          [targetPermission.id]: updatedActions,
        };
      });
    }
  }

  }, [roleType, selectedPermissions, permissions]);


  const renderPermissions = () =>
    permissions.map((perm) => {
      const disabled = isDisabledGroup(perm.name, roleType);
      return (
        <div
          key={perm.id}
          className="border p-4 relative"
          style={{
            borderRadius: '8px',
            background: "#FFF",
            boxShadow: '0px 8px 24px 0px rgba(149, 157, 165, 0.20)',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          <span className="absolute right-2">
            <img src={vector_icon} alt="info" className="w-5 h-5" />
          </span>

          <h2 className="text-[#40444D] font-dm text-[16px] leading-[28px] font-semibold mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              onChange={() => !disabled && handlePermissionToggle(perm.id)}
              checked={!!selectedPermissions[perm.id]?.length}
              disabled={disabled}
              style={{
                appearance: 'none',
                width: '18px',
                height: '18px',
                border: '2px solid #4318FF',
                borderRadius: '4px',
                backgroundColor: selectedPermissions[perm.id]?.length ? '#4318FF' : 'transparent',
                position: 'relative',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            />
            {perm.name}
          </h2>

          <div className="flex flex-col gap-2 ml-[30px]">
            {perm.actions.map((action) => {
              const isActionDisabled = isDisabledAction(perm.name, action.name, roleType);

              return (
                <div key={action.id} className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm">
                  <input
                    type="checkbox"
                    onChange={() => !isActionDisabled && handleActionToggle(perm.id, action.id)}
                    checked={selectedPermissions[perm.id]?.includes(action.id) || false}
                    disabled={isActionDisabled}
                    style={{
                      appearance: 'none',
                      width: '18px',
                      height: '18px',
                      border: '2px solid #4318FF',
                      borderRadius: '4px',
                      backgroundColor: selectedPermissions[perm.id]?.includes(action.id) ? '#4318FF' : 'transparent',
                      cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                      marginRight: '8px',
                      opacity: isActionDisabled ? 0.5 : 1,
                    }}
                  />
                  {action.name}
                </div>
              );
            })}

          </div>
        </div>
      );
    });

  useEffect(() => {
    if (!permissions.length) return;

    const newSelected: Record<number, number[]> = {};

    if (roleType === 'author') {
      permissions.forEach((perm) => {
        if (perm.name.toLowerCase().includes('write') || perm.name.toLowerCase().includes('author') || perm.name === 'Global Course Actions') {
          newSelected[perm.id] = perm.actions.map((a) => a.id);
        }
      });
    }

    if (roleType === 'publisher') {
      permissions.forEach((perm) => {
        if (perm.name.toLowerCase().includes('publish') || perm.name === 'Global Course Actions' ) {
          newSelected[perm.id] = perm.actions.map((a) => a.id);
        }
      });
    }

    if (roleType === 'reviewer') {
      permissions.forEach((perm) => {
        if (perm.name.toLowerCase().includes('review') || perm.name === 'Global Course Actions') {
          newSelected[perm.id] = perm.actions.map((a) => a.id);
        }
      });
    }

    if (roleType === 'projectManager') {
      permissions.forEach((perm) => {
        newSelected[perm.id] = perm.actions.map((a) => a.id);
      });
    }


    setSelectedPermissions(newSelected);
  }, [roleType, permissions]);



  return (
    <div className="w-full">
      <label style={{ color: "#1D1F23", fontSize: "14px", fontWeight: "600" }}>Role Name</label>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={newRoleName}
          onChange={handleRoleNameChange}
          placeholder="Type Role Name"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          style={{ width: "400px" }}
        />
        {/* {roleNameError && (
    <p className="text-red-500 text-sm mt-1">{roleNameError}</p>
  )} */}

        <select
          value={roleType}
          onChange={(e) => setRoleType(e.target.value)}
          // onChange={(e) => { setRoleType(e.target.value); console.log(e.target.value); }}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          style={{ width: "400px" }}
        >
          <option value="" className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm">Select Type</option>
          <option value="author" className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm">Author</option>
          <option value="publisher" className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm">Publisher</option>
          <option value="reviewer" className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm">Reviewer</option>
          <option value="projectManager" className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm">Project Manager</option>
        </select>

      </div>

      {/* <div className="grid lg:grid-cols-2 gap-6 items-start">
        {renderPermissions()}
        </div> */}


      <div className="flex flex-col lg:flex-row gap-6">

        <div className="lg:w-1/2 flex flex-col gap-6">
          {renderPermissions().slice(0, Math.ceil(renderPermissions().length / 2))}
        </div>


        <div className="lg:w-1/2 flex flex-col gap-6">
          {renderPermissions().slice(Math.ceil(renderPermissions().length / 2))}
        </div>

      </div>


      <button
        type="button"
        onClick={handleCreateRole}
        className="mt-5 text-white bg-gradient-to-r from-[#868CFF] to-[#4318FF] hover:from-[#6A7FFF] hover:to-[#2A1CFF] focus:ring-1 focus:outline-none font-medium rounded-full text-sm px-10 py-2.5"
      >
        Create
      </button>

      <ToastContainer />

    </div>
  );
};

export default PermissionCardGroup;

// toast.success('Success message', {
//   position: 'top-right',
//   autoClose: 4000,
// });
