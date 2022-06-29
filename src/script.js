// const tan = "37.589569560,55.733780~37,56"
async function yandexApiReq(start_lat, start_lng, end_lat, end_lng) {
 
    try {
        const response = await fetch("https://taxi-routeinfo.taxi.yandex.net/taxi_info?" + new URLSearchParams({
            clid: "ak220520",
            apikey: "YeqApkGSrqOOhLWSBfFUmorClUgaGqrY",
            rll: `${start_lat},${start_lng}~${end_lat},${end_lng}`,
            class: "econom, business, comfortplus, minivan, vip",
        }).toString()).then(response => response.json())
        return response

    }catch (e) {
        console.log(e);
    }   
}
 
 
async function geocoder(startPoint, endPoint) {
    const coordArr = [];
    const url = "https://maps.googleapis.com/maps/api/geocode/json?";
    try { 
        const resF = await fetch(url + new URLSearchParams({
            key: "AIzaSyBd_qxtxMeqHSj-OIrR3C5TV-UgS3eLtr8", 
            address: `${startPoint}`,
        })).then(response => response.json()).then(data => {
            if (data.results.length === 0) { 
                document.getElementById("startPoint").value = ""
                alert("Вы ввели не существующий адрес");
            }
            else {
                coordArr.push(data.results[0].geometry.location);
            }
      
        })

        const resS = await fetch(url + new URLSearchParams({
            key: "AIzaSyBd_qxtxMeqHSj-OIrR3C5TV-UgS3eLtr8", 
            address: `${endPoint}`,
        })).then(response => response.json()).then(data => {
            if (data.results.length === 0) { 
                alert("Вы ввели не существующий адрес");
                document.getElementById("endPoint").value = ""
            }
            else {
                coordArr.push(data.results[0].geometry.location);
            }

        })
    } catch(e) {
        console.log(e);
    }
    return coordArr;
}

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}
 


async function sendRequest(startPoint, endPoint) {


 
    //delete InfoContainer if exist (for search button hadler)

    const divWithClassExists = document.querySelectorAll(
        'div.infoContainer'
       ).length > 0;

    if (divWithClassExists) {
        var elem = document.getElementById("infoContainer");
        elem.remove();
    } 

    const divInfoBlock = document.createElement("div")
    divInfoBlock.className = "infoContainer";
    divInfoBlock.setAttribute("id", "infoContainer")
    document.getElementById("info").appendChild(divInfoBlock)
    

    startPoint = document.getElementById("startPoint").value
    endPoint  = document.getElementById("endPoint").value

    if (isEmptyOrSpaces(startPoint) || isEmptyOrSpaces(endPoint)) {
        return -1;
    }

    const coords = await geocoder(startPoint, endPoint);
 
    if (coords.length !== 0) {
        try {
          
            const yandexApi = await yandexApiReq(coords[0].lat, coords[0].lng, coords[1].lat, coords[1].lng);
            const taxiTime = yandexApi.time_text
            const taxiOptions = yandexApi.options
            if (taxiOptions.length === 0) {
                var div = document.createElement("div")
                div.className = "infoBlock"
                div.style.width = "300px";
                div.style.height = "300px";
                div.style.background ="rgba(255, 255, 255, 0.363)";
                div.style.borderRadius = "10px"
                div.innerHTML = "На данный момент нет подходящих такси"
                document.getElementById("info").appendChild(div);
            }

            

            // fill Html
            for (let i = 0; i < taxiOptions.length; i++) {
                const taxiName = taxiOptions[i].class_text
                const taxiRating = taxiOptions[i].class_level
                const taxiPrice = taxiOptions[i].price_text.replace("~", "")

          

                var divBlock = document.createElement("div");
                divBlock.className = "infoBlock"
                divBlock.style.width = "300px";
                divBlock.style.height = "300px";
                divBlock.style.background ="rgba(255, 255, 255, 0.363)";
                divBlock.style.borderRadius = "10px"
                divBlock.setAttribute("id", "infoBlock")

              


                var divName = document.createElement("div");
                divName.className = "taxiName"
                divName.innerHTML = `КЛАСС: ${taxiName}`

                
                var divPrice = document.createElement("div");
                divPrice.className = "taxiPrice"
                divPrice.innerHTML = `ЦЕНА: ${taxiPrice}`

                var divRating = document.createElement("div");
                divRating.className = "taxiRating"
                divRating.innerHTML = `РЕЙТИНГ: ${taxiRating}`

                var divTime = document.createElement("div");
                divTime.className = "taxiTime";
                divTime.innerHTML = `ВРЕМЯ В ПУТИ: ${taxiTime}`



                var button = document.createElement("button")
                button.className = "taxiSubmit"
                button.innerHTML = "Выбрать"

             
                divInfoBlock.appendChild(divBlock);
                divBlock.appendChild(divName);
                divBlock.appendChild(divPrice);
                divBlock.appendChild(divRating);
                divBlock.appendChild(divTime);
                divBlock.appendChild(button);
                if (i == 0) {
                    var divMin = document.createElement("div")
                    divMin.className = "minPrice";
                    divMin.innerHTML = "МИНИМАЛЬНАЯ ЦЕНА";
                    divBlock.appendChild(divMin)
                } else if (i === taxiOptions.length - 1) {
                    var divMax = document.createElement("div")
                    divMax.className = "maxPrice";
                    divMax.innerHTML = "МАКСИМАЛЬНАЯ ЦЕНА";
                    divBlock.appendChild(divMax)
                }
            }
           
        } catch (e) {
            console.log(e);
        }
    }
}

