import { useState, useEffect } from 'react';
import { MdDashboard } from 'react-icons/md';

interface Props {
    heigth: string;
    message?: string
}

export default function LoadingScreen({ heigth, message }: Props) {
    const text = ['H', 'o', 'm', 'e', 'c', 'l', 'i', 'x'];
    const totalItems = text.length + 1; // incluindo o símbolo
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % totalItems);
        }, 500);

        return () => clearInterval(interval);
    }, [totalItems]);

    return (
        <div className="flex flex-col items-center justify-center   " style={{height: heigth}}>
            <div
                className={`transition-all duration-500 ${activeIndex === 0 ? 'opacity-100 transform -translate-y-1' : 'opacity-50'}`}
            >
                <MdDashboard className='text-verde' size={40} />
            </div>
            <div className="flex space-x-1 text- ">
                {text.map((letter, index) => (
                    <span
                        key={index}
                        className={`font-extrabold  shadow-inherit uppercase text-3xl transition-all duration-500 ${activeIndex === index + 1 ? 'opacity-100 transform -translate-y-0.5' : 'opacity-50'}`}
                    >
                        {letter}
                    </span>
                ))}
            </div>
            <div>
                <p className='font-bold text-lg mt-2'>{message}</p>
            </div>
        </div>
    );
};

