export default class Http {     
    static Get(url: string, cb?: (err: number, response?) => void) {
        console.log("GET -> " + url);
        let xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        xhr.open("GET", url, true);        
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    if (cb) cb(0, xhr.response);                                    
                }
                else if (xhr.status >= 400 && xhr.status < 500) {                    
                    if (cb) cb(xhr.status);
                }
                else if (xhr.status >= 500 && xhr.status < 600) {                    
                    if (cb) cb(xhr.status);
                }
            }
        };
        xhr.onerror = () => {                                                    
            if (cb) cb(1, 'xhr.onerror');
        };
        xhr.ontimeout = () => {
            if (cb) cb(2, 'xhr.ontimeout');            
        };
        xhr.send();
    }

    static Post(url: string, body?: Document | XMLHttpRequestBodyInit | null, cb?: (err: number, response?: string) => void) {
        console.log("POST -> " + url + " body -> " + body);
        let timeout = 5000;
        let xhr = new XMLHttpRequest();
        xhr.timeout = timeout;
        xhr.open("POST", url, true);        
        xhr.setRequestHeader("Content-Type", "application/json");        
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {                               
                    if (cb) cb(0, xhr.responseText);                    
                }
                else if (xhr.status >= 400 && xhr.status < 500) {                    
                    if (cb) cb(xhr.status);
                }
                else if (xhr.status >= 500 && xhr.status < 600) {                    
                    if (cb) cb(xhr.status);
                }
            }
        };
        xhr.onerror = () => {            
            cb(1, 'xhr.onerror');
        };
        xhr.ontimeout = () => {            
            cb(2, 'xhr.ontimeout');
        };
        xhr.send(body);
    }
}


