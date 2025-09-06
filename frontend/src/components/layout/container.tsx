import React, { JSX } from "react";

type PropTypes = {
    fluid?: boolean;
    shrink?: boolean;
    children: JSX.Element | JSX.Element[];
    className?: string;
};

const Container = ({ children, shrink = false, className }: PropTypes) => {
    return (
        <div
            className={`mx-auto w-full ${shrink ? "max-w-[70rem]" : "max-w-[1536px]"} px-3 sm:px-4 xl:px-6 3xl:px-8 ${className}`}
        >
            {children}
        </div>
    );
};

export default Container;
