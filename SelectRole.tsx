import React, { useEffect, useState } from 'react';
import publisherIcon from '../../Assets/Images/publishIcon.svg';
import authorIcon from '../../Assets/Images/authorIcons.svg';
import projectleadIcon from '../../Assets/Images/projectMangeIcon.svg';
import reviewerIcon from '../../Assets/Images/ReviewIcon.svg';
import tickIcon from '../../Assets/Images/tickMark.svg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axiosInstance from '../../Api/Axios';

// Static role type to icon mapping
const roleTypeIcons = {
  author: authorIcon,
  publisher: publisherIcon,
  reviewer: reviewerIcon,
  projectManager: projectleadIcon,
};

type DynamicRole = {
  key: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  id: string | number;
};

const SelectRole: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [dynamicRoles, setDynamicRoles] = useState<DynamicRole[]>([]);
  const [loading, setLoading] = useState(true);
  const roles = useSelector((state: RootState) => state.login.rolesData);
  const userName = useSelector((state: RootState) => state.login.username);
  const [searchParams] = useSearchParams();

  const handleContinue = async () => {
    if (!selectedRole) return;

    // Find the selected role using the unique key (which includes role_id)
    const selectedRoleData = dynamicRoles.find(role => role.key === selectedRole);
    const roleType = selectedRoleData?.type;
    localStorage.setItem('selectedRoleId', String(selectedRoleData?.id));
        localStorage.setItem('selectedRoleName', String(selectedRoleData?.title));
    // Navigate based on role type
    if (roleType === 'author') {
      navigate('/project-creation/AuthorDashboard');
    } else if (roleType === 'reviewer') {
      navigate('/project-creation/ReviewerDashboard');
    } else if (roleType === 'publisher') {
      navigate('/project-creation/PmDashboard');
    } else if (roleType === 'projectManager') {
      navigate('/project-creation/ProjectCards');
    } else {
      navigate('/project-creation');
    }
  };

  useEffect(() => {
    const fetchRoleDetails = async () => {
      if (roles && Array.isArray(roles)) {
        try {
          setLoading(true);

          // Get token
          const tokenValue = searchParams.get("t");
          const savedToken = sessionStorage.getItem('authToken');
          const tokenToUse = tokenValue || savedToken;

          if (!tokenToUse) {
            console.log("No token found in URL params or sessionStorage.");
            setLoading(false);
            return;
          }

          // Extract role IDs
          const roleIds = roles.map((role) => role.role_id);

          // Fetch role details for all role IDs
          const roleDetailsPromises = roleIds.map(async (roleId) => {
            const response = await axiosInstance.get(
              `https://dev-apicoursebuilder.dictera.com/role/${roleId}`,
              {
                headers: { Authorization: `Bearer ${tokenToUse}` },
              }
            );
            return response.data.data;
          });

          const roleDetailsArray = await Promise.all(roleDetailsPromises);

          // Transform the API data into the format needed for the component
          const transformedRoles = roleDetailsArray.map((roleDetail, index) => ({
            key: `${roleDetail.type}_${roleDetail.roleId || index}`,
            title: roleDetail.name,
            description: roleDetail.description,
            icon: roleTypeIcons[roleDetail.type as keyof typeof roleTypeIcons],
            type: roleDetail.type,
            id: roleDetail.roleId
          }));

          setDynamicRoles(transformedRoles);

        } catch (error) {
          console.error("Error fetching role details:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRoleDetails();
  }, [roles, searchParams]);

  if (loading) {
    return (
      <div className="px-8 pb-5 flex flex-col justify-center h-[calc(100vh-2px)] overflow-auto scrollbar-big">
        <div className="flex flex-col justify-center items-center">
          <div className="text-lg">Loading roles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-5 flex flex-col justify-center h-[calc(100vh-2px)] overflow-auto scrollbar-big">

      <div className="flex flex-col justify-center items-center">
        <div className="font-sans font-semibold text-[32px] leading-12 -tracking-wider align-middle">
          Welcome,<span className="text-[#4318FF]"> {userName}</span>
        </div>

        <span className="font-sans font-semibold text-base leading-7 tracking-normal text-[#1D1F23] mb-7 block">
          Please select your role to start with course builder
        </span>
      </div>
      <div className="w-full max-w-[530px] p-6 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(149,157,165,0.2)] mx-auto">

        <div className="space-y-5">
          {dynamicRoles.map((role) => (
            <div
              key={role.key}
              onClick={() => setSelectedRole(role.key)}
              className={`rounded-lg shadow-[0px_8px_24px_0px_rgba(149,157,165,0.2)] flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 ease-in-out border hover:border-[#4318FF] ${selectedRole === role.key
                  ? 'border-[#4318FF] bg-white text-black'
                  : ''
                }`}
             >
              <img src={role.icon} alt={role.title} className={`${role.type === 'projectManager' ? 'w-12 h-11' : 'w-10 h-10'}`} />
              <div className="flex-1">
                <h3 className={`${selectedRole === role.key ? 'text-[#4318FF] font-semibold' : 'text-[#1D1F23] font-semibold'}`}>{role.title}</h3>
              </div>
              {selectedRole === role.key && (
                <div className="text-violet-600 text-xl"><img src={tickIcon} alt="tick icon" /></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex-1 mt-6 flex gap-2">
          <button
            type="button"
            className="text-white w-[112px] h-[32px] bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm text-center flex items-center justify-center me-2 mb-2"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;