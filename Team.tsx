import React, { useState, useEffect } from 'react';
import search_icon from '../../../Assets/Icons/search_icon.svg';
import plus_white from '../../../Assets/Icons/plus_white.svg';
import * as Icons from '../../Icons';
import edit_icon from '../../../Assets/Icons/edit_icon.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../../Api/Axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface Member {
  userInviteId: string;
  name: string;
  email: string;
  roleName: string;
  projectName: string[];
  courseName: string[];
  status: string;
  isActive?: boolean;
}

const Team: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [expandedCourseRows, setExpandedCourseRows] = useState<{ [key: number]: boolean }>({});

  const permissions:any = useSelector((state : RootState) => state.login.hasPermissions);

  const navigate = useNavigate();

  const handleInvite = () => {
    navigate('/project-creation/Invite');
  };

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleCourseRow = (index: number) => {
    setExpandedCourseRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // useEffect(() => {
  //   const fetchMembers = async () => {
  //     try {
  //       const response = await axios.get('https://dev-apicoursebuilder.dictera.com/invite');   
  //       const fetchedData = response.data.data;
  //       setMembers(Array.isArray(fetchedData) ? [...fetchedData].reverse() : []);
  //       console.log("invite details", response.data.data);

  //     } catch (error) {
  //       console.error('Error ', error);
  //     }
  //   };

  //   fetchMembers();
  // }, []);


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axiosInstance.get('/invite');
        const fetchedData = Array.isArray(response.data.data) ? [...response.data.data].reverse() : [];

        const mergedMap: Record<string, Member> = {};

        fetchedData.forEach((item) => {
          const email = item.email;
          if (!mergedMap[email]) {
            mergedMap[email] = {
              userInviteId: item.userInviteId,
              name: item.name,
              email: item.email,
              roleName: item.roleName,
              projectName: item.projectName ? [item.projectName] : [],
              courseName: item.courseName ? [item.courseName] : [],
              status: item.isActive ? "Active" : "Invited",
              isActive: item.isActive,
            };
          } else {
            const currentRoles = mergedMap[email].roleName.split(',').map(role => role.trim().toLowerCase());
            if (!currentRoles.includes(item.roleName.toLowerCase())) {
              mergedMap[email].roleName += `, ${item.roleName}`;
            }
          }
        });

        const mergedList = Object.values(mergedMap);
        setMembers(mergedList);

      } catch (error) {
        console.error('Error ', error);
      }
    };

    fetchMembers();
  }, []);



  const filteredData = members.filter((member) => {
    const matchSearch =
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.email?.toLowerCase().includes(search.toLowerCase());

    // const matchStatus = statusFilter === 'All' || member.status === statusFilter;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && member.isActive === true) ||
      (statusFilter === 'Invited' && member.isActive === false);

    return matchSearch && matchStatus;

  });

  const handleView = (userInviteId: string) => {
    navigate(`/project-creation/UserDetails/${userInviteId}`);
  };

  const handleEdit = (userInviteId: string, name: string, email: string, roleName: string) => {
    navigate('/project-creation/EditUserDetails', {
      state: { userInviteId, name, email, roleName }
    });
  };




  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[60%] md:w-[40%] lg:w-[29%]">
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2 text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
            <img src={search_icon} alt="search" className="w-4 h-4" />
          </span>
        </div>

        <select
          className="border border-gray-300 text-sm rounded-md px-3 py-2 lg:w-[190px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status : Select</option>
          <option value="Invited">Invited</option>
          <option value="Active">Active</option>

        </select>

        <div className="flex w-full md:w-auto md:ml-auto gap-3">
          {permissions.AddnewUser && <button
            onClick={handleInvite}
            className="mt-5 w-[148px] h-[40px] text-[14px] text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] font-medium rounded-full flex items-center justify-center gap-2"
            style={{ width: "126px", height: "44px", marginTop: "-1%" }}
          >
            <img src={plus_white} alt="add" className="w-[9px] h-[9px]" />
            <span className="text-white text-[14px] font-medium leading-[100%] tracking-[-0.28px] font-['DM Sans']">
              Invite
            </span>
          </button>}
        </div>
      </div>

      {permissions.Canviewlist && <div className="overflow-x-auto">

        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-[#1D1F23] font-medium text-[14px]">
              <th className="px-3 py-2 w-[14%]">Name</th>
              <th className="px-3 py-2 w-[20%]">Email</th>
              <th className="px-3 py-2 w-[18%]">Role</th>
              <th className="px-3 py-2 w-[18%]">Assigned Project</th>
              <th className="px-3 py-2 w-[18%]">Assigned Course</th>
              <th className="px-3 py-2 w-[10%] text-center">Status</th>
              <th className="px-3 py-2 w-[8%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((member, index) => (
              <tr key={index} className="text-[#40444D] text-[14px]">
                <td className="px-3 py-3 w-[14%]">{member.name}</td>
                <td className="px-3 py-3 w-[16%] break-words whitespace-normal">{member.email}</td>
                <td className="px-3 py-3 w-[18%]">{member.roleName.charAt(0).toUpperCase() + member.roleName.slice(1)}</td>
                <td className="px-3 py-3 w-[18%]">
                  {member.projectName || '-'}
                  {/* {Array.isArray(member.projectName) && member.projectName.length > 0
                    ? member.projectName.join(', ')
                    : '-'} */}
                </td>
                {/* <td className="px-3 py-3 w-[18%]">
                  {Array.isArray(member.projectName) && member.projectName.length > 0 ? (
                    <div>
                      <span>{member.projectName[0]}</span>
                      {member.projectName.length > 1 && !expandedRows[index] && (
                        <span
                          className="text-[#5D5FEF] ml-1 cursor-pointer"
                          onClick={() => toggleRow(index)}
                        >
                          and +{member.projectName.length - 1}
                        </span>
                      )}
                      {expandedRows[index] && (
                        <div className="mt-1 text-sm text-gray-600 space-y-1">
                          {member.projectName.slice(1).map((name, i) => (
                            <div key={i}>{name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td> */}

                <td className="px-3 py-3 w-[18%]">
                  {member.courseName || '-'}
                  {/* {Array.isArray(member.courseNames) && member.courseNames.length > 0
                    ? member.courseNames.join(', ')
                    : '-'} */}

                </td>
                {/* <td className="px-3 py-3 w-[18%]">
                  {Array.isArray(member.courseNames) && member.courseNames.length > 0 ? (
                    <div>
                      <span>{member.courseNames[0]}</span>
                      {member.courseNames.length > 1 && !expandedCourseRows[index] && (
                        <span
                          className="text-[#5D5FEF] ml-1 cursor-pointer"
                          onClick={() => toggleCourseRow(index)}
                        >
                          and +{member.courseNames.length - 1}
                        </span>
                      )}
                      {expandedCourseRows[index] && (
                        <div className="mt-1 text-sm text-gray-600 space-y-1">
                          {member.courseNames.slice(1).map((name, i) => (
                            <div key={i}>{name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td> */}

                <td className="px-3 py-3 w-[10%] text-center">
                  {/* {member.status || 'Active'} */}
                  {member.isActive === false ? 'Invited' : 'Active'}
                </td>
                <td className="px-3 py-3 w-[6%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    {permissions.DeleteUser && <button title="Delete">
                      <img className="w-5 h-5" src={Icons.user_delete_icon} alt="delete" />
                    </button>}
                    <button title="Edit" onClick={() => handleEdit(member.userInviteId, member.name, member.email, member.roleName)}>
                      <img className="w-7 h-7" src={edit_icon} alt="edit" />
                    </button>
                    <button title="View" onClick={() => handleView(member.userInviteId)} >
                      <img className="align-text-top me-2 w-5 h-5" src={Icons.preview_eye_icon} alt="preview_eye_icon.svg" />
                    </button>
                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>}
    </div>
  );
};

export default Team;
