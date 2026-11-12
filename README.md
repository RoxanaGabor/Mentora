# Mentora

## Run on macOS

1. Install [Node.js](https://nodejs.org/) 20 or newer.
2. In Terminal, go to this project folder and install its dependencies:

   ```sh
   cd /path/to/Mentora
   npm install
   ```

3. Start the app:

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Press `Control-C` in Terminal to stop the server. If port 3000 is already in
use, start the app on another port with `PORT=3001 npm start` and open
`http://localhost:3001`.

The SQLite database is stored as `mentora.db` beside the application, regardless
of the directory from which the server is started.
