// components/SignInModal.tsx
import React, { useState, useEffect} from "react";
import { FaStar } from "react-icons/fa";

interface ProgressBarProps {
  onClose: () => void;
  stars: number;
}

const Rewards = [
  { id: 'boba', name: 'Boba', emoji: '🧋', cost: 5 },
  { id: 'taco', name: 'Tacos', emoji: '🌮', cost: 8 },
  { id: 'chicken', name: 'Chicken', emoji: '🍗', cost: 8 },
  { id: 'Normal', name: 'Normal', emoji: '🍚', cost: 4 },
];
export default function ProgressBar({ onClose, stars }: ProgressBarProps) {
  const [selectedRewards, setSelectedRewards] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedRewardId");
      if (saved) {
        return Rewards.find(r => r.id === saved) || Rewards[1];
      }
    }
    return Rewards[1]; 
  });
  useEffect(() => {
    localStorage.setItem("selectedRewardId", selectedRewards.id);
  }, [selectedRewards]);
  const goal_stars = selectedRewards.cost;
  const currentProgress = stars % goal_stars;
  const progressPercent = stars > 0 && currentProgress === 0 ? 100 : (currentProgress / goal_stars * 100);
  const itemsEarned = Math.floor(stars / goal_stars);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      <div className="flex flex-col relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-black font-bold text-xl transition-colors"> X
        </button>
        <h2 className="text-black justify-center items-center text-center font-semibold text-3xl hover:text-red-800">REWARD TARGET</h2>
        <div className="mt-2 flex overflow-x-auto gap-4 pb-6 mb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {Rewards.map((reward) => (
            <button
              key = {reward.id}
              onClick = {()=>setSelectedRewards(reward)}
              className={`flex-shrink-1 w-28 snap-center flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                (selectedRewards.id === reward.id)?
                'border-orange-500 bg-orange-50 scale-105 shadow-md'
                :'border-gray-100 hover:border-orange-200 hover:bg-orange-50/50'
              }
              `}>
              <span className="text-4xl mb-1">{reward.emoji}</span>
              <span className="text-xm font-bold text-gray-700">{reward.name}</span>
              <span className="text-[1rem] text-gray-500">{reward.cost} ⭐</span>
            </button>
          ))}
        </div>
        <div className="mb-2 flex justify-between text-sm font-bold text-gray-600 mt-4">
          <span className="text-2xl flex gap-2">
            {currentProgress === 0 && stars > 0 ? goal_stars : currentProgress}/{goal_stars}
            <FaStar className="mt-0.5 text-amber-300" /></span>
          <span className="text-2xl ">{Math.floor(progressPercent)}%</span>
        </div>
        <div className="h-8 w-full rounded-full bg-gray-200 overflow-hidden shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-yello-400 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          >

          </div>
        </div>
      </div>

    </div>
  );
}