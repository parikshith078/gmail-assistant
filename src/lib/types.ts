export interface Email {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    partId: string;
    mimeType: string;
    filename: string;
    headers: {
      name: string;
      value: string;
    }[];
    body: {
      size: number;
    };
    parts: {
      // Define the structure of 'parts' if needed
      // ...
    }[];
  };
}
