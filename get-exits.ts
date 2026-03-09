import fetch from "node-fetch";

async function main() {
    const res = await fetch("https://d17gqyseyowaqt.cloudfront.net/exit-interviews");
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}

main();
