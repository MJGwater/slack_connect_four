# slack_connect_four
Slackbot that plays connect 4



# To run the game locally
1. Add a bot DIY integration on a Slack team of your choice.
2. Clone the repo
 <code>git@github.com:MJGwater/slack_connect_four.git</code>
 and enter the slack_connect_four directory   <code> cd slack_connect_four</code>
3. Install dependencies: <code>npm install</code>
4. Create a new file entitled <code>.env</code>
5. add to the .env file <code>SLACK_BOT_TOKEN='your bots token'</code>
6. Start the app via the command <code>npm start</code>
7. If you want the bot to broadcast game results to the general channel, go to the general channel on Slack and type <code> /invite @botname </code>
8. Go to the Slack team you installed the bot on and direct message the bot. Type play and the username of your choice to start a game with that user. Ex: <code>play @johndoe </code> 