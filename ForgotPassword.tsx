import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

type IForgotPasswordForm = {
    email: string;
};
const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();

    const { register, handleSubmit } = useForm<IForgotPasswordForm>();

    const onSubmit = (data: IForgotPasswordForm) => {
        if (data.email !== "") {
            navigate('/login/CheckYourEmail');
        }
    };
    return (
        <div className="w-[30rem] p-4 sign-in-form">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="title font-extrabold mb-3">Forgot password</h1>
                <h5 className="font-semibold mb-10">Enter your email to receive change password link</h5>

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

                <button
                    type="submit"
                    className="w-full h-[54px] my-8 text-white bg-[linear-gradient(135deg,_#868CFF_0%,_#4318FF_100%)] hover:bg-[linear-gradient(135deg,_#6A7FFF_0%,_#2A1CFF_100%)] focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2">
                    Send email
                </button>
            </form>
        </div>
    )
}

export default ForgotPassword;