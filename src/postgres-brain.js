// Description:
//   Stores the brain in Postgres
//
// Configuration:
//   DATABASE_URL
//
// Commands:
//   None
//
// Notes:
//   Run the following SQL to setup the table and column for storage.
//
//   CREATE TABLE hubot (
//     id CHARACTER VARYING(1024) NOT NULL,
//     storage JSON,
//     CONSTRAINT hubot_pkey PRIMARY KEY (id)
//   )
//   INSERT INTO hubot VALUES(1, NULL)
//
// Original Source pg-brain.coffee (hubot-pg-brain)
// https://github.com/github/hubot-scripts/blob/master/src/scripts/pg-brain.coffee
// Original Author:
//   danthompson
// Modified for storage JSON instead of storage TEXT By:
//   Travis Juntara
// Upgraded pg version, and switched away from coffeescript
//   Gavin Mogan

const Postgres = require('pg');
const { parse: parseConnectionString } = require('pg-connection-string')

// sets up hooks to persist the brain into postgres.
module.exports = function(robot) {

  const database_url = process.env.DATABASE_URL;
  let save_interval = process.env.HUBOT_BRAIN_SAVE_INTERVAL || (15 * 60); //Default Every 15 Minutes

  if (!database_url) {
    throw new Error('postgres-brain requires a DATABASE_URL to be set.');
  }

  save_interval = parseInt(save_interval);
  if (isNaN(save_interval)) {
    throw new Error('HUBOT_BRAIN_SAVE_INTERVAL must be an integer');
  }

  const client = new Postgres.Client(parseConnectionString(database_url));
  robot.brain.on('close', () => client.end());
  robot.brain.on('save', function(data) {
    client.query("UPDATE hubot SET storage = $1", [data]).then(() => robot.logger.debug("postgres-brain saved."));
  });

  client.connect().then(function() {
    robot.logger.debug(`postgres-brain connected to ${database_url}.`);
    return client.query("SELECT storage FROM hubot LIMIT 1")
  }).then(function (res) {
    return res.rows[0];
  }).then(function (row) {
    if (row.storage) {
      robot.brain.mergeData(row.storage);
      robot.logger.debug("pg-brain loaded.");
      robot.brain.resetSaveInterval(save_interval);
      robot.logger.debug(`robot.brain saveInterval set to ${save_interval}.`);
    }
  }).catch(err => robot.logger.error(err));
};

