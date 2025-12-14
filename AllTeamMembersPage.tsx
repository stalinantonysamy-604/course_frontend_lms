import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from '../../Icons';
import left_arrow from '../../../Assets/left_arrow.svg';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    roleName: string;
}

const AllTeamMembersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const teamList = (location.state?.teamList || []) as TeamMember[];

    return (
        <div className="w-full max-w-7xl mx-auto border rounded-2xl shadow-lg p-6 mt-6 bg-white">

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-4 font-bold text-gray-900 text-lg sm:text-xl"
            >
                <img src={left_arrow} alt="left_arrow" className="w-5 h-5" />

                All Team Members ({teamList.length})

            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamList.map((item) => {
                    const initials = item.name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0].toUpperCase())
                        .join('');

                    return (
                        <div
                            key={item.id}
                            className="flex items-center bg-white p-3 rounded-lg text-sm text-gray-700 border border-gray-200 shadow-md"
                            style={{ height: "62px" }}
                        >
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-[#1D1F23]">{item.roleName}</span>

                                    <div className="w-[30px] h-[30px] rounded-full bg-[#C0CAFF] text-[#2B3674] font-bold text-sm flex items-center justify-center">
                                        {initials}
                                    </div>

                                    <span className="text-sm">{item.name}</span>

                                    <span className="px-2 text-gray-300 hidden sm:inline">|</span>

                                    <span className="text-sm text-gray-600">{item.email}</span>

                                </div>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <img src={Icons.user_delete_icon} alt="Delete" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default AllTeamMembersPage;
