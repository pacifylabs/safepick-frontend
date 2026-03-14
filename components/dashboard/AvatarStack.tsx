"use client";

import React from "react";

interface User {
  id: string;
  fullName: string;
  photoUrl?: string;
}

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: "sm" | "md";
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  max = 3,
  size = "sm",
}) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const getBgColor = (id: string) => {
    // Basic hash to pick one of the 4 colors from spec
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = size === "sm" ? "w-7 h-7 text-[0.6rem]" : "w-8 h-8 text-[0.72rem]";

  return (
    <div className="flex items-center">
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className={`relative rounded-full border-2 border-white overflow-hidden ${
            index !== 0 ? "-ml-2" : ""
          } ${sizeClasses} ${getBgColor(user.id)} flex items-center justify-center`}
        >
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-medium text-white">{getInitials(user.fullName)}</span>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`relative -ml-2 rounded-full border-2 border-white bg-[#F2F0EB] flex items-center justify-center ${sizeClasses} text-[#6B7280] font-medium`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
