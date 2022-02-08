// use ES6 modules import by tweaking package.json
// add this line:     "type": "module",


import fetch from 'node-fetch';
import * as fs from 'fs';
import sound from 'sound-play';


export async function main() {

    // Enter your admin email and your zendesk subdomain
    const EMAIL = "soohian@example.com"
    const SUB_DOMAIN = "example"

    // add your zendesk api token to a .env file 
    // ZENDESK_TOKEN=
    const AUTH = EMAIL + "/token:" + process.env.ZENDESK_TOKEN;
    const ENCODED_AUTH = b64EncodeUnicode(AUTH);


    function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    }


    const GET_ENDUSERS_URL = "https://" + SUB_DOMAIN + ".zendesk.com/api/v2/users.json?role=end-user"

    async function getUsers() {
        const response = await fetch(GET_ENDUSERS_URL, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + ENCODED_AUTH,
                'Accept': 'application/json'
            },
        });
        const data = await response.json();

        return data.users;
    }

    // array of UsersToDelete = users to delete
    let UsersToDelete = [];
    let keepUsers = [];


    const FilterUsers = await getUsers()
        .then((users) => {
            users.forEach((user) => {
                if (user.email.includes(SUB_DOMAIN) || user.role !== 'end-user') {
                    keepUsers.push(user);
                } else {
                    UsersToDelete.push(user);
                }
            })
        })


    function writeUserToFile(_users, filename) {
        let file = fs.createWriteStream(filename)
        file.on('error', (err) => { console.log(err) });
        _users.forEach((each) => {
            file.write(JSON.stringify(each) + ' \n');
        });
        file.end();
    }

    writeUserToFile(UsersToDelete, 'UsersToDelete.json');
    writeUserToFile(keepUsers, 'keepUsers.json');


    function GetDeleteUserIds(usersArray) {
        let idsToDeleteArray = [];
        usersArray.forEach((each) => {
            idsToDeleteArray.push(each.id);
        })
        console.log("Number of ids to delete: ", idsToDeleteArray.length);
        return idsToDeleteArray;
    }

    const idsToDelete = GetDeleteUserIds(UsersToDelete);
    // Turn the ids array to a string and remove spaces in the string
    const stringOfIds = idsToDelete.toString().replace(/\s/g, '');
    const DELETE_USERS_URL = "https://" + SUB_DOMAIN + ".zendesk.com/api/v2/users/destroy_many?ids=" + `${stringOfIds}`

    // define the function to delete ValidUsers base on their ids
    async function BulkDeleteUsers() {
        const response = await fetch(DELETE_USERS_URL, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Basic ' + ENCODED_AUTH,
                'Accept': 'application/json'
            },
        });
        const jobStatus = await response.json();
        return jobStatus;
    }



    async function checkJobStatus(job_id) {
        const JOB_STATUS_URL = "https://" + SUB_DOMAIN + ".zendesk.com/api/v2/users/job_statuses/" + `${job_id}`
        const response = await fetch(JOB_STATUS_URL, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + ENCODED_AUTH,
                'Accept': 'application/json'
            },
        });
        const data = await response.json();
        return data;
    }


    const FinalJobStatus = await BulkDeleteUsers().then(
        (jobStatus) => {
            console.log("Job Status object:", jobStatus);

            // set time out to check the job status
            setTimeout(async() => {
                const status = await checkJobStatus(jobStatus.job_status.id)
                console.log("Final deletion status:", status);
                const userCount = await checkRemainingUsers()
                console.log("Number of remaining end-users:", userCount);
                // play Super Mario 1-up sound when done
                sound.play("smb_1-up.wav");
                // stops the deletion process here when number of end-users <= 150
                if (userCount <= 150) {
                    console.log("Stopping the bulk delete users program now")
                    process.exit();
                }
                // wait 4 minutes before checking job status and remaining end-users
            }, 240000);
        }
    )



    const COUNT_USERS_URL = "https://" + SUB_DOMAIN + ".zendesk.com/api/v2/users/count?role=end-user"


    async function checkRemainingUsers() {
        const response = await fetch(COUNT_USERS_URL, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + ENCODED_AUTH,
                'Accept': 'application/json'
            },
        });
        const data = await response.json();

        return data.count.value;
    }


}