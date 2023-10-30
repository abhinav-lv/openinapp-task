import { User, gmail } from "./utils";

export default async (user: User) => {
  // Get all unread emails in inbox
  const messageIDs = (
    await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: "label:unread",
    })
  ).data.messages;
  if (!messageIDs) {
    console.log("No new emails found");
    return;
  }

  // Get message objects for each ID
  messageIDs.forEach(async (messageIdObj) => {
    if (!messageIdObj.id) return;

    // Get message object from its ID
    const message = (
      await gmail.users.messages.get({ userId: "me", id: messageIdObj.id })
    ).data;
    if (!message.payload || !message.threadId) return;

    // Get threadId and sender information
    const threadId = message.threadId;
    const headers = message.payload.headers;
    if (!headers) return;
    const sender = headers.find((header) => header.name === "From")?.value;
    if (!sender) return;

    // Get thread message object from the threadId
    const thread = (
      await gmail.users.threads.get({ userId: "me", id: threadId })
    ).data;
    if (!thread.messages) return;

    // Check if the user is the sender of any previous email in the thread
    const isUserSent = thread.messages.some((threadMessage) =>
      threadMessage.payload?.headers?.some(
        (header) =>
          header?.name === "From" && header?.value?.includes(user.email)
      )
    );
    if (isUserSent || sender.includes(user.email)) return;

    // Unread thread found that does not contain any reply from user!
    console.log(`Unread message from :${sender}`);

    // Generate raw message in base64 format to be sent
    const rawReplyMessage = Buffer.from(
      `To: ${sender}\r\n` +
        `Content-Type: text/plain; charset="UTF-8"\r\n` +
        `MIME-Version: 1.0\r\n` +
        `References: <${threadId}>\r\n` +
        `In-Reply-To: <${threadId}>\r\n` +
        `Subject: Re: Reply to this mail\r\n\r\nSome random content\r\n`
    ).toString("base64");

    // Send message asynchronously
    gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: rawReplyMessage, threadId },
    });

    // Get list of labels in user's gmail and find label id of "openingapp" if exists
    const labels = (await gmail.users.labels.list({ userId: "me" })).data
      .labels;
    const labelId = labels?.find((label) => label?.name === "openinapp")?.id;
    if (!labelId) return;

    // Asynchronously add label "openingapp" to the thread
    gmail.users.threads.modify({
      userId: "me",
      id: threadId,
      requestBody: { addLabelIds: ["INBOX", labelId] },
    });
  });
};
