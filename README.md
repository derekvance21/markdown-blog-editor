# Markdown Blog Editor

**angular-blog** contains the front-end Angular code, while **blog-server** contains the backend code. The backend uses `Express` and `MongoDB`, with `bcrypt` and JSON web tokens for user authentication and session management.

## How to use

The backend can be started using `npm start` while at the **blog-server/** path. The front-end can be started using `ng serve --host 0.0.0.0--poll=2000` while at the **angular-blog/** path. To populate the MongoDB database, run `./db.sh` from the **blog-server/** path.

### Deploying to the Express server

While at the **angular-blog/** path, run `ng build --base-href=/editor/ --deploy-url=/editor/ --prod=true`. Copy the files it creates inside the `dist/angular-blog` directory to the **blog-server/public/editor/** directory with `cp -r dist/angular-blog/* ../blog-server/public/editor`. Then, start the Express server by going to the **blog-server/** path and running `npm start`. Check to see the login page is working at `http://localhost:3000/login` and authenticate yourself, then visit the Angular blog application at `http://localhost:3000/editor`.

