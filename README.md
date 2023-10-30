# openinapp-task

## To install dependencies:

```bash
npm install
```

## To run:

```bash
npm start
```

## Note
- ### This app needs a ```redis``` server that runs in its default port ```6379``` to manage user sessions.

## Libraries
- ### express
- ### express-session
- ### @redis/client
- ### connect-redis
- ### dotenv
- ### googleapis

## Implementation
- ### The app runs at ```localhost:5000```.
- ### At the root route, user is given a link to login with google.
- ### On successful login, user is redirected to ```/user``` endpoint, here the user can choose to logout or to initate the reply process.
- ### On clicking the link to send replies, user is redirected to ```/user/initate```, and the process starts.
- ### User can choose to end the process by logging out, here they are redirected to ```/auth/logout```, and the process ends.

---