import axios from "axios";
import * as FileSystem from "expo-file-system";

interface ImageData {
  uri: string;
  width?: number;
  height?: number;
}
const getFileSize = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.size || null;
  } catch {
    return null;0
  }
};

export const bulkAnalyzeImages = async (images: ImageData[]) => {
  const formData = new FormData();

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const fileSize = await getFileSize(img.uri);
    formData.append("images", {
      uri: img.uri,
      type: "image/jpeg",
    } as any);
    const metadata = {
      uploadDate: new Date().toISOString(),
      fileSize: fileSize,
      dimensions: {
        width: img.width || null,
        height: img.height || null,
      },
    };

    formData.append(`metadata[${i}]`, JSON.stringify(metadata));
  }

  try {
    const response = await axios.post(
      "https://your-api.com/api/disease/bulk-analyze",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Bulk upload failed:", error.response || error.message);
    throw error;
  }
};
