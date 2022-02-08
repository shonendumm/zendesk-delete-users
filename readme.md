# Bulk delete end-users from zendesk

This is a tool to bullk delete end-users from zendesk.

Currently, to delete end-users in your zendesk organization account, you need to select page by page of users and delete them manually. This will take a long time if you have thousands of end-users.

## How to use this tool:

You need node js.

Clone or download this repo. Use your terminal, cd inside and run `npm install`.

Then generate your zendesk api token (for admins only) from zendesk and insert it into the .env file.

Fill in the required values in index.js file.

Finally, use `node autorun.js` to let the server run by itself and delete end-users repeatedly.

A sound will play every round it deletes users.

## How this tool works:

This runs a node server locally which will send requests to the zendesk API.

1. Node server sends a GET request to zendesk user API endpoint to get end-users data. 

This returns a set of 100 end-users.

2. On the node server, we filter the end-users based on their email addresses and roles. 

We just want to delete external users, i.e. those without a preset keyword (e.g. companyName) in their email. And we only want to delete "end-user" roles, not Admin roles.

We collect these users and get their user ids.

3. Node server sends a POST request to zendesk bulk delete API endpoint.

We send over those users ids to indicate that we want to delete those users.

4. Zendesk returns a Job id, as it will run the delete job on its server.

5. After a set timeout, our node server sends a GET request with the Job id to check on the job status.

We console log the results.

Then run the whole cycle again after a preset time.