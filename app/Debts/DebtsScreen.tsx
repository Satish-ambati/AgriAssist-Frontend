import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Api } from "../api";
import { SafeAreaView } from "react-native-safe-area-context";

interface Debt {
  _id: string;
  principalAmount: number;
  amountPaid: number;
  currentDebt: number;
  dailyPayable: number;
  interestRate?: number;
  status: string;
  dueDate: string;
}

const DebtsScreen = () => {
  const router = useRouter();
  const { farmerId } = useLocalSearchParams<{ farmerId: string }>();

  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  // Edit form states
  const [editPrincipal, setEditPrincipal] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editInterestRate, setEditInterestRate] = useState("");
  const [editing, setEditing] = useState(false);

  const [showCompleted, setShowCompleted] = useState(false);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Api}/api/debt/${farmerId}`);

      if (res.data?.success) {
        setDebts(res.data.data || []);
      } else {
        setDebts([]);
      }
    } catch {
      Alert.alert("Error", "Failed to load debts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (farmerId) fetchDebts();
  }, [farmerId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDebts();
  };

  const money = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusConfig = {
    on_time: { bg: "bg-emerald-100", text: "text-emerald-800", label: "On Time" },
    overdue: { bg: "bg-red-100", text: "text-red-800", label: "Overdue" },
    paid: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Completed" },
  };

  const handlePayDebt = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      Alert.alert("Invalid amount", "Enter a valid payment amount");
      return;
    }

    try {
      setPaying(true);
      
      await axios.post(`${Api}/api/debt/pay/${selectedDebt?._id}`, {
        amount: Number(payAmount),
      });

      Alert.alert("Success", "Payment recorded successfully");
      setPayModalVisible(false);
      setPayAmount("");
      setSelectedDebt(null);
      fetchDebts();
    } catch {
      Alert.alert("Error", "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleEditDebt = async () => {
    if (!editPrincipal || Number(editPrincipal) <= 0) {
      Alert.alert("Invalid Input", "Principal amount must be greater than 0");
      return;
    }

    try {
      setEditing(true);
      await axios.put(`${Api}/api/debt/${selectedDebt?._id}`, {
        principalAmount: Number(editPrincipal),
        dueDate: editDueDate,
        interestRate: Number(editInterestRate),
      });

      Alert.alert("Success", "Debt updated successfully");
      setEditModalVisible(false);
      setSelectedDebt(null);
      fetchDebts();
    } catch {
      Alert.alert("Error", "Failed to update debt");
    } finally {
      setEditing(false);
    }
  };

  const openEditModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setEditPrincipal(debt.principalAmount.toString());
    setEditDueDate(new Date(debt.dueDate).toISOString().split('T')[0]);
    setEditInterestRate(debt.interestRate?.toString() || "0");
    setEditModalVisible(true);
  };

  // Filter debts based on completion status
  const activeDebts = debts.filter(d => d.currentDebt > 0);
  const completedDebts = debts.filter(d => d.currentDebt === 0);

  const displayDebts = showCompleted ? completedDebts : activeDebts;

  // Calculate totals
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.currentDebt, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.amountPaid, 0);

  return (
    <View className="flex-1  bg-green-50">
      {/* Header */}
      <View className="bg-green-500 px-5  pt-4 pb-4 border-b rounded-xl border-slate-200">
        <View className="flex-row pt-5 justify-between items-center">
          <Text className="text-2xl font-bold text-white">
            Debt Management
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/Debts/AddDebtScreen?farmerId=${farmerId}`)}
            className="bg-white px-5 py-2.5 rounded-xl shadow-sm "
          >
            <Text className="text-green-500 font-semibold text-sm">
              + Add Debt
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-3 text-slate-500 text-sm">
            Loading debts...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10b981"]} />
          }
        >
          {/* Toggle Buttons */}
          {(activeDebts.length > 0 || completedDebts.length > 0) && (
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity
                onPress={() => setShowCompleted(false)}
                className={`flex-1 py-3 rounded-xl ${!showCompleted ? 'bg-green-500' : 'bg-white border-1 border-slate-200'}`}
              >
                <Text className={`text-center font-semibold ${!showCompleted ? 'text-white' : 'text-slate-600'}`}>
                  Active ({activeDebts.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowCompleted(true)}
                className={`flex-1 py-3 rounded-xl ${showCompleted ? 'bg-green-500' : 'bg-white border-2 border-slate-200'}`}
              >
                <Text className={`text-center font-semibold ${showCompleted ? 'text-white' : 'text-slate-600'}`}>
                  Completed ({completedDebts.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Summary Cards - Only for Active View */}
          {!showCompleted && activeDebts.length > 0 && (
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-sm">
                <Text className="text-xs text-slate-500 font-semibold mb-1">
                  TOTAL DEBT
                </Text>
                <Text className="text-xl font-bold text-slate-900">
                  {money(totalDebt)}
                </Text>
              </View>

              <View className="flex-1 bg-white p-4 rounded-2xl border-l-4 border-green-500 shadow-sm">
                <Text className="text-xs text-slate-500 font-semibold mb-1">
                  TOTAL PAID
                </Text>
                <Text className="text-xl font-bold text-slate-900">
                  {money(totalPaid)}
                </Text>
              </View>
            </View>
          )}

          {/* Debt List */}
          {displayDebts.length === 0 ? (
            <View className="bg-white rounded-2xl p-12 items-center mt-10">
              <View className="w-20 h-20 rounded-full bg-slate-100 justify-center items-center mb-4">
                <Text className="text-4xl">{showCompleted ? '✅' : '📊'}</Text>
              </View>
              <Text className="text-lg font-semibold text-slate-900 mb-2">
                {showCompleted ? 'No Completed Debts' : 'No Active Debts'}
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                {showCompleted 
                  ? 'Completed debts will appear here' 
                  : 'Start by adding a new debt record'}
              </Text>
            </View>
          ) : (
            displayDebts.map((debt, index) => {
              const isCompleted = debt.currentDebt === 0;
              const config = isCompleted ? statusConfig.paid : statusConfig.on_time;
              const progress = (debt.amountPaid / debt.principalAmount) * 100;

              return (
                <View
                  key={debt._id}
                  className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
                >
                  {/* Header */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="text-xs text-slate-500 mb-1">
                        DEBT #{index + 1}
                      </Text>
                      <Text className="text-2xl font-bold text-slate-900">
                        {money(debt.principalAmount)}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <View className={`${config.bg} px-3 py-1.5 rounded-full`}>
                        <Text className={`text-xs font-bold ${config.text} uppercase`}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="mb-4">
                    <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                    <Text className="text-xs text-slate-500 mt-1.5 text-right">
                      {progress.toFixed(1)}% paid
                    </Text>
                  </View>

                  {/* Details Grid */}
                  <View className="gap-3 mb-4">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500">Amount Paid</Text>
                      <Text className="text-sm font-semibold text-emerald-600">
                        {money(debt.amountPaid)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500">Remaining</Text>
                      <Text className={`text-sm font-semibold ${isCompleted ? 'text-indigo-600' : 'text-red-500'}`}>
                        {money(debt.currentDebt)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500">Daily Payable</Text>
                      <Text className="text-sm font-semibold text-slate-900">
                        {money(debt.dailyPayable)}
                      </Text>
                    </View>

                    <View className="h-px bg-slate-200 my-1" />

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500">Due Date</Text>
                      <Text className="text-sm font-semibold text-slate-900">
                        {new Date(debt.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {!isCompleted && (
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        className="flex-1 bg-green-500 py-3.5 rounded-xl items-center active:bg-green-600"
                        onPress={() => {
                          setSelectedDebt(debt);
                          setPayModalVisible(true);
                        }}
                      >
                        <Text className="text-white font-semibold text-sm">
                          Make Payment
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="bg-slate-100 px-4 py-3.5 rounded-xl items-center active:bg-slate-200"
                        onPress={() => openEditModal(debt)}
                      >
                        <Text className="text-slate-700 font-semibold text-sm">
                          ✏️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Payment Modal */}
      <Modal visible={payModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6 pb-8">
              <View className="w-10 h-1 bg-slate-300 rounded-full self-center mb-5" />

              <Text className="text-2xl font-bold text-slate-900 mb-2">
                Make Payment
              </Text>

              <View className="bg-slate-50 p-4 rounded-xl mb-5">
                <Text className="text-xs text-slate-500 mb-1">
                  REMAINING BALANCE
                </Text>
                <Text className="text-3xl font-bold text-red-500">
                  {money(selectedDebt?.currentDebt || 0)}
                </Text>
              </View>

              <Text className="text-sm text-slate-600 mb-2 font-semibold">
                Payment Amount
              </Text>
              <TextInput
                className="border-2 border-slate-200 rounded-xl p-4 text-base mb-6 bg-white"
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
                value={payAmount}
                onChangeText={setPayAmount}
              />

              <TouchableOpacity
                className={`py-4 rounded-xl items-center mb-3 ${paying ? 'bg-slate-400' : 'bg-emerald-500 active:bg-emerald-600'}`}
                onPress={handlePayDebt}
                disabled={paying}
              >
                <Text className="text-white font-semibold text-base">
                  {paying ? "Processing..." : "Confirm Payment"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center py-3"
                onPress={() => {
                  setPayModalVisible(false);
                  setPayAmount("");
                }}
              >
                <Text className="text-slate-600 font-semibold text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6 pb-8">
              <View className="w-10 h-1 bg-slate-300 rounded-full self-center mb-5" />

              <Text className="text-2xl font-bold text-slate-900 mb-5">
                Edit Debt
              </Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm text-slate-600 mb-2 font-semibold">
                    Principal Amount
                  </Text>
                  <TextInput
                    className="border-2 border-slate-200 rounded-xl p-4 text-base bg-white"
                    keyboardType="numeric"
                    placeholder="Enter principal amount"
                    placeholderTextColor="#94a3b8"
                    value={editPrincipal}
                    onChangeText={setEditPrincipal}
                  />
                </View>

                <View>
                  <Text className="text-sm text-slate-600 mb-2 font-semibold">
                    Due Date (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    className="border-2 border-slate-200 rounded-xl p-4 text-base bg-white"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={editDueDate}
                    onChangeText={setEditDueDate}
                  />
                </View>

                <View>
                  <Text className="text-sm text-slate-600 mb-2 font-semibold">
                    Interest Rate (%)
                  </Text>
                  <TextInput
                    className="border-2 border-slate-200 rounded-xl p-4 text-base bg-white"
                    keyboardType="numeric"
                    placeholder="Enter interest rate"
                    placeholderTextColor="#94a3b8"
                    value={editInterestRate}
                    onChangeText={setEditInterestRate}
                  />
                </View>
              </View>

              <TouchableOpacity
                className={`mt-6 py-4 rounded-xl items-center mb-3 ${editing ? 'bg-slate-400' : 'bg-blue-500 active:bg-blue-600'}`}
                onPress={handleEditDebt}
                disabled={editing}
              >
                <Text className="text-white font-semibold text-base">
                  {editing ? "Updating..." : "Update Debt"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center py-3"
                onPress={() => {
                  setEditModalVisible(false);
                  setSelectedDebt(null);
                }}
              >
                <Text className="text-slate-600 font-semibold text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default DebtsScreen;