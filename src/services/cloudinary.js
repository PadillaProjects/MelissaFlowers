import axios from "axios";

const CLOUD_NAME = "rhfqvf7f";
const UPLOAD_PRESET = "melissa_preset";

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary", error);
    throw error;
  }
};

export const getOptimizedUrl = (url, width = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  // This tells Cloudinary to automatically compress and resize the image for blazing fast loads
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};
