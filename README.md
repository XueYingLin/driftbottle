# Driftbottle

This is an anonymous message posting app called driftbottle. You can find it
deployed at https://driftbottle.app

## Development

### Setting up MongoDB

Before starting, you need to install `mongodb`. On MacOS, this is just:

```
brew install mongodb-community
```

### Local Development

In one terminal, start the backend:

```
cd backend
npm install
npx nodemon .
```

Now switch to another terminal, and start the frontend dev server:

```
cd frontend
npm start
```

### Production Development

This is deployed to heroku automatically whenever a commit is pushed to github at
https://github.com/XueYingLin/driftbottle

