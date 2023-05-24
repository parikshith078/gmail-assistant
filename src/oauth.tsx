import { List, Detail, Toast, showToast, Icon, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import * as google from "./lib/google";

// Update the service name here for testing different providers
const serviceName = "google";

export default function Command() {
  const service = getService(serviceName);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ id: string; threadId: string; payload: { from: string; subject: string } }[]>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        await service.authorize();
        const fetchedItems = await service.fetchInboxEmails();
        // console.log("Fetched items:");
        // console.log(fetchedItems[0]);
        setItems(fetchedItems);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        showToast({ style: Toast.Style.Failure, title: String(error) });
      }
    })();
  }, [service]);

  if (isLoading) {
    return <Detail isLoading={isLoading} />;
  }

  return (
    <List isLoading={isLoading}>
      {items.map((item) => {
        return (
          <List.Item
            key={item.id}
            id={item.id}
            icon={Icon.TextDocument}
            title={item.payload.subject}
            subtitle={item.payload.from}
            // TODO: Add action to open email in browser
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content="👋" />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

// Services

function getService(serviceName: string): Service {
  switch (serviceName) {
    case "google":
      return google as Service;
    default:
      throw new Error("Unsupported service: " + serviceName);
  }
}

interface Service {
  authorize(): Promise<void>;
  fetchInboxEmails(): Promise<{ id: string; threadId: string; payload: { from: string; subject: string } }[]>;
}
