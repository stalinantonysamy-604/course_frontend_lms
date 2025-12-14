import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plus_white from '../../../Assets/Icons/plus_white.svg';
import AuthorScreen from './AuthorScreen';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../../Icons';
import PermissionCardGroup from './PermissionCardGroup';
import { RootState } from '../../../store';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../Api/Axios';


type Role = {
  roleId: number;
  roleName: string;
};

type Permission = {
  id: number;
  name?: string;
  selected?: boolean;
  actions: {
    id: number;
    name?: string;
    selected?: boolean;
  }[];
};



const RolesAndPermissions: React.FC = () => {
  const _permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

  const token = useSelector((state: RootState) => state.login.token);
  const [roles, setRoles] = useState<Role[]>([]);
  // const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRoleDetails, setSelectedRoleDetails] = useState<any>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [permissions, setPermissions] = useState([]);

  console.log("Token is", token);


  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get('/role', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // const allRoles = res.data.data || [];
      const allRoles = Array.isArray(res.data.data) ? res.data.data : [];
      setRoles(allRoles);
      console.log("roles loaded ", allRoles);

      // const authorRole = allRoles.find((role: any) =>
      //   role.roleName.toLowerCase() === 'author'
      // );

      //  if (authorRole) {
      //     setSelectedRoleId(authorRole.roleId);
      //   }

      if (allRoles.length > 0) {
        setSelectedRoleId(allRoles[0].roleId);
      }

    } catch (err) {
      console.error(err);
      setRoles([]);
    }
  };

  // const fetchRoleDetails = async (roleId: number) => {
  //   try {
  //     const res = await axios.get(`https://dev-apicoursebuilder.dictera.com/role/${roleId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setSelectedRoleDetails(res.data.data);
  //   } catch (err) {
  //     console.error(`Error fetching details for role ${roleId}:`, err);
  //   }
  // };

  const fetchPermissions = async () => {
    try {
      const productId = 14;
      const res = await axiosInstance.get(`/permission/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(res.data.data || []);
      console.log("Product id details", res.data.data);
    } catch (err) {
      console.error('Product id details :', err);
    }
  };


  useEffect(() => {
    fetchRoles();
  }, []);


  const fetchRoleDetailsAndPermissions = async (roleId: number) => {
    try {
      const productId = 14;

      const [roleRes, permissionsRes] = await Promise.all([
        axiosInstance.get(`/role/${roleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/permission/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const rolePermissions = roleRes.data.data?.permissions || [];
      const allPermissions = permissionsRes.data.data || [];

      // Merge logic
      const mergedPermissions = allPermissions.map((perm: any) => {
        const matched = rolePermissions.find((r: any) => r.id === perm.id);

        const mergedActions = perm.actions.map((action: any) => ({
          ...action,
          selected: matched?.actions?.some((a: any) => a.id === action.id) || false,
        }));

        return {
          ...perm,
          selected: !!matched,
          actions: mergedActions,
        };
      });

      setSelectedRoleDetails({ ...roleRes.data.data, permissions: mergedPermissions });
    } catch (error) {
      console.error('Error fetching role & permissions:', error);
    }
  };

  useEffect(() => {
    if (selectedRoleId !== null) {
      fetchRoleDetailsAndPermissions(selectedRoleId);
    }
  }, [selectedRoleId]);


  // useEffect(() => {
  //   if (selectedRoleId !== null) {
  //     fetchRoleDetails(selectedRoleId);
  //   }
  // }, [selectedRoleId]);

  const handlePermissionUpdate = (updatedPermissions: Permission[]) => {
    setSelectedRoleDetails((prev: any) => ({
      ...prev,
      permissions: updatedPermissions
    }));
  };

  const handleBackAndRefresh = () => {
    setShowAddRole(false);
    fetchRoles();
    if (selectedRoleId !== null) {
      fetchRoleDetailsAndPermissions(selectedRoleId);
    }
    
  };
  
 

  return (
    <div className="p-6 bg-white">
      {_permissions.ViewRolelist && <div className="flex gap-6">
        
        {!showAddRole && (
          <div className="w-[153px] flex flex-col gap-2 break-words">
            {roles.map((role: any) => (
              <button
                key={role.roleId}
                className={`px-4 py-2 rounded-[8px] text-left ${selectedRoleId === role.roleId
                  ? 'bg-[#4318FF] text-white'
                  : 'bg-[#fff] text-[#2B3674]'
                  }`}
                onClick={() => {
                  setSelectedRoleId(role.roleId);
                  setShowAddRole(false);
                }}
              >
                {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
              </button>
            ))}

            {_permissions.AddnewRoles && <button
              onClick={() => {
                setShowAddRole(true);
                setSelectedRoleDetails(null);
                fetchPermissions();
              }}
              className="mt-5 w-[148px] h-[40px] text-[14px] text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] font-medium rounded-full flex items-center justify-center gap-2"
            >
              <img src={plus_white} alt="add" className="w-[9px] h-[9px]" />
              <span className="text-white text-[14px] font-medium leading-[100%] tracking-[-0.28px] font-['DM Sans']">
                Add role
              </span>
            </button>}
          </div>
        )}

        
        <div className="flex-1">
          {showAddRole ? (
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              <div className="w-full lg:w-1/2 flex flex-col gap-6" style={{ width: "26%" }}>
                <div className="flex items-center gap-2">
                  <button
                    // onClick={() => {
                    //   setShowAddRole(false);
                    //   setNewRoleName('');
                    // if (roles.length > 0) {
                    //   setSelectedRoleId(roles[0].roleId);
                    // }
                    // }}
                    
                    onClick={() => {
                      setShowAddRole(false);
                      setNewRoleName('');
                      if (roles.length > 0) {
                        setSelectedRoleId(roles[0].roleId);
                        if (roles.length > 0) {
                          const firstId = roles[0].roleId;
                          setSelectedRoleId(firstId);
                          fetchRoleDetailsAndPermissions(firstId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }

                      }
                    }}
                    className="p-0 border-none bg-transparent"
                  >
                    <img src={Icons.left_arrow_icon} alt="Back" />
                  </button>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "#1D1F23" }}>New role</p>
                </div>

              </div>

              <div className="w-full">
                <PermissionCardGroup permissions={permissions} onBack={handleBackAndRefresh} />
              </div>
            </div>
          ) : selectedRoleDetails ? (
            <AuthorScreen
              roleData={selectedRoleDetails}
              onPermissionChange={handlePermissionUpdate}
            />
          ) : null}
        </div>
      </div>}
    </div>
  );
};

export default RolesAndPermissions;
