import { ActionPanel, Form, Action, Toast, showToast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { getService, SendMail } from "./lib/types";

export default function Command() {
  const service = getService("google");
  const [isLoading, setIsLoading] = useState(true);
  const [emailError, setEmailError] = useState<string | undefined>();

  const bodyRef = useRef<Form.TextArea>(null);
  const subjectRef = useRef<Form.TextField>(null);

  function dropEmailErrorIfNeeded() {
    if (emailError && emailError.length > 0) {
      setEmailError(undefined);
    }
  }

  function validateEmail(email: string): boolean {
    // Regular expression pattern to match email format
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Use the test() method of the regular expression to check if the email matches the pattern
    return emailPattern.test(email);
  }

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
        bodyRef.current?.reset();
        subjectRef.current?.reset();
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
          <Action.SubmitForm title="Send" onSubmit={handelSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="to"
        placeholder="To"
        autoFocus
        info="To address"
        error={emailError}
        storeValue
        onChange={dropEmailErrorIfNeeded}
        onBlur={(event) => {
          const value = event.target.value;
          if (value && value.length > 0) {
            if (!validateEmail(value)) {
              setEmailError("Not a valid Email");
            } else {
              dropEmailErrorIfNeeded();
            }
          } else {
            setEmailError("The field should't be empty!");
          }
        }}
      />
      <Form.TextField id="subject" ref={subjectRef} storeValue={false} placeholder="Subject" info="Subject" />
      <Form.TextArea id="body" ref={bodyRef} placeholder="Body" storeValue={false} info="Body" />
    </Form>
  );
}
