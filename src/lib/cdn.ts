import { apiPOST } from "@/lib/api";

function base64ToBinary(base64: string): Uint8Array {
    const raw = atob(base64);
    const array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

function isFileImage(fileBinary: Uint8Array): boolean {
    const jpegHeader = [0xFF, 0xD8];
    const pngHeader = [0x89, 0x50, 0x4E, 0x47];

    if (
        fileBinary.length >= 2 &&
        fileBinary[0] === jpegHeader[0] &&
        fileBinary[1] === jpegHeader[1]
    ) {
        return true;
    } else if (
        fileBinary.length >= 4 &&
        fileBinary[0] === pngHeader[0] &&
        fileBinary[1] === pngHeader[1] &&
        fileBinary[2] === pngHeader[2] &&
        fileBinary[3] === pngHeader[3]
    ) {
        return true;
    } else {
        return false;
    }
}

export function uploadCDN(
    fileFolder: string,
    base64Data: string,
    onLoading?: () => void,
    onSuccess?: (response: any) => void,
    onError?: (error: string) => void
) {
    const fileBinary = base64ToBinary(base64Data.split(",")[1]);

    const fileSizeInBytes = fileBinary.length;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (fileSizeInMB > 8) {
        onError?.("The file size exceeds the 8MB limit!");
        return;
    }

    if (!isFileImage(fileBinary)) {
        onError?.("The given file is not an image!");
        return;
    }

    onLoading?.();

    apiPOST(
        "cdnupload",
        { FileBinary: base64Data.replace("data:image/jpeg;base64,", ""), FileGroup: fileFolder },
        (response: any) => onSuccess?.(response.m),
        (error: any) => onError?.(error)
    );
}

export function uploadImage(
    fileFolder: string,
    onLoading?: () => void,
    onSuccess?: (response: any) => void,
    onError?: (error: string) => void
) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg";
    fileInput.style.display = "none";

    fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {
                const base64String = reader.result as string;
                uploadCDN(fileFolder, base64String, onLoading, onSuccess, onError);
            };
        }
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}
