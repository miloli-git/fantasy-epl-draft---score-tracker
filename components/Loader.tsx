
import React from 'react';

interface LoaderProps {
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-pl-green border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-300">{text}</p>
        </div>
    );
};

export default Loader;
