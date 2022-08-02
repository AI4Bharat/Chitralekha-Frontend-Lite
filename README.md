# Chitralekha Frontend
Frontend repository for Chitralekha - an open source platform tool for video subtitling across various Indic languages, using ML model support.

You can watch a demo of our tool - [Video](https://www.youtube.com/watch?v=Jq3CcEb9pxQ)

## Pre-requisites
The project was created using [React 17.0.2](https://reactjs.org/docs/getting-started.html). All major dependencies are listed below:
- redux
- react-redux
- axios
- styled-components
- react-bootstrap

## Setting up the server locally
1.  Clone the repository - git clone --recursive https://github.com/AI4Bharat/Chitralekha-Frontend.git
2.  Install dependencies - ``` npm install ```
3.  Create a `.env` file in the root of your directory by copying the `.env.example` and set the backend API variables
3.  Run the app in the development mode - ``` npm run start ```
4.  Open http://localhost:3000 to view it in your browser

## Description

-   Select the language from the drop down menu, which has only Indian Languages
-   Enter the YouTube URL, to fetch the video which will be imported into the player
-   The API described will then fetch the video and subtitle link which will be displayed on the player
-   Using the React Transliterate library, select a language, and start typing for your words to be converted into that particular language

#### For more information please check [Chitralekha-App](https://github.com/AI4Bharat/Chitralekha-App)

### Show your support

Give a ⭐️ if this project helped you!

---
