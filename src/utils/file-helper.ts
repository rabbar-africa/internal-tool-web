export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

export const getExtension = (fileToParse?: File | undefined | null) => {
  if (!fileToParse) return "";
  return fileToParse.name
    .toLowerCase()
    .slice(fileToParse.name.lastIndexOf("."));
};
export const createDownloadLink = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Defer revoking the object URL. Mobile browsers (iOS Safari, Android Chrome)
  // start the download asynchronously, so revoking synchronously here cancels
  // it before the blob is read — which is why downloads silently fail on
  // mobile while working on desktop.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};
