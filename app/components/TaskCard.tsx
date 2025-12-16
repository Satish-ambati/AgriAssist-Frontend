import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface TaskCardProps {
  id?: string;
  taskName: string;
  completed: boolean;
  onToggle: () => void;
  dueTime?: string;
  priority?: "low" | "medium" | "high";
  option?: 2 | 3; // style
}

const TaskCard: React.FC<TaskCardProps> = ({
  taskName,
  completed,
  onToggle,
  dueTime,
  priority = "medium",
  option = 3,
}) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(); // CropGrowth passes toggle function
    } catch (err) {
      console.error("Task toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Option 3: Colored Side Indicator
  const sideColor = completed
    ? "bg-green-500"
    : priority === "high"
    ? "bg-red-500"
    : priority === "medium"
    ? "bg-yellow-500"
    : "bg-gray-400";


    const formatDueTime = (isoString: string) => {
      if (!isoString) return "";

      const date = new Date(isoString);
      const now = new Date();

      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const isTomorrow =
        date.getDate() === now.getDate() + 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      const formattedTime = date.toLocaleTimeString("en-IN", timeOptions);

      if (isToday) return `Today, ${formattedTime}`;
      if (isTomorrow) return `Tomorrow, ${formattedTime}`;

      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + `, ${formattedTime}`;
    };



  return (
    <View className="flex-row mb-4 rounded-2xl shadow-md overflow-hidden">
      <View className={`${sideColor} w-2`} />
      <View className="flex-1 bg-white p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text
            className={`text-gray-800 font-medium text-base ${
              completed ? "line-through text-gray-500" : ""
            }`}
          >
            {taskName}
          </Text>

        </View>

        <TouchableOpacity
          onPress={handleToggle}
          disabled={loading}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            completed ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons
              name={completed ? "check-circle" : "radio-button-unchecked"}
              size={24}
              color="white"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskCard;
