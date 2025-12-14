import React from 'react';

import * as Images from './../../Images';

const CheckYourEmail: React.FC = () => {
    return (
        <div className="w-[30rem] p-4 sign-in-form">
            <h1 className="title font-extrabold mb-3">Check your email</h1>
            <h5 className="font-semibold mb-10">We have sent a password recover instruction to your email.</h5>
            <img className="m-auto" src={Images.email} alt="email.svg" />
        </div>
    )
}

export default CheckYourEmail;