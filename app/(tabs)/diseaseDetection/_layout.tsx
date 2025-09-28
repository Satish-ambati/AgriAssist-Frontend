import { Stack } from "expo-router";
export default function diseaseDetectionLayout() {
  return (
    <Stack>
      <Stack.Screen name="cameraCapture" options={{ headerShown: false }} />
      <Stack.Screen name="diseaseResult" options={{ headerShown: false }} />
    </Stack>
  );
}
