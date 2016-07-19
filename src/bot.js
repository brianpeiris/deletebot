'use strict'

const slack = require('slack')
const _ = require('lodash')
const config = require('./config')

let bot = slack.rtm.client();

bot.started((payload) => {
  this.self = payload.self
})

bot.message((msg) => {
  if (msg.type !== 'message') { return; }
  if (!msg.user) { return; }

  var token = config('SLACK_TOKEN');
  slack.channels.info({token: token, channel: msg.channel}, function (err, data) {
    if (err) { console.error('Could not get channel info', msg.channel, err); return }

    if (config('CHANNELS').split(' ').indexOf(data.channel.name) === -1) { return; }
    slack.users.info({token: token, user: msg.user}, function (err, data) {
      if (err) { console.error('Could not get user info', msg.user, err); return; }

      if (config('ALLOWED_USERS').split(' ').indexOf(data.user.name) !== -1) { return; }
      console.info('Deleting message', JSON.stringify(msg));
      slack.chat.delete({token: token, ts: msg.ts, channel: msg.channel, as_user: true}, function (err, data) {
        if (err) { console.error('Could not delete message', err); }
      });
    });
  });
})

module.exports = bot
