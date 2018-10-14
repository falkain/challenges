## Typescript Interview Test

1. Install postgres & nodejs
2. Create the test database using the `./createdb.sh` script
3. Install the `npm_modules` for this project running `npm install`
4. Run `npm run test` to get the program running (modify the user and password if needed)
5. Examine the typescript code under `server.ts`

Challenge 1: Code analysis
=======================
Using the library ramda, what is the result of the following code?
R.reduce((acc,x) => R.compose(R.flip(R.prepend)(acc), R.sum,R.map(R.add(1)))([x,...acc]), [0])([13, 28]);
Explain each of the steps the best you can.

Challenge 2: BACKEND
===================

SETUP:
Clone this repo: https://github.com/Optylon/typescript_test
Install postgres & nodejs
Create the test database using the ./createdb.sh script
Install the npm modules for this project running npm install
Run npm run test to get the program running (modify the user and password if needed, accordingly with your database configuration)
Examine the typescript code under server.ts
CHALLENGE:
# select exists no catalogo: Improve the database calls to allow the program to be run any number of times (without complaining that the table already exists); 
SELECT EXISTS (SELECT 1 FROM   pg_tables WHERE  schemaname = 'public' AND    tablename = 'github_users');

Improve the program to take a command line argument with the name of the github user;

#Add table column: Add more fields;
#ALTER TABLE github_users ADD COLUMN phone VARCHAR, ADD COLUMN email VARCHAR;

#Add table primary key: Don't allow duplicate users on our database;
#ALTER TABLE github_users ADD PRIMARY KEY (id, login);

CREATE TABLE github_users (id BIGSERIAL, login TEXT, name TEXT, company TEXT, country VARCHAR(30), email VARCHAR(40), CONSTRAINT id_log PRIMARY KEY(id,login));

#Show table structure
\d+ github_users

Modify the program to, under a different command line option, list all users on the database registered on github as being in lisbon;
Show us stats for how many users per location.

Challenge 3: FRONTEND
====================

SETUP:
Clone this repo: https://github.com/Optylon/react_test
npm install
Start your application

CHALLENGE:
You will have a button. Fetch information about some user from the gitHub API when you click on it
When you have the response, the button must be "hidden", and the user information must be "visible"
Do another component to display the name and the description of all of the repos related to that user



