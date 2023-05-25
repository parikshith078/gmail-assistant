import { List, Detail, Toast, showToast, Icon, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import * as google from "./lib/google";
import { EmailDetails } from "./lib/types";

// Update the service name here for testing different providers
const serviceName = "google";

export default function Command() {
  const service = getService(serviceName);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<EmailDetails[]>([]);
  const [showingDetail, setShowingDetail] = useState(false);

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
    <List isLoading={isLoading} isShowingDetail={showingDetail}>
      {items.map((item, id) => {
        const props: Partial<List.Item.Props> = item.body
          ? {
            detail: <List.Item.Detail markdown={item.body} />,
          }
          : { detail: "No body" };
        return (
          <List.Item
            key={id}
            id={item.link}
            // TODO: add message sender profile picture
            icon={item.img}
            {...props}
            title={item.subject}
            subtitle={item.from}
            actions={
              <ActionPanel>
                <Action icon={"file.png"} title="Toggle Detail" onAction={() => setShowingDetail(!showingDetail)} />
                <Action.OpenInBrowser url={item.link} />
                <Action
                  title="Logout"
                  onAction={async () => {
                    service.logout();
                  }}
                />
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
  fetchInboxEmails(): Promise<EmailDetails[]>;
  logout(): Promise<void>;
}
