function postForm(url, data, options) {
    let formData = new FormData();
    for (let key in data) {
        formData.append(key, data[key]);
    }
    return post(url, formData, options);
}

function postJson(url, data, options) {
    options.headers = options.headers || {};
    options.headers["Content-Type"] = "application/json";

    return post(url, JSON.stringify(data), options);
}

function post(url, data, options){

    return send("POST", url, data, options);
}

function get(url, data, options){
    let param = "";

    for (let key in data) {
        param += `${key}=${data[key]}&`;
    }

    url = `${url}?${param}`;

    return send("GET", url, {}, options);
}

function send( method, url, data, options) {


    options = options || {};

    data = data || {};

    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();

        request.open(method, url);

        if (options.headers) {
            for (let key in options.headers) {
                request.setRequestHeader(key, options.headers[key]);
            }
        }

        request.withCredentials = options.withCredentials || false;

        if(options.config) {
            options.config(request)
        }

        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 500){
                    reject({status: request.status})
                } else {
                    resolve(request.response);
                }
            }
        };

        request.send(data);
    });
}