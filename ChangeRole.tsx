import React, { useState } from "react";
import closeIcon from '../../Assets/Images/crossIcon.svg';
import logOutIcon from '../../Assets/Images/LogoutIco.svg';
import userIcon from '../../Assets/Images/userIco.svg';
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const ChangeRole: React.FC = () => {
  const userName = useSelector((state: RootState) => state.login.username);
  const userEmail = useSelector((state: RootState) => state.login.email);
  const userProfileImage = useSelector((state: RootState) => state.login.userImage);
  const userRole = localStorage.getItem('selectedRoleName');
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="absolute top-1 z-50">
      <div className="absolute right-6 top-[-20px] triangle-large"></div>
      <div className="bg-white rounded-2xl shadow-2xl w-80 border border-gray-100">
        <div className="flex mb-6 items-center p-3 border-b border-[#E4E7EB] justify-end">
          <button
            onClick={() => setIsVisible(false)}
            className="p-2"
          >
            <img src={closeIcon} alt="close" className="cursor-pointer bg-white" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="mb-4">
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="Profile"
                className="w-[106px] h-[106px] rounded-full mx-auto object-cover shadow-lg"
              />
            ) : (
              <div className="w-[106px] h-[106px] rounded-full mx-auto bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="font-bold mb-1 text-md leading-[24px] text-[#2B3674]">
            Hi, {userName}!
          </h2>
          <p className="text-sm text-[#40444D] font-normal">
            {userRole}
          </p>

        </div>

        <div className="space-y-2 ml-5 mr-5 mb-6">
          <a
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open('https://dev_suite.dictera.com/settings');
              setTimeout(() => {
                window.location.href = 'https://dev_suite.dictera.com';
              }, 1000);

            }}

            className="w-full cursor-pointer flex items-center space-x-3 p-3 rounded-xl text-left group shadow-[0px_8px_24px_0px_#959DA533]"
          >
            <div className="p-2">
              <img src={userIcon} alt="close" />
            </div>
            <span className="text-[#4318FF] text-md font-semibold">
              My Profile
            </span>
          </a>

          {/* Log Out */}
          <a
            href="https://dev_suite.dictera.com"
            className="w-full flex items-center space-x-3 p-3  rounded-xl text-left group shadow-[0px_8px_24px_0px_#959DA533]"
          >
            <div className="p-2">
              <img src={logOutIcon} alt="close" className="cursor-pointer" />
            </div>
            <span className="text-[#4318FF] text-md font-semibold">
              Log Out
            </span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default ChangeRole;