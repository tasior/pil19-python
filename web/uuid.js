
function uuid() {
    return URL.createObjectURL(new Blob()).slice(-36);
}

let uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);