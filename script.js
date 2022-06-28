const tan = "37.589569560,55.733780~37,56"
async function main() {
    const response = await fetch("https://taxi-routeinfo.taxi.yandex.net/taxi_info?" + new URLSearchParams({
        clid: "ak220520",
        apikey: "YeqApkGSrqOOhLWSBfFUmorClUgaGqrY",
        rll: "37.589569560,55.733780~37,56",
        class: "econom, business, comfortplus, minivan, vip",
    }).toString()).then(responce => responce.json()).then(data => console.log(data.currency))
    return response;
}

main();