import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";

const STORAGE_KEY = "expense_diary_records";
const { height } = Dimensions.get("window");

const CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Transportation",
  "Labor",
  "Equipment",
  "Pesticides",
  "Irrigation",
  "Maintenance",
  "Marketing",
  "Others",
] as const;

type Category = (typeof CATEGORIES)[number];

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
}

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface SuccessToastProps {
  visible: boolean;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
          <View className="items-center mb-4">
            <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <Ionicons name="warning" size={32} color="#dc2626" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
            <Text className="text-gray-600 text-center text-base">{message}</Text>
          </View>

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity onPress={onCancel} className="flex-1 bg-gray-100 py-4 rounded-xl">
              <Text className="text-gray-700 text-center font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} className="flex-1 bg-red-600 py-4 rounded-xl">
              <Text className="text-white text-center font-semibold text-base">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SuccessToast: React.FC<SuccessToastProps> = ({ visible, message }) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity }} className="absolute bottom-20 left-6 right-6 z-50">
      <View className="bg-green-500 rounded-2xl p-4 flex-row items-center shadow-lg">
        <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3">
          <Ionicons name="checkmark-circle" size={24} color="white" />
        </View>
        <Text className="text-white font-semibold text-base flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
};

export default function ExpenseDiaryScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{ visible: boolean; expenseId: string | null }>(
    { visible: false, expenseId: null }
  );
  const [successToast, setSuccessToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  // New filter state
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");

  // Form fields
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<Category>("Seeds");
  const [description, setDescription] = useState<string>("");

  // Pan responder
  const translateY = useState(new Animated.Value(0))[0];
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) closeModal();
      else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const storedData = await SecureStore.getItemAsync(STORAGE_KEY);
      if (storedData) {
        const parsed: Expense[] = JSON.parse(storedData);
        const sorted = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(sorted);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const saveExpenses = async (updated: Expense[]) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving expenses:", error);
    }
  };

  const closeModal = () => {
    Animated.timing(translateY, { toValue: height, duration: 300, useNativeDriver: true }).start(
      () => {
        setModalVisible(false);
        translateY.setValue(0);
      }
    );
  };

  const openModal = () => {
    setModalVisible(true);
    setCategoryDropdownOpen(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessToast({ visible: true, message: msg });
    setTimeout(() => setSuccessToast({ visible: false, message: "" }), 2500);
  };

  const handleAddExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!description.trim()) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      date: date.toISOString().split("T")[0],
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    await saveExpenses(updated);

    setDate(new Date());
    setAmount("");
    setCategory("Seeds");
    setDescription("");
    closeModal();
    showSuccess("Expense added successfully!");
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((exp) => exp.id !== id);
    setExpenses(updated);
    await saveExpenses(updated);
    setConfirmDialog({ visible: false, expenseId: null });
    showSuccess("Expense deleted successfully!");
  };

  const getTotalExpenses = () => expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryTotal = (cat: Category) =>
    expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses =
    filterCategory === "All" ? expenses : expenses.filter((e) => e.category === filterCategory);

  // Icon mappings
  const getCategoryIcon = (cat: Category): keyof typeof Ionicons.glyphMap => {
    const icons: Record<Category, keyof typeof Ionicons.glyphMap> = {
      Seeds: "leaf",
      Fertilizer: "nutrition",
      Transportation: "car",
      Labor: "people",
      Equipment: "construct",
      Pesticides: "warning",
      Irrigation: "water",
      Maintenance: "build",
      Marketing: "megaphone",
      Others: "ellipsis-horizontal",
    };
    return icons[cat];
  };
  const getCategoryColor = (cat: Category) =>
    ({
      Seeds: "bg-emerald-50",
      Fertilizer: "bg-amber-50",
      Transportation: "bg-blue-50",
      Labor: "bg-purple-50",
      Equipment: "bg-slate-50",
      Pesticides: "bg-rose-50",
      Irrigation: "bg-cyan-50",
      Maintenance: "bg-orange-50",
      Marketing: "bg-pink-50",
      Others: "bg-gray-50",
    }[cat]);
  const getCategoryBorderColor = (cat: Category) =>
    ({
      Seeds: "border-emerald-200",
      Fertilizer: "border-amber-200",
      Transportation: "border-blue-200",
      Labor: "border-purple-200",
      Equipment: "border-slate-200",
      Pesticides: "border-rose-200",
      Irrigation: "border-cyan-200",
      Maintenance: "border-orange-200",
      Marketing: "border-pink-200",
      Others: "border-gray-200",
    }[cat]);
  const getCategoryIconColor = (cat: Category) =>
    ({
      Seeds: "#059669",
      Fertilizer: "#d97706",
      Transportation: "#2563eb",
      Labor: "#9333ea",
      Equipment: "#475569",
      Pesticides: "#e11d48",
      Irrigation: "#0891b2",
      Maintenance: "#ea580c",
      Marketing: "#ec4899",
      Others: "#6b7280",
    }[cat]);

  return (
    <View className="flex-1 bg-[#ffffff]">
      <SuccessToast visible={successToast.visible} message={successToast.message} />

      {/* Header */}
      <View className="bg-green-500  pt-12 pb-6 px-6 rounded-b-[32px]">
        <TouchableOpacity className="absolute top-16 left-6" onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center justify-center mb-2">
          <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center mr-3">
            <Ionicons name="book" size={24} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold">Expense Diary</Text>
        </View>
        <Text className="text-green-100 text-center text-sm">Track your farm expenses efficiently</Text>

        {/* Total Summary Card */}
        <View className="bg-white rounded-xl p-4 mt-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 text-[11px] font-medium mb-1 uppercase">
                {filterCategory === "All"
                  ? "Total Expenses"
                  : `Total (${filterCategory})`}
              </Text>
              <Text className="text-green-700 text-2xl font-extrabold">
                ₹
                {(
                  filterCategory === "All"
                    ? getTotalExpenses()
                    : getCategoryTotal(filterCategory)
                ).toLocaleString("en-IN")}
              </Text>
            </View>
            <View className="bg-green-50 w-12 h-12 rounded-xl items-center justify-center">
              <Ionicons name="trending-up" size={24} color="#15803d" />
            </View>
          </View>

          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
            <Text className="text-gray-500 text-[11px] ml-1">
              {filteredExpenses.length} transactions
            </Text>
          </View>
        </View>


        {/* Filter Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <TouchableOpacity
            onPress={() => setFilterCategory("All")}
            className={`px-4 py-2 rounded-xl mr-2 ${
              filterCategory === "All" ? "bg-white" : "bg-green-600"
            }`}
          >
            <Text
              className={`font-semibold ${
                filterCategory === "All" ? "text-green-600" : "text-white"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl mr-2 ${
                filterCategory === cat ? "bg-white" : "bg-green-600"
              }`}
            >
              <Text
                className={`font-semibold ${
                  filterCategory === cat ? "text-green-600" : "text-white"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Expenses List */}
      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {filteredExpenses.length === 0 ? (
          <View className="items-center justify-center py-24">
            <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 font-semibold text-lg mb-2">No expenses yet</Text>
            <Text className="text-gray-500 text-sm text-center px-8">
              {filterCategory === "All"
                ? "Start tracking your farm expenses by adding your first entry"
                : `No expenses found for ${filterCategory}`}
            </Text>
          </View>
        ) : (
          filteredExpenses.map((expense) => (
            <View
              key={expense.id}
              className="bg-green-50 rounded-2xl p-4 mb-3 border border-green-300 shadow-sm"
            >
              {/* Header Row with Category + Delete Icon */}
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`${getCategoryColor(expense.category)} ${getCategoryBorderColor(
                      expense.category
                    )} border w-11 h-11 rounded-xl items-center justify-center mr-3`}
                  >
                    <Ionicons
                      name={getCategoryIcon(expense.category)}
                      size={20}
                      color={getCategoryIconColor(expense.category)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-800">
                      {expense.category}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                      <Text className="text-xs text-gray-500 ml-1">
                        {new Date(expense.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Delete Icon */}
                <TouchableOpacity
                  onPress={() => setConfirmDialog({ visible: true, expenseId: expense.id })}
                  className="p-1.5 rounded-full bg-red-50"
                >
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>

              {/* Description */}
              {expense.description ? (
                <View className=" rounded-xl  mt-3">
                  <Text className="text-gray-700 text-sm leading-5">
                    {expense.description}
                  </Text>
                </View>
              ) : null}

              {/* Amount */}
              <View className=" mt-2">
                <Text className="text-lg font-bold text-green-700">
                  ₹{expense.amount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          ))
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={openModal}
        className="absolute bottom-8 right-6 bg-green-600 w-16 h-16 rounded-full items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add Expense Modal with Drag Support */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Animated.View
            style={{
              transform: [{ translateY }],
            }}
            className="bg-white rounded-t-[32px] max-h-[90%]"
          >
            {/* Drag Handle */}
            <View {...panResponder.panHandlers} className="items-center pt-3 pb-2">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            <View className="px-6 pb-6">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center mb-6 mt-2">
                <View className="flex-row items-center">
                  <View className="bg-green-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="add-circle" size={22} color="#15803d" />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">
                    Add New Expense
                  </Text>
                </View>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close-circle" size={28} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Date Field */}
                <View className="mb-5">
                  <Text className="text-sm font-bold text-gray-700 mb-2">
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#15803d"
                      />
                      <Text className="text-base text-gray-800 ml-3 font-medium">
                        {date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}

                {/* Amount Field */}
                <View className="mb-5">
                  <Text className="text-sm font-bold text-gray-700 mb-2">
                    Amount
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 flex-row items-center">
                    <Text className="text-green-700 font-bold text-lg mr-2">
                      ₹
                    </Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      className="flex-1 text-base text-gray-800 font-medium"
                      placeholder="0.00"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Category Dropdown */}
                <View className="mb-5">
                  <Text className="text-sm font-bold text-gray-700 mb-2">
                    Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={getCategoryIcon(category)}
                        size={20}
                        color={getCategoryIconColor(category)}
                      />
                      <Text className="text-base text-gray-800 ml-3 font-medium">
                        {category}
                      </Text>
                    </View>
                    <Ionicons
                      name={categoryDropdownOpen ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>

                  {categoryDropdownOpen && (
                    <View className="bg-white border-2 border-gray-200 rounded-xl mt-2">
                      <ScrollView className="max-h-56">
                        {CATEGORIES.map((cat, index) => (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => {
                              setCategory(cat);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`px-4 py-3.5 flex-row items-center ${
                              index !== CATEGORIES.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            } ${category === cat ? "bg-green-50" : ""}`}
                          >
                            <Ionicons
                              name={getCategoryIcon(cat)}
                              size={20}
                              color={getCategoryIconColor(cat)}
                            />
                            <Text
                              className={`text-base ml-3 ${
                                category === cat
                                  ? "text-green-700 font-bold"
                                  : "text-gray-700"
                              }`}
                            >
                              {cat}
                            </Text>
                            {category === cat && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#15803d"
                                style={{ marginLeft: "auto" }}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Description Field */}
                <View className="mb-6">
                  <Text className="text-sm font-bold text-gray-700 mb-2">
                    Description / Notes
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-base text-gray-800"
                    placeholder="Add details about this expense..."
                    placeholderTextColor="#9ca3af"
                    textAlignVertical="top"
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-2">
                  <TouchableOpacity
                    onPress={closeModal}
                    className="flex-1 bg-gray-100 py-4 rounded-xl"
                  >
                    <Text className="text-gray-700 text-center font-bold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddExpense}
                    className="flex-1 bg-green-600 py-4 rounded-xl flex-row items-center justify-center"
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white text-center font-bold text-base ml-2">
                      Add Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title="Delete Expense?"
        message="This action cannot be undone. Are you sure you want to delete this expense?"
        onConfirm={() => confirmDialog.expenseId && handleDeleteExpense(confirmDialog.expenseId)}
        onCancel={() => setConfirmDialog({ visible: false, expenseId: null })}
      />
    </View>
  );
}