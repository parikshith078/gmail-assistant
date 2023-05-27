import * as path from "path";

export function getFileName(filePath: string): string {
  return path.basename(filePath);
}

export function getContentType(filePath: string): string {
  const extension = path.extname(filePath);

  switch (extension.toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
    case ".docx":
      return "application/msword";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    // Add more cases for other file extensions if needed
    default:
      return "application/octet-stream";
  }
}
