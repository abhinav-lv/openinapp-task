import { gmail } from "./utils";

export default async (labelName: string) => {
  try {
    // Get list of labels
    gmail.users.labels.list({ userId: "me" }, (err, res) => {
      if (err) throw new Error(`Error listing labels: ${err.message}`);

      const labels = res?.data.labels;
      const labelExists = labels?.some((label) => label.name === labelName);
      if (labelExists) return;

      // Create label
      gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });
    });
  } catch (err: any) {
    console.error(`create label: ${err.message}`);
  }
};
