import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://dev-apicoursebuilder.dictera.com'
    
});   

const axiosInstanceLaravel = axios.create({
    baseURL: 'https://dev_coursebuilder.dictera.com'
});
export const setAxiosToken = (token: string | null) => {
    if (token) {
        sessionStorage.setItem('authToken', token);
        axiosInstance.defaults.headers.common['Authorization'] = token;
    } else {
        sessionStorage.removeItem('authToken');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};

const savedToken = sessionStorage.getItem('authToken');
if (savedToken) {
    axiosInstance.defaults.headers.common['Authorization'] = savedToken;
}

export default axiosInstance;
export { axiosInstanceLaravel };
