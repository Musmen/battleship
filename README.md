# RSSchool NodeJS Task "Battleship"

> Main folder contains static http server (`./src/http_server`), frontend (`./front`) and backend (`./back`).
> By default WebSocket clients tries to connect to the `3000 port`.

## Installation

1. clone/download this repository (with all brunches)
2. change directory to folder `battleship`
3. switch to branch `develop`
4. run `npm install` (dependencies for `frontend`)
5. change directory to folder `./back`
6. run `npm install` (dependencies for `backend`)

## Usage

You need to start both backend server and frontend client.
Possible variants:

1. in main directory `battleship` change directory to folder `./back`
2. run `npm run start:back_dev` (development mode for `backend`) or `npm run start:back_prod` (production mode for `backend`)
3. open `new terminal window` and from the same directory `./back`
4. run `npm run start:front` (production mode for `frontend`, app served @ `http://localhost:8181` without nodemon)

or

1. in main directory `battleship` change directory to folder `./back`
2. run `npm run start:back_dev` (development mode for `backend`) or `npm run start:back_prod` (production mode for `backend`)
3. open `new terminal window` and from the main directory `battleship`
4. run `npm run start` (production mode for `frontend`, app served @ `http://localhost:8181` without nodemon)

Open in Browser `http://localhost:8181` and check application

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
