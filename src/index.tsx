import { ActionPanel, Form, Action, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { getService, SendMail } from "./lib/types";

export default function Command() {
  const service = getService("google");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        await service.authorize();
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(true);
        showToast({ style: Toast.Style.Failure, title: "Check your network connection" });
      }
    })();
  }, []);
  const handelSubmit = async (values: SendMail) => {
    try {
      const res = await service.sendEmail(values);
      console.log("submit:", res);
      console.log(typeof res);
      if (typeof res == "string") {
        console.log("test");
        showToast({ style: Toast.Style.Success, title: "Mail sent" });
        return;
      }
      showToast({ style: Toast.Style.Failure, title: "Failed to send" });
    } catch (error) {
      console.log("Error sending email");
      console.error(error);
      showToast({ style: Toast.Style.Failure, title: "Failed to send the mail check your network connection" });
    }
  };
  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Name" onSubmit={handelSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="to" placeholder="To" autoFocus info="To address" />
      <Form.TextField id="subject" placeholder="Subject" info="Subject" />
      <Form.TextArea id="body" placeholder="Body" info="Body" />
    </Form>
  );
}
