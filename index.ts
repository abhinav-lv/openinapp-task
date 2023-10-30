import session from "express-session";
import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import express, { Request, Response } from "express";
import { getLoginURL, redisStore } from "./lib/utils";

// To address type error in the express-session library
declare module "express-session" {
  interface SessionData {
    user: { [key: string]: any };
  }
}

/* Initiate Express app */
const app = express();

/* Session Middleware */
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hourse
  })
);

/* Root Route */
app.get("/", (req: Request, res: Response) => {
  if (req.session?.user) {
    res.redirect("/user");
    return;
  }
  const loginURL = getLoginURL();
  res.status(200).send(`<a href=${loginURL}>Login with Google</a>`);
});

/* Auth Routes */
app.use("/auth", authRoutes);

/* User Routes */
app.use("/user", userRoutes);

/* Fallback */
app.get("*", (_: Request, res: Response) => {
  res.status(404).json("Requested Resource Not Found");
});

/* PORT */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
