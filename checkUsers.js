// using ES6 modules import by tweaking package.json
import fetch from 'node-fetch';

// Enter your admin email and your zendesk subdomain
const EMAIL = "soohian@example.com"
const SUB_DOMAIN = "example"

// add your zendesk api token to a .env file 
// ZENDESK_TOKEN=
const AUTH = EMAIL + "/token:" + process.env.ZENDESK_TOKEN;
const ENCODED_AUTH = b64EncodeUnicode(AUTH);
const COUNT_USERS_URL = "https://" + SUB_DOMAIN + ".zendesk.com/api/v2/users/count?role=end-user"


function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}


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

const userCount = await checkRemainingUsers()
console.log("Number of remaining end-users:", userCount);