import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

import TaskCard from "@/app/components/TaskCard";
import { Api } from "@/app/api";

interface Props {
  cropCycleId: string;
  cropData: any;
}

// Progress Bar UI
const CustomProgressBar: React.FC<{ progress: number; colorClass: string }> = ({
  progress,
  colorClass,
}) => (
  <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
    <View
      className={`${colorClass} h-3`}
      style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
    />
  </View>
);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return `${date.getDate()} ${date.toLocaleString("default", {
    month: "short",
  })} ${date.getFullYear()}`;
};

const CropGrowth: React.FC<Props> = ({ cropCycleId, cropData }) => {
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // ⭐ NEW: Track which task is allowed to toggle
  const [currentAllowedTask, setCurrentAllowedTask] = useState(0);

  // === Fetch today's tasks from backend ===
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        const res = await axios.get(`${Api}/api/task/today/${cropCycleId}`);
        if (res.data.success) {
          setTodayTasks(res.data.tasks || []);
        } else {
          setTodayTasks([]);
        }
      } catch (err) {
        console.error("Error loading today tasks:", err);
        setTodayTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [cropCycleId]);

  // === Calculate Growth Progress ===
  const growthPercent = useMemo(() => {
    try {
      if (!cropData?.timeline) return 0;
      const today = new Date();
      const sowing = new Date(cropData.timeline.sowingDate);
      const harvest = new Date(cropData.timeline.expectedHarvestDate);

      const totalDuration =
        (harvest.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24);
      const elapsed =
        (today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24);

      if (totalDuration <= 0) return 0;
      return Math.min(
        100,
        Math.max(0, Math.round((elapsed / totalDuration) * 100))
      );
    } catch (e) {
      return 0;
    }
  }, [cropData]);

  const toggleTodayTask = async (taskId: string, index: number) => {
    const updatedTasks = [...todayTasks];

    // Find last completed task index
    const lastCompletedIndex = updatedTasks.findLastIndex(
      (task) => task.status === "completed"
    );

    const isCompleted = updatedTasks[index].status === "completed";

    // ======== STRICT ORDER CHECKS ========

    // 1️⃣ Completing a task out of order 
    if (!isCompleted && index !== lastCompletedIndex + 1) {
      Alert.alert(
        "Follow Task Order",
        "Please complete tasks in order.\n\nPlease follow the order of tasks.",
        [{ text: "OK" }]
      );
      return;
    }

    // 2️⃣ Un-completing a task out of order
    // User can only uncomplete the LAST completed task
    if (isCompleted && index !== lastCompletedIndex) {
      Alert.alert(
        "Cannot Undo This Task",
        "You must undo tasks in reverse order.\n\nPlease follow the order of tasks.",
        [{ text: "OK" }]
      );
      return;
    }

    // ======== ALLOW TOGGLE ========
    const newStatus = isCompleted ? "pending" : "completed";
    updatedTasks[index].status = newStatus;
    setTodayTasks(updatedTasks);

    try {
      const res = await axios.put(
        `${Api}/api/task/update-status/${taskId}`,
        { status: newStatus }
      );

      if (!res.data.success) {
        updatedTasks[index].status = isCompleted ? "completed" : "pending";
        setTodayTasks([...updatedTasks]);
        Alert.alert("Error", "Failed to update task.");
      }
    } catch (error) {
      updatedTasks[index].status = isCompleted ? "completed" : "pending";
      setTodayTasks(updatedTasks);
      Alert.alert("Error", "Failed to update task.");
    }
  };


  const totalExpense = cropData?.expenses?.total ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-blue-50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Crop Summary --- */}
        <View className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-green-500 p-3 rounded-xl">
              <MaterialIcons name="agriculture" size={28} color="#fff" />
            </View>
            <Text className="text-2xl font-extrabold text-gray-800">
              {cropData?.crop?.name || "Unknown Crop"} (
              {cropData?.crop?.variety || "Variety"})
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-gray-700 text-sm font-medium">
              Category :{" "}
              <Text className="text-blue-600">
                {cropData?.crop?.category || "-"}
              </Text>
            </Text>
            <Text className="text-gray-700 text-sm font-medium">
              Season :{" "}
              <Text className="text-green-500">{cropData?.season || "-"}</Text>
            </Text>
            <Text className="text-gray-700 text-sm font-medium">
              Stage :{" "}
              <Text className="text-green-500">{cropData?.cropStage || "-"}</Text>
            </Text>
          </View>
        </View>

        {/* --- Growth Status --- */}
        <View className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-green-700">
              Growth Status
            </Text>
            <View className="bg-green-100 p-2 rounded-full">
              <MaterialIcons name="trending-up" size={24} color="#16a34a" />
            </View>
          </View>

          <Text className="text-sm font-medium text-gray-600 mb-2">
            Overall Progress
          </Text>
          <CustomProgressBar
            progress={growthPercent}
            colorClass="bg-green-500"
          />

          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-500">
              Sowing: {formatDate(cropData?.timeline?.sowingDate)}
            </Text>
            <Text className="text-sm font-semibold text-green-600">
              {growthPercent}%
            </Text>
            <Text className="text-sm text-gray-500">
              Harvest: {formatDate(
                cropData?.timeline?.expectedHarvestDate
              )}
            </Text>
          </View>
        </View>

        {/* --- TODAY TASKS --- */}
        <View className="bg-green-50 rounded-2xl shadow-md p-5 mb-8 border border-green-400">
          <Text className="text-xl font-bold text-green-700 mb-4">
            Today's Tasks
          </Text>

          {/* LOADING STATE */}
          {loadingTasks && (
            <ActivityIndicator size="large" color="#16a34a" />
          )}

          {/* NO TASKS */}
          {!loadingTasks && todayTasks.length === 0 && (
            <Text className="text-gray-500 italic">
              No tasks scheduled for today.
            </Text>
          )}

          {/* TASK LIST */}
          {!loadingTasks &&
            todayTasks.map((task: any, index: number) => (
              <TaskCard
                key={task._id || index}
                id={task._id}
                taskName={task.task}
                completed={task.status === "completed"}
                onToggle={() => toggleTodayTask(task._id, index)}
                dueTime={task.dateToCompleteTask}
                priority={task.priority || "medium"}
                option={3}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CropGrowth;
