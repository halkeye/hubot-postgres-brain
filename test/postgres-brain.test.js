process.env.HUBOT_LOG_LEVEL="alert"
process.env.EXPRESS_PORT = process.env.PORT = 0
process.env.DATABASE_URL = 'fake';

const path = require('path');
const Hubot = require('hubot');
const should = require('should');

const adapterPath = path.join(path.dirname(require.resolve('hubot')), "src", "adapters");
const {TextMessage} = require(path.join(adapterPath,'../message'));

brain_module = require('../src/postgres-brain')

describe('hubot-postgres-brain', function() {
  beforeEach(() => {
    this.robot = Hubot.loadBot(adapterPath, "shell", false, "MochaHubot")
    this.brain = brain_module(this.robot)
  });

  afterEach(() => {
    this.robot.brain.emit('close')
  });

  it('true', () => {
    should(true).eql(true);
  })
});
