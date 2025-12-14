import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FieldValues, useForm, UseFormRegister } from 'react-hook-form';

import * as Icons from './../../Icons';

type IPasswordForm = {
    password?: string;
    confirmPassword?: string
};
const CreateNewPassword: React.FC = () => {
    const navigate = useNavigate();

    const { register, handleSubmit } = useForm<IPasswordForm>();

    const onSubmit = (data: IPasswordForm) => {
        if (data.password === data.confirmPassword) {
            navigate('/login');
        } else {
            //setInvaild(true);
        }
    };

    return (
        <div className="w-[28rem] p-4 sign-in-form">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="title font-extrabold mb-3">Create new password</h1>
                <h5 className="font-semibold mb-10">Your new password must be different from previous used passwords.</h5>

                <PasswordInput register={register}
                    required
                    id="password"
                    title="Password"
                    placeholder="Min. 8 characters"
                />

                <div className="mt-6">
                    <PasswordInput register={register}
                        required
                        id="confirmPassword"
                        title="Confirm password"
                        placeholder="Min. 8 characters"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full h-[54px] my-8 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2">
                    Reset password
                </button>
            </form>
        </div>
    )
}

interface PasswordInputProps {
    register: UseFormRegister<FieldValues>;
    id?: string;
    title: string;
    required?: boolean;
    placeholder?: string;
}
const PasswordInput: React.FC<PasswordInputProps> = ({
    register,
    id = "password",
    title = "",
    required = true,
    placeholder = "Min. 8 characters"
}) => {

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };


    return (
        <div className="mb-2">
            <label htmlFor={id} className="block mb-2 font-medium text-[14px]">{title}</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id={id}
                    {...register(id, { required: true })}
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

export default CreateNewPassword;