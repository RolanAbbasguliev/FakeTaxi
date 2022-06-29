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
                return 1;
            }

            // hadnle taxi PRice with min and max price
            let min = Number.MAX_SAFE_INTEGER;
            let max = Number.MIN_SAFE_INTEGER;
            let minIndex = 0;
            let maxIndex = 0;
            for (let i = 0; i< taxiOptions.length; i++) {
                let price =  taxiOptions[i].price_text
                price = price.replace("~", "");
                price = price.replace("руб.", "");
                price = Number(price)
        
                if (min > price) {
                    minIndex = i;
                    min = price;
                }

                if (max < price) {
                    max = price
                    maxIndex = i;
                }
            }


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
                button.setAttribute("id", "taxiSubmit")
                button.innerHTML = "Выбрать"

                button.onclick = () => {
                    let text = JSON.stringify({"КЛАСС": `${taxiName}`, "ЦЕНА": `${taxiPrice}`, "РЕЙТИНГ ВОДИТЕЛЯ": `${taxiRating}`, "ВРЕМЯ В ПУТИ": `${taxiTime}`});
                    alert(`\n🚕Вы вызвали такси!🥳\n💎КЛАСС: ${taxiName}\n💰ЦЕНА: ${taxiPrice}\n👳РЕЙТИНГ ВОДИЛЯ: ${taxiRating}\n🕐ВРЕМЯ В ПУТИ: ${taxiTime}`)
                    if (confirm("Хотите сохранить файл с информацией о поездке")) {
                        downloadAsFile(text);
                    } 
                };
  
                divInfoBlock.appendChild(divBlock);
                divBlock.appendChild(divName);
                divBlock.appendChild(divPrice);
                divBlock.appendChild(divRating);
                divBlock.appendChild(divTime);
                divBlock.appendChild(button);
                if (i == minIndex) {
                    var divMin = document.createElement("div")
                    divMin.className = "minPrice";
                    divMin.innerHTML = "МИНИМАЛЬНАЯ ЦЕНА";
                    divBlock.appendChild(divMin)
                } else if (i === maxIndex) {
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



/* TEST FUNCTIONS */
async function test_geocoder_yandexapi() {
    const addressArr = ["Vakil Bazar", "Гомбеде-Кавус", "Голестан Иран", "Yazd Art House", "Музей ковров в Тегеране",
    "Башня Азади", "Дворец Голестан", "Телебашня Бордже Милад", "Дворцовый комплекс «Саадабад»", "Мост Табийят", 
    "Музей современного искусства в Тегеране", "Национальная сокровищница в Тегеране", "Оперный театр им. Рудаки в Тегеране", "Парк Меллат в Тегеране", "Сад Негарестан в Тегеране",
    "Свято-Николаевский собор в Тегеране", "Танге-Саваши", "Зороастрийский храм Атешкаде в Язде", "Nasir al-Mulk Mosque", "Nasir al-Mulk Mosque",
    "Imam Reza Holy Shrine", "Sultan Amir Ahmad Bathhouse", "Дербенд", "Tabatabei House", "Дворцовый комплекс Ниаваран",
    "Bazaar of Kashan", "Borujerdi House", "Kariz-e-Kish", "Персеполь", "Vakil Bazaar",
    "Jameh Mosque of Yazd", "Caravanserai of Sa'd al-Saltaneh", "Underground City of Nushabad", "Мост Си-о-Се Поль", "Мост Хаджу",
    "Jamshidieh Stone Garden", "Tomb of Cyrus", "Vakil Mosque", "Пасаргады", "Karun River"
]; 
    for (var i = 0; i < addressArr.length - 1; i++) {
        console.log(`TEST ${i + 1}`);
        console.log("TEST GEOCODER FUNCTION")
        console.log(`START ADDRESS: ${addressArr[i]}\nEND ADDRESS: ${addressArr[i + 1]}`)
        const coords = await geocoder(addressArr[i], addressArr[i + 1]);
        console.log(`${addressArr[i]} [lat: ${coords[0].lat} lng: ${coords[0].lng}]`);
        console.log(`${addressArr[i + 1]} [lat: ${coords[0].lat} lng: ${coords[0].lng}]`)


        console.log("TEST YANDEX API FUNCTION")
        const yandexApi = await yandexApiReq(coords[0].lat, coords[0].lng, coords[1].lat, coords[1].lng);
        console.log(yandexApi);
    
    }
}




function downloadAsFile(data) {
  let a = document.createElement("a");
  let file = new Blob([data], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = "example.txt";
  a.click();
}
 
// test_geocoder_yandexapi();