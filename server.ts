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
  user: '',
  password: '',
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
  location: string,
  email: string
};

interface Statistics {
  location: string,
  total_users: number
};

const pgp = pgPromise(pgpDefaultConfig);
const db = pgp(options);

// Check if table github_users already exists. If not, create the table
db.one("SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = $1 AND tablename = $2)", ['public', 'github_users'], c => c.exists)
  .then((exists) => {

    if (!exists) {
      // Table github_users with new columns (location and email), primary key (id) and unique index (login) definition embedded at table creation
      return db.none('CREATE TABLE github_users (id BIGSERIAL, login TEXT not null CONSTRAINT ak_github_users_login UNIQUE, name TEXT, company TEXT, location TEXT, email TEXT, CONSTRAINT pk_github_users PRIMARY KEY(id))')
    }

  }).then(() => {

    return new Promise(function (resolve, _reject) {
      // Start the prompt
      promptmsg.start();

      function getGithubUser() {
        return [
          {
            name: 'githubuser',
            description: 'Which github user would you like to get information ?',
            message: 'This field is required.',
            type: 'string',
            require: true
          }
        ];
      };

      // Get the github user.
      promptmsg.get(getGithubUser(), function (_err, result) {
        resolve(result.githubuser);
      });
    });

  }).then((githubuser) => {

    let uriUser = R.concat('https://api.github.com/users/', githubuser);

    //Request to get github user.
    return request({
      uri: uriUser,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    });

  }).then((data: GithubUsers) => {

    //Insert user into githug_users table.
    return db.one(
      'INSERT INTO github_users (login, location, email) VALUES ($[login], $[location], $[email]) RETURNING id', data);

  }).then(() => {

    return new Promise(function (resolve) {
      // Start the prompt
      promptmsg.start();

      //Function to check if it is needed show users located in Lisbon.
      function getData() {
        return [
          {
            name: 'showLisbonUsers',
            description: 'Would You like to check how many users are in Lisbon ? (Y or N)',
            message: 'You must to input Y or N',
            type: 'string',
            require: true,
            conform: function (value) {

              return ((value.toLowerCase() == 'y') || (value.toLowerCase() == 'n'));
            },
            before: function (value) {

              if (value.toLowerCase() == 'y') {
                return true;
              }

              return false;
            }
          }
        ];
      };

      //Prompt that triggers the function getData() in order 
      //to check if it is needed show users located in Lisbon.
      promptmsg.get(getData(), function (_err, result) {
        resolve(result.showLisbonUsers);
      });
    });

  }).then((showLisbonUsers) => {

    // Select to return users located in Lisbon.
    if (showLisbonUsers) {
      return db.each("SELECT login FROM github_users where lower(location) like $1", ['lisbo%'], row => {
        row;
      });
    }

  }).then((data: GithubUsers[]) => {
  
    //Statistics about users located in Lisbon
    if (data != undefined && data.length > 0) {

      console.info('\n==========>Users located in Lisbon<==========\n')
      console.info('Logins:\n');
      data.forEach(function (element: GithubUsers) {

        console.info(element.login);

      })

      console.info('\n');
    }else{
      console.info('\nThere are no users from Lisbon.\n');
    }

  }).then(() => {

    //Return statistics about users location
    return db.each("select coalesce(location, $1) as location, count(1) as total_users from github_users group by location order by total_users desc", ['Undefined location'], row => {
      row;
    })

  }).then(data => {

    if (data != undefined && data.length>0) {
      console.info('\n==========>Users location statistic<==========\n')
      data.forEach(function (element: Statistics) {

        console.info('\n');
        console.info('Location:', element.location);
        console.info('Total Users:', element.total_users);
        console.info('\n');

      })

      console.info('\n');
    }else{

      console.info('\nThere is no data to provide statistics.\n');

    }

  }).catch((err) => {
    console.error('The following error has been raised:\n')
    console.error(err.message);

  }).finally(() => process.exit(0))
