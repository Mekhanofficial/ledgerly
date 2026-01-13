import React, { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";

const Input = ({ id, name, type, label, placeholder, value, onChange, error }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    onChange(e);
  };

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className={`relative`}>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : type}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error 
              ? "border-red-500" 
              : isFocused 
                ? "border-blue-500" 
                : "border-gray-300"
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChange={handleInputChange}
        />

        {type === "password" && (
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 bottom-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 text-xl cursor-pointer px-3"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;