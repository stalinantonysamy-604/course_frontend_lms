import React, { useRef, useState } from 'react';
import userProfile from '../../Assets/Images/demo-img3.png';
import './UserProfile.scss';
import deleteIcon from '../../Assets/Images/delete-icon.png';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userData: {
    id: number;
    u_uniqueId: string;
    name: string;
    email: string;
    status: number;
    isClientUser: boolean;
  };
  client: {
    clientId: number;
    clientCompanyName: string;
    clientName: string;
    clientEmail: string;
  };
  roles: {
    role_id: number;
    role_name: string;
  }[];
  product: {
    product_id: number;
    product_name: string;
  };
  permissions: {
    action_id: number;
    action_name: string;
  }[];
  iat: number;
}

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditPicture, setIsEditPicture] = useState(false);
  const [isProFileEdit, setIsProFileEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null); // Preview before saving
  const token = useSelector((state: RootState) => state.login.token);
  console.log("token", token);
  const decodedToken = jwtDecode<DecodedToken>(token);
  console.log("decoded token is", decodedToken);

  // Extract name,email and designation
  const email = decodedToken.userData.email;
  const rawDesignation = decodedToken.roles[0]?.role_name || 'N/A';

  // Convert camelCase to "Title Case"
  const designation = rawDesignation
    .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space before capital letters
    .replace(/^./, str => str.toUpperCase()); // capitalize first letter

  const fullName = decodedToken.userData.name;
  const nameParts = fullName.trim().split(" ");

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" "); // Supports multi-part last names

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string); // only update preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-white to-[#edf1fd] p-6">
      {/* Main Container with Sidebar and Content */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 p-6">
          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'nav-active-tab' : 'nav-profile-btn hover:bg-gray-100'
                }`}
            >
              My profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === 'password' ? 'nav-active-tab' : 'nav-password-btn hover:bg-gray-100'
                }`}
            >
              Change password
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'profile' && (
            <>
              {/* Profile Header */}
              <div className="flex items-center justify-between main-div">
                <div className="flex flex-col space-y-4">
                  {/* Row with Profile Image and Upload/Preview */}
                  <div className="flex items-center space-x-4">
                    {/* Profile Image */}
                    <img
                      src={profileImage || userProfile}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />

                    {isEditPicture ? (
                      profileImagePreview ? (
                        // Preview block
                        <div className="flex items-center space-x-4 border border-gray-200 rounded-lg p-2 shadow-sm bg-white">
                          <img
                            src={profileImagePreview}
                            alt="Preview"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">profile.jpg</p>
                            <p className="text-xs text-gray-500">100kb</p>
                          </div>
                          <button
                            onClick={() => setProfileImagePreview(null)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-edit-profile" onClick={handleUploadClick}>
                            Upload profile picture
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </>
                      )
                    ) : (
                      <div>
                        <p className="text-base font-semibold text-[#0F172A]">{fullName}</p>
                        <p className="text-sm text-gray-500">{designation}</p>
                      </div>
                    )}
                  </div>

                  {/* Buttons below row */}
                  {isEditPicture && profileImagePreview && (
                    <div className="flex space-x-4">
                      <button
                        className="btn-update-profile"
                        onClick={() => {
                          setProfileImage(profileImagePreview);
                          setProfileImagePreview(null);
                          setIsEditPicture(false);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="btn-cancel-profile "
                        onClick={() => {
                          setProfileImagePreview(null);
                          setIsEditPicture(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditPicture && (
                  <button
                    className="btn-edit-profile"
                    onClick={() => setIsEditPicture(true)}
                    style={{ display: 'none' }}
                  >
                    Edit profile picture
                  </button>
                )}
              </div>

              {/* Personal Info */}
              <div className="mt-4">
                <h3 className="personal-info-heading mb-2">Personal information</h3>
                <div className="mt-4">
                  <div className="relative main-div">
                    <div className="grid grid-cols-3 gap-6 items-start">
                      {/* Column 1 */}
                      <div className="space-y-4">
                        <div>
                          <p className="user-label-text">First name</p>
                          {!isProFileEdit ? (
                            <p className="user-value-text">{firstName}</p>
                          ) : (
                            <input
                              type="text"
                              defaultValue="Melissa"
                              className="w-full border-[1px] [border-color:#E0E5F2] rounded-[10px] px-3 py-2 text-sm"
                            />
                          )}
                        </div>
                        <div>
                          <p className="user-label-text">Email address</p>
                          {!isProFileEdit ? (
                            <p className="user-value-text text-blue-700">{email}</p>
                          ) : (
                            <input
                              type="email"
                              defaultValue="melissa25@hurix.com"
                              className="w-full border-[1px] [border-color:#E0E5F2] rounded-[10px] px-3 py-2 text-sm"
                            />
                          )}
                        </div>

                        {/* Show Update/Cancel buttons under Email */}
                        {isProFileEdit && (
                          <div className="flex gap-4 pt-2">
                            <button className="btn-update-profile" onClick={() => setIsProFileEdit(false)}>
                              Update
                            </button>

                            <button className="btn-cancel-profile" onClick={() => setIsProFileEdit(false)}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-4">
                        <div>
                          <p className="user-label-text">Last name</p>
                          {!isProFileEdit ? (
                            <p className="user-value-text">{lastName}</p>
                          ) : (
                            <input
                              type="text"
                              defaultValue=""
                              placeholder="Enter last name"
                              className="w-full border-[1px] [border-color:#E0E5F2] rounded-[10px] px-3 py-2 text-sm"
                            />
                          )}
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="flex justify-end space-x-4">
                        {!isProFileEdit && (
                          <button className="btn-edit-profile" onClick={() => setIsProFileEdit(true)} style={{ display: 'none' }}>
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'password' && (
            <div className="mt-2">
              <h2 className="dm-heading mb-6">Change Password</h2>
              <div className="custom-password-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="dm-label mb-1 block">Current password</label>
                    <input
                      type="password"
                      className="w-full border-[1px] [border-color:#E0E5F2] rounded-[10px] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="dm-label mb-1 block">Confirm New password</label>
                    <input
                      type="password"
                      className="w-full border-[1px] [border-color:#E0E5F2] rounded-[10px] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="dm-label mb-1 block">New password</label>
                    <input
                      type="password"
                      className="w-full border-[1px] [border-color:#E0E5F2] rounded-[10px] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="btn-update-password">Update password</button>
                  <button className="btn-cancel-password" onClick={() => setActiveTab('profile')}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
