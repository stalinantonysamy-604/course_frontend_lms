import React, { useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';

//import { useAuth } from "./AuthContext";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import backgroundImage from './../../Assets/sign-in-background.png';
import dictera_logo_white from './../../Assets/dictera_logo_white.svg';

import './Login.scss'
import axiosInstance, { setAxiosToken } from '../../Api/Axios';
import { setRole, setUsername, setEmail, setUniqueId, setToken, setUserId, setRolesData, setUserImage } from './LoginSlice';
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

export interface RoleResponse {
    data: {
        statusCode: number;
        message: string;
        data: {
            name: string;
            description: string;
            type: string;
            roleId: number;
            permissions: Permission[];
            createdOn: string;
            updatedOn: string;
        };
    };
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    status: number;
    actions: Action[];
}

export interface Action {
    id: number;
    name: string;
    description: string;
    status: number;
}


const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const location = useLocation();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const init = async () => {
            const tokenValue = searchParams.get("t");
            const savedToken = sessionStorage.getItem('authToken');

            const tokenToUse = tokenValue || savedToken;

            if (!tokenToUse) {
                console.log("No token found in URL params or sessionStorage.");
                return;
            }

            let decodedToken: DecodedToken;
            try {
                decodedToken = jwtDecode<DecodedToken>(tokenToUse);
            } catch (error) {
                console.log("Failed to decode token:", error);
                return;
            }

            const roleId = decodedToken.roles[0]?.role_id;
            setAxiosToken(tokenToUse);

            try {
                const response = await axiosInstance.get('/signIn', {
                    headers: {
                        'Authorization': tokenToUse
                    }
                });

                if (response.status === 200) {
                    const userData = response.data.data.userData;

                    dispatch(setUserId(userData.id));
                    dispatch(setUsername(userData.name));
                    dispatch(setEmail(userData.email));
                    dispatch(setUniqueId(userData.u_uniqueId));
                    dispatch(setRole(response.data.data.roles[0])); // Ideally, derive role from decoded token or response
                    dispatch(setToken(tokenToUse));
                    dispatch(setRolesData(response.data.data.roles));
                    dispatch(setUserImage(userData.image));
                    if (response.data.data.roles.length > 1) {
                        navigate(`/SelectRole`);
                    } else {
                        const responseForType = await axiosInstance.get(`https://dev-apicoursebuilder.dictera.com/role/${roleId}`, {
                            headers: { Authorization: `Bearer ${tokenToUse}` },
                        });
                        // Access role type                    
                        const roleType = responseForType.data.data.type;

                        // Navigate based on role type
                        if (roleType === 'author') {
                            navigate('/project-creation/AuthorDashboard');
                        } else if (roleType === 'reviewer') {
                            navigate('/project-creation/ReviewerDashboard');
                        } else if (roleType === 'publisher') {
                            navigate('/project-creation/PmDashboard');
                        }
                        else if (roleType === 'projectManager') {
                            navigate('/project-creation/ProjectCards');
                        } else {
                            navigate('/project-creation');
                        }
                    }
                }
            } catch (error) {
                console.log("API request error:", error);
            }
        };

        init();
    }, []);

    return (
        <>
            {/* <div className="container bg-white">
            <div className="grid grid-cols-2">
                <div className="bg-no-repeat bg-100% bg-center h-screen w-full flex items-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
                    <div className="absolute title-group top-[242px] left-[103px]">
                        <img className="mb-2" src={dictera_logo_white} alt="dictera_logo" />
                        <h1 className="title text-white font-bold">The Superpower <br /> of Creation</h1>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <Outlet />
                </div>
            </div>
        </div> */}
        </>
    )
}

export default Login;