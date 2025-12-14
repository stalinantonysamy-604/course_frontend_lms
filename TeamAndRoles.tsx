import React, { useState } from 'react';
import RolesAndPermissions from './RolesAndPermissions';
import teamprofile from '../../../Assets/Icons/team_icon.svg';
import Team from './Team';
import roleicon from '../../../Assets/Icons/role_icon.svg';

const TeamAndRoles: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'team' | 'roles'>('team');

    return (
        <div >
            <div className="p-6">

                <p
                    style={{
                        color: '#1D1F23',
                        fontFamily: 'DM Sans',
                        fontSize: '28px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: '28px',
                        marginBottom: '27px',
                        marginLeft: '-27px'
                    }}
                >
                    Team & Roles
                </p>

            </div>



            <div className="bg-[#FFF] p-6 rounded-xl shadow-sm" style={{ marginTop: "-2%" }}>

                <div className="flex gap-2 mb-6">

                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] border text-[16px] shadow-[0px_2px_8px_rgba(99,99,99,0.20)] ${activeTab === 'team'
                                ? 'bg-[#4318FF] text-white'
                                : 'bg-white text-[#4318FF]'
                                }`}

                        >
                            <img src={teamprofile} alt="team" />
                            Team
                        </button>

                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] border text-[16px]  shadow-[0px_2px_8px_rgba(99,99,99,0.20)] ${activeTab === 'roles'
                                ? 'bg-[#4318FF] text-white'
                                : 'bg-white text-[#4318FF]'
                                }`}

                        >
                            <img src={roleicon} />
                            Roles & permission
                        </button>
                    </div>


                </div>

                {activeTab === 'team' ? <Team /> : <RolesAndPermissions />}

            </div>
        </div>
    );
};

export default TeamAndRoles;
