import fetch, { Response } from 'node-fetch';
import crypto from 'crypto';
import { Buffer } from 'buffer';

export interface HttpInterface {
    get(url: string, params?: { [key: string]: string }): Promise<Response>;
    post(
        url: string,
        data?: { [key: string | number]: string | number | boolean | Record<string, any> },
    ): Promise<Response>;
    put(
        url: string,
        data?: { [key: string | number]: string | number | boolean | Record<string, any> },
    ): Promise<Response>;
    patch(url: string, data?: { [key: string]: string }): Promise<Response>;
    delete(url: string, params?: { [key: string]: string }): Promise<Response>;
    setBaseUrl(url: string): this;
    setBearerToken(token: string): this;
    setBasicAuth(username: string, password: string): this;
    setDigestAuth(username: string, password: string): this;
    withHeaders(headers: []): this;
}

export class Http implements HttpInterface {
    private baseUrl: string | null;
    private bearerToken: string | null;
    private basicUsername: string | null;
    private basicPassword: string | null;
    private digestUsername: string | null;
    private digestPassword: string | null;
    private digestNonce: string | null;
    private digestNc: number;
    private digestCnonce: string | null;
    private headers: object;

    constructor() {
        this.baseUrl = null;
        this.bearerToken = null;
        this.basicUsername = null;
        this.basicPassword = null;
        this.digestUsername = null;
        this.digestPassword = null;
        this.digestNonce = null;
        this.digestNc = 0;
        this.digestCnonce = null;
        this.headers = {};
    }

    setBaseUrl(url: string): this {
        this.baseUrl = url;
        return this;
    }

    setBearerToken(token: string): this {
        this.bearerToken = token;
        return this;
    }

    withHeaders(headers: {}): this {
        this.headers = headers;
        return this;
    }

    setBasicAuth(username: string, password: string): this {
        this.basicUsername = username;
        this.basicPassword = password;
        return this;
    }

    setDigestAuth(username: string, password: string): this {
        this.digestUsername = username;
        this.digestPassword = password;
        return this;
    }

    private buildQueryString(params: { [key: string]: string }): string {
        const queryString = Object.keys(params)
            .map((key) => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
        return queryString ? `?${queryString}` : '';
    }

    async get(url: string, params: { [key: string]: string } = {}): Promise<Response> {
        const queryString = this.buildQueryString(params);
        const fullUrl = `${this.baseUrl}${url}${queryString}`;
        return this.makeRequest(fullUrl, 'GET');
    }

    async post(url: string, data: { [key: string]: any } = {}): Promise<Response> {
        return this.makeRequest(`${this.baseUrl}${url}`, 'POST', data);
    }

    async put(url: string, data: { [key: string]: string } = {}): Promise<Response> {
        return this.makeRequest(`${this.baseUrl}${url}`, 'PUT', data);
    }

    async patch(url: string, data: { [key: string]: string } = {}): Promise<Response> {
        return this.makeRequest(`${this.baseUrl}${url}`, 'PATCH', data);
    }

    async delete(url: string, params: { [key: string]: string } = {}): Promise<Response> {
        const queryString = this.buildQueryString(params);
        const fullUrl = `${this.baseUrl}${url}${queryString}`;
        return this.makeRequest(fullUrl, 'DELETE');
    }

    private async makeRequest(url: string, method: string, data: { [key: string]: any } = {}): Promise<Response> {
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
            ...this.headers,
        };

        if (this.bearerToken) {
            headers.Authorization = `Bearer ${this.bearerToken}`;
        } else if (this.basicUsername && this.basicPassword) {
            const basicAuth = Buffer.from(`${this.basicUsername}:${this.basicPassword}`).toString('base64');
            headers.Authorization = `Basic ${basicAuth}`;
        } else if (this.digestUsername && this.digestPassword) {
            const authHeader = await this.generateDigestAuthHeader(url, method);
            headers.Authorization = authHeader;
        }

        const options: { method: string; headers: { [key: string]: string }; body?: string } = {
            method,
            headers,
        };

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            throw error;
        }
    }

    private async generateDigestAuthHeader(url: string, method: string): Promise<string> {
        const nonceCount = this.digestNc++;
        const cnonce = this.digestCnonce || crypto.randomBytes(4).toString('hex');
        this.digestCnonce = cnonce;

        const ha1 = crypto.createHash('md5');
        ha1.update(`${this.digestUsername}:${this.digestNonce}:${this.digestPassword}`);
        const ha1Digest = ha1.digest('hex');

        const ha2 = crypto.createHash('md5');
        ha2.update(`${method}:${url}`);
        const ha2Digest = ha2.digest('hex');

        const response = crypto.createHash('md5');
        response.update(
            `${ha1Digest}:${this.digestNonce}:${nonceCount.toString(16).padStart(8, '0')}:${cnonce}:${ha2Digest}`,
        );
        const responseDigest = response.digest('hex');

        return `Digest username="${this.digestUsername}", realm="", nonce="${this.digestNonce}", uri="${url}", response="${responseDigest}", algorithm="MD5", qop="auth", nc=${nonceCount.toString(16).padStart(8, '0')}, cnonce="${cnonce}"`;
    }
}

export default new Http();
