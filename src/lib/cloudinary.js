const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const uploadToCloudinary = async (file, folder = "erp-uploads") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "erp_unsigned");
    formData.append("folder", folder);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            {
                method: "POST",
                body: formData,
            }
        );
        const data = await response.json();
        return {
            url: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
        };
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};

export const getCloudinaryUrl = (publicId, options = {}) => {
    const { width, height, crop = "fill", quality = "auto" } = options;
    let transformations = `q_${quality}`;
    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
    if (crop) transformations += `,c_${crop}`;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};
