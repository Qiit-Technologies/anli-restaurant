import { useState } from 'react';
import { toast } from 'sonner';

const useImageUpload = () => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadImage = async (file: File) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'anli_default');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const uploadResponse = await fetch(
                'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal,
                },
            );

            clearTimeout(timeoutId);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('[useImageUpload] Upload failed:', {
                    status: uploadResponse.status,
                    statusText: uploadResponse.statusText,
                    error: errorText,
                });
                throw new Error(
                    `Image upload failed: ${uploadResponse.statusText}`,
                );
            }

            const imageData = await uploadResponse.json();
            setIsLoading(false);
            return imageData.secure_url;
        } catch (error: any) {
            console.error('[useImageUpload] Upload error:', {
                error,
                message: error?.message,
                name: error?.name,
                code: error?.code,
            });
            setIsLoading(false);

            if (
                error?.name === 'AbortError' ||
                error?.message?.includes('timeout')
            ) {
                toast.error(
                    'Upload timed out. Please check your connection and try again.',
                );
            } else if (
                error?.message?.includes('Network') ||
                error?.code === 'ERR_NETWORK'
            ) {
                toast.error(
                    'Network error. Please check your internet connection and try again.',
                );
            } else {
                toast.error('Image upload failed. Please try again.');
            }
            return null;
        }
    };

    return { uploadImage, isLoading };
};

export default useImageUpload;
