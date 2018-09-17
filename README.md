# archer-hrc-metadata

A desktop tool for Mac, Windows, and Linux made with Electron for viewing and exporting photo and video metadata online.

To run the app as an executable:
1. Navigate to the "Packaged App" folder in this github.
2. Download and open the app using your current Operating System
Note: There are multiple ways to open the app in the "Packaged App" folder for certain OS's, you only need to use one.

To run the app as a developer:
1. Download node.js if you haven't yet. Run 'npm -v' to see if your npm version is up to date.
2. Run 'npm install' to install dependencies.
3. Run 'npm rebuild'.
4. Run 'npm start' to start up the app.

Note that our Google Maps API key is hidden in this repo. As of now, the maps still usually (up to a certain number of loads) work without it, you will just get a missing key warning.

To build the app using electron-builder:
1. Make sure the app works by running "npm install" and then running "npm start".
2. Run "npm run dist" to start electron-builder.
3. Find the correct version of the app for your OS in the /dist folder.
