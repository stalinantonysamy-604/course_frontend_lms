import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FieldValues, useForm, UseFormRegister } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { setUsername, setRole } from '../LoginSlice';


import * as Icons from './../../Icons';

type ILoginForm = {
    email?: string;
    password?: string;
    keepLoggedIn?: boolean
};

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();


    
    const [invaild, setInvaild] = useState<boolean>(false);

    const { register, handleSubmit } = useForm<ILoginForm>();

    const onSubmit = (data: ILoginForm) => {
        if (data.email === "vijay.shankar@demo.com" && data.password === "cG69trTB") {
            dispatch(setUsername('Vijay Shankar'));
            dispatch(setRole('admin'));
            navigate('/project-creation');
        } else if(data.email === "author@demo.com" && data.password === "cG69trTB"){
            dispatch(setUsername('Author'));
            dispatch(setRole('author'));
            navigate('/project-creation');
        } else {
            setInvaild(true);
        }
    };

    return (
        <div className="w-[30rem] p-4 sign-in-form">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="title font-extrabold mb-3">Log In</h1>
                <h5 className="font-semibold mb-10">Enter your email and password to sign in!</h5>

                <div className="mb-6">
                    <label htmlFor="email" className="block mb-2 font-medium text-[14px]">Email</label>
                    <input
                        type="email"
                        id="email"
                        {...register("email", { required: true })}
                        className="bg-white border placeholder-gray-600 border-gray-300 text-gray-900 text-sm rounded-[16px] focus:ring-blue-500 focus:border-blue-500 block w-full p-4"
                        placeholder="e.g: mail@simmmple.com"
                    />
                </div>

                <PasswordInput register={register}
                    required
                    id="password"
                    placeholder="Min. 8 characters"
                />

                <p className={`text-red-500 mt-2 mb-5 ${invaild ? '' : 'invisible'}`}>Invaild username or password</p>
                <div className="flow-root mb-2">
                    <div className="float-left flex items-center">
                        <input
                            id="link-checkbox"
                            type="checkbox"
                            {...register("keepLoggedIn")}
                            defaultChecked={true}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="link-checkbox" className="ms-5 text-sm font-medium text-gray-900">
                            Keep me logged in
                        </label>
                    </div>
                    <Link to="/login/ForgotPassword" className="float-right cursor-pointer text-sm text-[#4318FF] hover:text-blue-800 visited:text-purple-600">
                        Forget password?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="w-full h-[54px] my-8 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2">
                    Log in
                </button>
            </form>
        </div>
    )
}

interface PasswordInputProps {
    register: UseFormRegister<FieldValues>;
    id?: string;
    required?: boolean;
    placeholder?: string;
}
const PasswordInput: React.FC<PasswordInputProps> = ({
    register,
    id = "password",
    required = true,
    placeholder = "Min. 8 characters"
}) => {

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };


    return (
        <div className="mb-2">
            <label htmlFor={id} className="block mb-2 font-medium text-[14px]">Password</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id={id}
                    {...register("password", { required: true })}
                    className="bg-white border placeholder-gray-600 border-gray-300 text-gray-900 text-sm rounded-[16px] focus:ring-blue-500 focus:border-blue-500 block w-full p-4"
                    placeholder="Min. 8 characters"
                />
                <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    onClick={togglePasswordVisibility}
                >
                    <img src={Icons.remove_red_eye} alt="remove_red_eye" />
                    {/* {showPassword ? (
                            <img src={Icons.remove_red_eye} alt="remove_red_eye" />
                        ) : (
                            <img src={Icons.remove_red_eye} alt="remove_red_eye" />
                    )} */}
                </button>
            </div>
        </div>
    )
}

export default LoginForm;