import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Api } from "@/app/api";

// Types
interface Props {
  cropCycleId: string;
}

interface Activity {
  _id: string;
  name: string;
  type: string;
  icon: string;
  date: string; // ISO date string
}

interface ScheduleDay {
  date: string;
  activities: Activity[];
}

// Helper functions
const getDateInfo = (dateString: string) => {
  const date = new Date(dateString);
  return {
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
    dayMonth: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  };
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case "water": return "bg-blue-100 border-blue-300";
    case "fertilizer": return "bg-green-100 border-green-300";
    case "check": return "bg-yellow-100 border-yellow-300";
    case "maintenance": return "bg-purple-100 border-purple-300";
    case "harvest": return "bg-orange-100 border-orange-300";
    default: return "bg-gray-100 border-gray-300";
  }
};

// Main Component
const WeeklySchedule: React.FC<Props> = ({ cropCycleId }) => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${Api}/api/task/week/${cropCycleId}`);
        if (res.data.success) {
          setSchedule(res.data.schedule);
        } else {
          setSchedule([]); // fallback empty schedule
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setSchedule([]); // fallback empty schedule
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [cropCycleId]);

  if (loading) return <ActivityIndicator size="large" color="#16a34a" className="mt-10" />;

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {schedule.map((day, idx) => {
          const dateInfo = getDateInfo(day.date);

          return (
            <View
              key={idx}
              className="bg-white rounded-2xl shadow-md p-5 mb-4 border border-gray-200"
            >
              {/* Date Header */}
              <View className="mb-4 border-b border-gray-300 pb-2">
                <Text className="text-xl font-bold text-gray-800">{dateInfo.dayName}</Text>
                <Text className="text-gray-600 text-sm">{dateInfo.dayMonth}</Text>
              </View>

              {/* Tasks */}
              {day.activities.length > 0 ? (
                day.activities.map((task) => (
                  <View
                    key={task._id}
                    className={`flex-row items-center p-3 rounded-xl border mb-2 ${getTypeColor(task.type)}`}
                  >
                    <Text className="text-xl mr-3">{task.icon}</Text>
                    <Text className="font-semibold text-gray-800 flex-1">{task.name}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 italic text-center py-4">
                  No tasks scheduled for this day.
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeeklySchedule;
