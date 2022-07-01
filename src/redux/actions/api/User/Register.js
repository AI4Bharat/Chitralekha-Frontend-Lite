/**
 * Login API
 */
import API from '../../../api';
import ENDPOINTS from '../../../../config/apiendpoint';

export default class RegisterAPI extends API {
    constructor(username, email, first_name, last_name, password, password2, timeout = 2000) {
        super('POST', timeout, false);
        this.username = username;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.password = password;
        this.password2 = password2;
        this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.users}register/`;
    }

    processResponse(res) {
        super.processResponse(res);
        if (res) {
            this.report = res;
        }
    }

    apiEndPoint() {
        return this.endpoint;
    }

    getBody() {
        return {
            username: this.username,
            email: this.email,
            first_name: this.first_name,
            last_name: this.last_name,
            password: this.password,
            password2: this.password2,
        };
    }

    getHeaders() {
        this.headers = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        return this.headers;
    }

    getPayload() {
        return this.report;
    }
}
