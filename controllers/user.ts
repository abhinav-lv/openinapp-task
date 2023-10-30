import { Request, Response } from "express";
import findThreadsAndReply from "../lib/findThreadsAndReply";
import createLabelIfNotExists from "../lib/createLabelIfNotExists";
import { oAuth2Client, getRandom, timeouts } from "../lib/utils";

export const userActions = (req: Request, res: Response) => {
  try {
    // Check if user is logged in
    if (req.session?.user) {
      res.send(`
        <div>
          <h2>User: ${req.session.user.email}</h2>
          <a href=/user/initiate>Send replies</a>
          </br>
          <a href=/auth/logout>Logout</a>
        </div>`);
      // Redirect to home if no session object is found (not logged in)
    } else res.redirect("/");
  } catch (err: any) {
    console.error(`userActions: ${err.message}`);
    res.status(500).json("An error occurred when fetching user actions");
  }
};

export const initiateReplies = async (req: Request, res: Response) => {
  try {
    // Check if user is logged in
    if (req.session?.user) {
      // Set credentials to oAuth2Client
      oAuth2Client.setCredentials(req.session.user.tokens);

      // Create label in user's gmail if it does not exist
      createLabelIfNotExists("openinapp");

      // Start process that calls the findThreadsAndReply function in
      // random intervals of 45 to 120 seconds
      if (req.session.user.intervalHandle) {
        clearInterval(req.session.user.intervalHandle);
      }
      findThreadsAndReply({
        email: req.session.user.email as string,
        tokens: req.session.user.tokens,
      });
      const intervalHandle = setInterval(
        findThreadsAndReply,
        getRandom(45 * 1000, 120 * 1000),
        {
          email: req.session.user.email as string,
          tokens: req.session.user.tokens,
        }
      );

      timeouts[req.session.user.email] = intervalHandle;

      // Send response back
      res.status(200).send(`
        <div>
          <h2 style="color:green;">Reply process initiated!</h2>
          <h2>Process will repeat in random intervals of 45 to 120 seconds.</h2>
          <p>Logout to terminate the process</p>
          <a href='/auth/logout'>Logout</a>
        </div>`);
    } else {
      // Redirect to home if no session object is found (not logged in)
      res.redirect("/");
    }
  } catch (err: any) {
    console.error(`userActions: ${err.message}`);
    res.status(500).json(`An error occurred when fetching user actions`);
  }
};
