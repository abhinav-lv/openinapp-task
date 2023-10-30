import { Request, Response } from "express";
import { oAuth2Client } from "../lib/utils";
import { google } from "googleapis";

export const authenticate = async (req: Request, res: Response) => {
  try {
    if (req.session?.user) {
      res.redirect("/user");
      return;
    }
    // Code returned by Google's servers
    const code = req.query.code as string | undefined;
    const error = req.query.error;
    if (error || !code)
      throw new Error(JSON.stringify(error || "No code returned"));

    // Get tokens by exchanging code
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({
      version: "v1",
      auth: oAuth2Client,
    });

    // Get email of user
    const email = (
      await gmail.users.getProfile({
        userId: "me",
      })
    ).data.emailAddress;
    if (!email)
      throw new Error("Unable to get email from gmail.users.getProfile");

    // Generate session for user and redirect to /user
    req.session.regenerate(async (err) => {
      if (err) throw new Error("Error during session generation");
      req.session.user = {
        email,
        tokens,
      };
      res.redirect("/user");
    });
  } catch (err: any) {
    console.error(`authenticate: ${err.message}`);
    res.status(500).json("An error occurred during authentication");
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    if (req.session.user) {
      // Clear the reply process if it had been initiated
      if (req.session.user.intervalHandle) {
        clearInterval(req.session.user.intervalHandle);
      }
      // Destory user session and logout
      req.session.destroy((err: any) => {
        if (err) {
          console.error(
            err?.message || "There was an error while logging out."
          );
          res.status(500).json("Could not logout on server.");
        }
      });
    }
    res.status(200).send("<h2>Logged out successfully.</h2>");
  } catch (err: any) {
    console.error(err?.message || "There was an error while logging out.");
    res.status(500).json("Could not logout on server.");
  }
};
