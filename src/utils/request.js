import axios from "axios";

let request = axios.create({
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

export default request