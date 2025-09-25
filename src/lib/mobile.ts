"use client";

export default function isMobile() {
    if (typeof navigator !== "undefined") {
        const mobileRegex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return mobileRegex.test(navigator.userAgent);
    }
}