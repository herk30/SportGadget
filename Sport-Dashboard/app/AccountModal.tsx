import React from "react";
import { RxCross1 } from "react-icons/rx";

interface popUpAccountModalProps{
    onClose: () => void
    getName: string
    setName: (name: string) => void
}

const PopUpAccountModal:  React.FC<popUpAccountModalProps> = ({ onClose, getName, setName }) =>{
    return(
        <div className ="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all">
            <div className = "flex flex-col relative gap-3 p-5 w-full  max-w-md rounded-2xl bg-white">
            <button className ="absolute top-4 right-4 w-7 h-7 
                    rounded-3xl p-1.5 flex justify-center items-center duration:300
                    text-gray-400  transition-colors 
                    hover:scale-110 active:scale-95 hover:bg-gray-200"
                    onClick={onClose}
                    >
                <RxCross1 className = "font-bold"/>
            </button>
                <p className = "text-2xl font-semibold text-blue-800  font-sans">Enter Name</p>
                <div className =" p-2 h-10 w-full justify-center items-center border-2 border-gray-600 rounded-2xl ">
                    <input
                        className = "outline-none text-black w-full bg-transparent"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"
                        value={getName}
                        type="text"
                    />
                </div> 
            </div>
        </div>
    );
}

export default PopUpAccountModal;