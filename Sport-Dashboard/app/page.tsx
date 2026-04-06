"use client";
import { useState, useEffect, useRef } from "react";
import { MdBluetoothConnected, MdBluetoothDisabled } from "react-icons/md";
import { Routes, Route, Navigate } from 'react-router-dom';
import { FaStar} from "react-icons/fa";
import { IoIosCloudDownload } from "react-icons/io";
import { FaBarsProgress } from "react-icons/fa6";
import ProgressBar from "./progressBar";
import { MdOutlineAccountCircle } from "react-icons/md";
import PopUpAccountModal from "./AccountModal";
type Phase = 'Work' | 'Rest';

export default function Home(){
  const [heartRate,setHeartRate] = useState<number>(0);
  const [calories,setCalories] = useState<number>(0);
  const [intensity,setIntensity] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [connected, setConnected] = useState<number>(0);
  const [isRunning,setIsRunning] = useState<boolean>(false);
  const [phase,setPhase] = useState<Phase>('Work');
  const [seconds,setSeconds] = useState<number>(0);
  const [isProgressBarOpen, setIsProgressBarOpen] = useState(false);
  const [isAccountModalOpen,setIsAccountModalOpen] = useState(false);
  const [getUser, setGetUser] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("savedUserName");
    if (savedName) {
      setGetUser(savedName);
    }
  },[]);
  const handleSetName = (name: string) => {
    setGetUser(name);
    localStorage.setItem("savedUserName", name);
  };

  const [totalAccumulatedStars, setTotalAccumulatedStars] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fightTag_totalStars");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const currentSessionStars = Math.max(0, Math.floor((calories / 70) || 0));
  const grandTotalStars = totalAccumulatedStars + currentSessionStars;
  const countStar = Math.max(0, Math.floor((calories / 70) || 0));
  const playSound = (audioPath: string) => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(audioPath);
      audio.play().catch((error) => console.log('Chưa thể phát âm thanh:', error));
    }
  };
  useEffect(()=>
    {
      let interval: NodeJS.Timeout;
      if (isRunning) {
        interval = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      }
  },[isRunning]);

  useEffect(()=> {
    if (!isRunning) return ;
    if (phase == 'Work'){
       if (seconds === 0) playSound('sportapp\Sound\Start.mp3');
       else if (seconds === 60) playSound('sportapp\Sound\Onemin.mp3');
       else if (seconds === 120) playSound('sportapp\Sound\Twomin.mp3');
       else if (seconds > 150 && seconds < 180) {
        playSound('sportapp\Sound\BaMuoiSecond.mp3');                                  
      }
      else if (seconds ===180){
        playSound('sportapp\Sound\TimeOut.mp3');
        setTimeout(() => {
          setPhase('Rest');
          setSeconds(0);
        }, 0);
      }
     } 
     else if (phase == 'Rest'){
      if (seconds ==30){
        playSound('sportapp\Sound\Start.mp3');
        setTimeout(() => {
          setPhase('Work');
          setSeconds(0);
        }, 0);
      }
     } 
  },[seconds, isRunning,phase]);

  const saveWorkoutToFile = () => {
    const stars = currentSessionStars;
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN'); 
    const timeStr = now.toLocaleTimeString('vi-VN'); 
    
    const fileContent = `
      =================================
      NHẬT KÝ TẬP LUYỆN FIGHTTAG
      =================================
      Ngày tập     : ${dateStr}
      Giờ kết thúc : ${timeStr}
      ---------------------------------
      Tổng thời gian : ${minutes} phút ${secs} giây
      Tổng Calo đốt  : ${calories.toFixed(1)} kcal
      Thành tích phiên: ${stars} Ngôi sao
      Tổng sao tích lũy: ${totalAccumulatedStars + stars} Ngôi sao
      =================================
    `;
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FightTag_${dateStr.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (stars > 0) {
      const newTotal = totalAccumulatedStars + stars;
      setTotalAccumulatedStars(newTotal); 
      localStorage.setItem("fightTag_totalStars", newTotal.toString()); 
      
      setCalories(0);
      setTotalSeconds(0);
      setHeartRate(0);
      setIntensity(0);
      setIsRunning(false);
      
      alert(`Đã lưu thành công! Bạn vừa được cộng thêm ${stars} sao vào tổng tài sản! 🌟`);
    }
  };

  const connectedRef = useRef(connected);
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const esp32_ips = ["172.20.10.2"]; 
      let socket: WebSocket | null = null;
      let isConnected = false;

      const connectToESP32 = (ipIndex: number) => {
        if (ipIndex >= esp32_ips.length) {
          console.error("Đã thử hết tất cả IP nhưng không thể kết nối tới ESP32.");
          setConnected(0);
          return;
        }
        
        const currentIp = esp32_ips[ipIndex];
        console.log(`Đang thử kết nối WebSocket với: ${currentIp}...`);
        
        try {
          socket = new WebSocket(`ws://${currentIp}/ws`);

          socket.onopen = () => {
            console.log(`Kết nối thành công với ESP32 tại IP: ${currentIp}`);
            isConnected = true;
          };

          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              setHeartRate(data.hr);
              setCalories(data.cal);
              setIntensity(data.intensity);
              setTotalSeconds(data.time);
              setConnected(Number(data.connected));
            } catch (err) {
              console.error("Lỗi đọc dữ liệu JSON:", err);
            }
          };

          socket.onerror = (error) => {
            console.error(`Lỗi kết nối tại ${currentIp}`);
          };

          socket.onclose = () => {
            if (!isConnected) {
              console.log(`Kết nối thất bại với ${currentIp}, chuyển sang IP tiếp theo...`);
              connectToESP32(ipIndex + 1);
            } else {
              console.log("Bị mất kết nối với ESP32 đang chạy.");
              isConnected = false;
              setConnected(0);
            }
          };
        } catch (error) {
          console.error(`Trình duyệt đã chặn kết nối tới ${currentIp} (Lỗi Mixed Content):`, error);
          setConnected(0);
        }
      };

      connectToESP32(0);
      
      return () => {
        if (socket) {
          socket.close();
        }
      };
    }
  }, []);
  useEffect(() => {
      const timer = setInterval(() => {
        if (connectedRef.current === 1) {
          setTotalSeconds((prev) => prev + 1);
        }
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    const getFontSize = (value: number) => {
    if (value >= 1000) return "text-6xl";      
    if (value >= 100)  return "text-[12rem]";
    return "text-[15rem]";
  };
  return(
    <div className={`flex flex-col justify-center items-center h-screen w-screen transition-colors duration-500 ${
        intensity >= 90 ? "bg-red-400" :
        intensity >= 80 ? "bg-orange-400" :
        intensity >= 70 ? "bg-blue-400" :
        intensity >= 60 ? "bg-green-400" :
        intensity >= 0 ? "bg-gray-400" : "bg-amber-50" }`}>
    
      <header className="w-full h-20 px-8 flex justify-between items-center shadow-xl relative bg-black/20 backdrop-blur-xl border-white/20 ">
        <div className="z-10 flex items-center gap-4">
          <p className="font-bold text-5xl text-white">
            {getUser}
          </p>
          <button
            className = {`w-full h-full ml-2 p-3 rounded-2xl hover:scale-110 duration: 300 transition-all shadow-[0_0_30px_5px_rgba(0,0,0,.2)] ${  
              intensity >= 90 ? "bg-red-400/30" :
              intensity >= 80 ? "bg-orange-400/30" :
              intensity >= 70 ? "bg-blue-400/30" :
              intensity >= 60 ? "bg-green-400/30" :
              intensity >= 0 ? "bg-gray-400/30" : "bg-amber-50"
            }`}
            type="button"
            onClick={(e)=>{
              e.preventDefault();
              console.log("Set time");
              setSeconds(0);
            }}>
            Set time
          </button>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(countStar)].map((_, index) => (
           <FaStar 
              key={index} 
              className="text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" 
            />
          ))}
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <p className="font-bold text-5xl text-white">
            {formatTime(totalSeconds)}
          </p>
        </div>

        <div className="z-10 flex items-center gap-1 text-white ">
          <button 
            onClick={() => setIsProgressBarOpen(true)}
            >
          <FaBarsProgress size = {33} />
          </button>

          <button 
          onClick={saveWorkoutToFile}
          disabled={totalSeconds === 0}
          className={`flex items-center gap-2 px-4 py-2  font-bold transition-all ${
            totalSeconds > 0 
              ? "" 
              : ""
          }`}
    >
      <IoIosCloudDownload size={33} />
    </button>
      {connected === 1 ? (
        <MdBluetoothConnected size={40} className="animate-pulse text-white" />
      ) : (
        <MdBluetoothDisabled size={40} className="text-gray-400" />
      )}
    <button
      className=""
      onClick={()=>{
        setIsAccountModalOpen(true);
      }}
      >
      <MdOutlineAccountCircle size={38}/>
    </button>
        </div>      
      </header>
      
      <div className ={`flex flex-row gap-15 max-w-8xl justify-center self-center h-screen w-screen`}>
        {/* Calories */}
        <div className = "w-120 h-180 mt-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center p-4 transition-transform hover:scale-105 bg-black/20 backdrop-blur-xl border-white/20">
          <p className = "text-white text-4xl font-bold mt-20 tracking-wider">
            CALORIES
          </p>
          <div className="mb-7 flex-1 flex items-center justify-center w-full">
            <p className={`font-black leading-none transition-all duration-300 text-white ${getFontSize(calories)}`}>
              {(Number(calories) || 0).toFixed(0)}
            </p>
          </div>
          <p className="text-white mb-20 text-4xl font-bold tracking-widest">
              KCAL
          </p>
        </div>
        {/* Intensity */}
        <div className = "w-120 h-180 mt-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center p-4 transition-transform hover:scale-105 bg-black/20 backdrop-blur-xl border-white/20">
          <p className = "text-white text-4xl font-bold mt-20 tracking-wider">
            INTENSITY
          </p>
          <div className="mb-7 flex-1 flex items-center justify-center w-full">
            <p className={`font-black leading-none transition-all duration-300 text-white ${getFontSize(intensity)}`}>
              {(Number(intensity) || 0).toFixed(0)}
            </p>
          </div>
          <p className="text-white mb-20 text-4xl font-bold tracking-widest">
              %
          </p>
        </div>
        {/* Heart rate */}
        <div className = "w-120 h-180 mt-10 rounded-[2.5rem] shadow-2xl flex flex-col p-4 items-center transition-transform hover:scale-105 bg-black/20 backdrop-blur-xl border-white/20">
          <p className = "text-white text-4xl font-bold mt-20 tracking-wider">
            HEART RATE
          </p>
          <div className="mb-7 flex-1 flex items-center justify-center w-full">
            <p className={`font-black leading-none transition-all duration-300 text-white ${getFontSize(heartRate)}`}>
              {(Number(heartRate) || 0).toFixed(0)}
            </p>
          </div>
          <p className="text-white mb-20 text-4xl font-bold tracking-widest">
              BPM
          </p>
        </div>
        </div>
          {isProgressBarOpen && (
          <ProgressBar 
            onClose={() => setIsProgressBarOpen(false)} 
            stars={grandTotalStars} 
          />
        )}
        {isAccountModalOpen && (
          <PopUpAccountModal
            onClose={()=> setIsAccountModalOpen(false)}
            getName={getUser}
            setName={handleSetName}
          />
        )}
      
    </div>
    
  );
}