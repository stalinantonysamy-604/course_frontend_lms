import React from 'react';
import vector_icon from '../../../Assets/Icons/vector_icon.svg';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../../Api/Axios';


interface Action {
  id: number;
  name: string;
  selected: boolean;
  description?: string;
}

interface Permission {
  id: number;
  name: string;
  selected: boolean;
  description?: string;
  actions: Action[];
}

interface RoleData {
  roleId: string;
  name: string;
  type: string;
  description: string;
  permissions: Permission[];
}

interface AuthorScreenProps {
  roleData: RoleData;
  onPermissionChange: (updatedPermissions: Permission[]) => void;
}

const AuthorScreen: React.FC<AuthorScreenProps> = ({ roleData, onPermissionChange }) => {
  const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

  if (!roleData) return <div>Loading...</div>;

  //   const handlePermissionToggle = (permId: number) => {
  //     const updatedPermissions = roleData.permissions.map((perm) =>
  //       perm.id === permId ? { ...perm, selected: !perm.selected, actions: perm.actions.map(action => ({ ...action, selected: perm.selected })) } : perm
  //     );
  //     onPermissionChange(updatedPermissions);
  // };

  // const handleActionToggle = (permId: number, actionId: number) => {
  //     const updatedPermissions = roleData.permissions.map((perm) => {
  //       if (perm.id === permId) {
  //         const updatedActions = perm.actions.map((action) =>
  //           action.id === actionId ? { ...action, selected: !action.selected } : action
  //         );
  //         return { ...perm, actions: updatedActions };
  //       }
  //       return perm;
  //     });
  //     onPermissionChange(updatedPermissions);
  // };


  const allowedPermissionsByType: { [key: string]: string[] } = {
    author: ['Can Author', 'Global Course Actions'],
    publisher: ['Can Publish', 'Global Course Actions'],
    reviewer: ['Can Review', 'Global Course Actions'],
    projectmanager: [],
  };

  const disabledActionsByRoleType: { [key: string]: { [permissionName: string]: string[] } } = {
    author: {
      'Global Course Actions': ['Create/edit Course Attributes (Name description image)'],
    },
    publisher: {
      'Global Course Actions': [
        'Accept or reject suggestions',
        'Reply to suggestions',
        'Add comments for bugs',
        'Change status of bugs',
        'Add Meta Tags',
        'Add comments',
        'Check Plagiarism',
        'Create/edit Course Attributes (Name description image)',
      ],
    },
    reviewer: {
      'Global Course Actions': [
        'Accept or reject suggestions',
        'Create/edit Course Attributes (Name description image)',
      ],
    },
  };


  const roleType = roleData.type?.toLowerCase();
  console.log("roleType", roleType);

  const handlePermissionToggle = (permId: number) => {
    const updatedPermissions = roleData.permissions.map((perm) => {
      if (perm.id === permId) {
        const isSelected = perm.selected;

        const disabledActions =
          disabledActionsByRoleType[roleType]?.[perm.name] || [];

        return {
          ...perm,
          selected: !isSelected,
          actions: perm.actions.map((action) => {
            // const isDisabledAction = disabledActions.includes(action.name);
             const isDisabledAction = disabledActions
              .map((a) => a.trim().toLowerCase())
              .includes(action.name.trim().toLowerCase());
            return {
              ...action,
              selected: !isSelected
                ? !isDisabledAction
                : false,
            };
          }),
        }
      }
      return perm;
    });

    onPermissionChange(updatedPermissions);
  };


  const handleActionToggle = (permId: number, actionId: number) => {

    const updatedPermissions = roleData.permissions.map((perm) => {

      if (perm.id === permId) {
        const updatedActions = perm.actions.map((action) =>
          action.id === actionId
            ? { ...action, selected: !action.selected }
            : action
        );

        const anyActionSelected = updatedActions.some((a) => a.selected);

        return {
          ...perm,
          selected: anyActionSelected,
          actions: updatedActions,
        };
      }
      return perm;
    });

    onPermissionChange(updatedPermissions);
  };


  const token = useSelector((state: RootState) => state.login.token);

  const handleUpdateRole = async () => {
    try {
      const { roleId, name, type, description, permissions } = roleData;

      const formattedPermissions = permissions
        .filter((perm) => perm.selected || perm.actions.some((a) => a.selected))
        .map((perm) => ({
          id: perm.id,
          name: perm.name,
          description: perm.description || '',
          status: perm.selected ? 1 : 0,
          actions: perm.actions
            .filter((a) => a.selected)
            .map((a) => ({
              id: a.id,
              name: a.name,
              description: a.description || '',
              status: a.selected ? 1 : 0,
            })),
        }));

      const payload = {
        name,
        type,
        description,
        permissions: formattedPermissions,
      };

      await axiosInstance.put(
        `/role/update/${roleId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //alert('Role updated successfully');
      toast.success('Role updated successfully');
    } catch (err: any) {
      console.error('Error updating role:', err);
      //alert(`Failed to update role: ${err.response?.data?.message || err.message}`);
      toast.error(`Failed to update role: ${err.response?.data?.message || err.message}`);

    }
  };



  const middleIndex = Math.ceil(roleData.permissions.length / 2);
  const leftPermissions = roleData.permissions.slice(0, middleIndex);
  const rightPermissions = roleData.permissions.slice(middleIndex);

  // const renderPermissionCard = (perm: Permission) => (
  //   <div
  //     key={perm.id}
  //     className="border p-4 relative"
  //     style={{
  //       borderRadius: '8px',
  //       boxShadow: '0px 8px 24px 0px rgba(149, 157, 165, 0.20)',
  //     }}
  //   >
  //     <span className="absolute right-2" style={{ width: '20px', height: '20px' }}>
  //       <img src={vector_icon} alt="info" />
  //     </span>

  //     <h2 className="text-[#40444D] font-dm text-[16px] leading-[28px] font-semibold mb-4 flex items-center gap-2">
  //       <input
  //         type="checkbox"
  //         className="mr-2"
  //         style={{
  //           border: '2px solid #4318FF',
  //           borderRadius: '4px',
  //           width: '18px',
  //           height: '18px',
  //           backgroundColor: perm.selected ? '#4318FF' : 'transparent',
  //         }}
  //         checked={perm.selected}
  //         onChange={() => handlePermissionToggle(perm.id)}
  //       />
  //       {perm.name}
  //     </h2>

  //     <div className="flex flex-col gap-2 ml-[30px]">
  //       {perm.actions.map((action) => (
  //         <div
  //           key={action.id}
  //           className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm"
  //         >
  //           <input
  //             type="checkbox"
  //             className="mr-2"
  //             style={{
  //               border: '2px solid #4318FF',
  //               borderRadius: '4px',
  //               width: '18px',
  //               height: '18px',
  //               backgroundColor: action.selected ? '#4318FF' : 'transparent',
  //             }}
  //             checked={action.selected}
  //             onChange={() => handleActionToggle(perm.id, action.id)}
  //           />
  //           {action.name}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  const renderPermissionCard = (perm: Permission) => {
    //const { type } = roleData;
    //console.log("roledata", type);
    //  const isDisabled =
    //     roleType === 'projectmanager'
    //       ? false
    //       : roleType && !allowedPermissionsByType[roleType]?.includes(perm.name);

    const isPermissionDisabled =
      roleType !== 'projectmanager' &&
      roleType &&
      !allowedPermissionsByType[roleType]?.includes(perm.name);

    const disabledActions =
      disabledActionsByRoleType[roleType]?.[perm.name] || [];


    return (
      <div
        key={perm.id}
        className="border p-4 relative"
        style={{
          borderRadius: '8px',
          boxShadow: '0px 8px 24px 0px rgba(149, 157, 165, 0.20)',
          opacity: isPermissionDisabled ? 0.5 : 1,
        }}
      >
        <span className="absolute right-2" style={{ width: '20px', height: '20px' }}>
          <img src={vector_icon} alt="info" />
        </span>

        <h2 className="text-[#40444D] font-dm text-[16px] leading-[28px] font-semibold mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            className="mr-2"
            disabled={!!isPermissionDisabled}
            style={{
              border: '2px solid #4318FF',
              borderRadius: '4px',
              width: '18px',
              height: '18px',
              backgroundColor: perm.selected ? '#4318FF' : 'transparent',
            }}
            checked={perm.selected}
            onChange={() => handlePermissionToggle(perm.id)}
          />
          {perm.name}
        </h2>

        <div className="flex flex-col gap-2 ml-[30px]">
          {perm.actions.map((action) => {
            const isActionDisabled =
              isPermissionDisabled ||
              disabledActions.map((a) => a.trim()).includes(action.name.trim());

            return (
              <div
                key={action.id}
                className="text-[#40444D] font-normal text-[15px] leading-[28px] font-dm"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  disabled={isActionDisabled}
                  style={{
                    border: '2px solid #4318FF',
                    borderRadius: '4px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: action.selected ? '#4318FF' : 'transparent',
                    opacity: isActionDisabled ? 0.5 : 1,

                  }}
                  checked={action.selected}
                  onChange={() => handleActionToggle(perm.id, action.id)}

                />
                {action.name}
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {leftPermissions.map(renderPermissionCard)}
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {rightPermissions.map(renderPermissionCard)}
        </div>
      </div>

      <div className="w-full flex justify-center lg:justify-start mt-2">
        {permissions.UpdateRolesandPermissions && <button
          type="button"
          className="text-white bg-gradient-to-r from-[#868CFF] to-[#4318FF] hover:from-[#6A7FFF] hover:to-[#2A1CFF] focus:ring-1 focus:outline-none font-medium rounded-full text-sm px-10 py-2.5"
          onClick={handleUpdateRole}
        >
          Update
        </button>}
        <ToastContainer />
      </div>
    </div>
  );
};

export default AuthorScreen;
