import { resolve } from "path";
import { reject } from "bluebird";

const pgPromise = require('pg-promise');
const R = require('ramda');
const request = require('request-promise');
const promptmsg = require('prompt');

// Limit the amount of debugging of SQL expressions
const trimLogsSize: number = 200;

// Database interface
interface DBOptions {
  host: string
  , database: string
  , user: string
  , password: string
  , port: number
};

// Actual database options
const options: DBOptions = {
  user: 'falkain',
  password: 'lisbonlove',
  host: 'localhost',
  port: 5432,
  database: 'lovelystay_test',
};

console.info('Connecting to the database:',
  `${options.user}@${options.host}:${options.port}/${options.database}`);

const pgpDefaultConfig = {
  promiseLib: require('bluebird'),
  // Log all querys
  query(query) {
    console.log('[SQL   ]', R.take(trimLogsSize, query.query));
  },
  // On error, please show me the SQL
  error(err, e) {
    if (e.query) {
      console.error('[SQL   ]', R.take(trimLogsSize, e.query), err);
    }
  }
};

interface GithubUsers {
  id: number,
  login: string,

};

const pgp = pgPromise(pgpDefaultConfig);
const db = pgp(options);

// Check if table github_users already exists. If not, create the table
db.one("SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = $1 AND tablename = $2)", ['public', 'github_users'], c => c.exists)
  .then((exists) => {
    console.log('DATA', exists)
    console.log('oi')
    if (!exists) {
      console.log('entrei');
      // Table github_users with new columns and primary key defined
      db.none('CREATE TABLE github_users (id BIGSERIAL, login TEXT, name TEXT, company TEXT, country TEXT, email TEXT, CONSTRAINT id_log PRIMARY KEY(id,login))')
    }
  }).then(() => {

    return new Promise(function (resolve, _reject) {
      // Start the prompt
      promptmsg.start();
      //
      // Get the github user.
      //
      promptmsg.get(['githubuser'], function (_err, result) {
        resolve(result.githubuser);
      });
    });

  }).then((githubuser) => {
    let uriUser = 'https://api.github.com/users/' + githubuser;
    console.log(uriUser);

    return request({
      uri: uriUser,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    })
  }).then((data: GithubUsers) => 
    db.one(
      'INSERT INTO github_users (login) VALUES ($[login]) RETURNING id', data)
    ).then(({ id }) => console.log(id)).then(() => {

    return new Promise(function (resolve) {
      // Start the prompt
      promptmsg.start();
      function getData() {
        return [
          {
            name: 'showLisbonUsers',
            description: 'Would You like to check how many users are in Lisbon ? (Y or N)',
            message: 'You must to input Y or N',
            type: 'string',
            require: true,
            conform: function(value) {
           
              return ((value.toLowerCase()=='y') || (value.toLowerCase()=='n'));
            }

          }
        ];
      };


      //
      // Get the github user.
      //
      promptmsg.get(getData(), function (_err, result) {
        resolve(result.showLisbonUsers);
      });
    });

  }).then((showLisbonUsers) => {
  console.log(showLisbonUsers);

   // return db.many('SELECT id, login FROM github_users', null);

 return db.each('SELECT id, login FROM github_users', [], row => {
    row ;
});

  }).then((data: GithubUsers[]) => 
  
  data.forEach(function(element:GithubUsers) {

    console.log('Id:', element.id);
    console.log('Login:', element.login);

  })
 
  
  ).then(() => process.exit(0));

    //  .then((githubuser) => {
      //db.one('INSERT INTO github_users (login) VALUES ($[login]) RETURNING id', githubuser);
      //}).then(({id}) => console.log(id));

//db.none('CREATE TABLE github_users (id BIGSERIAL, login TEXT, name TEXT, company TEXT, country VARCHAR(30), email VARCHAR(40), CONSTRAINT id_log PRIMARY KEY(id,login))')
//.then(() => request({
//  uri: 'https://api.github.com/users/gaearon',
//  headers: {
//        'User-Agent': 'Request-Promise'
//    },
//  json: true
//}))
//.then((data: GithubUsers) => db.one(
//  'INSERT INTO github_users (login) VALUES ($[login]) RETURNING id', data)
//).then(({id}) => console.log(id))
//.then(() => process.exit(0));
