import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { AuthTokenError } from "./errors/AuthTokenError";
import { accessTokenHomeclix, apiKey, lembrarHomeclix, refreshTokenHomeclix } from "@/global/variaveis";


export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx);
    const api = axios.create({
        baseURL: 'https://homeclixteste.dataclix.com.br:3312/',
        headers: {
            Authorization: `Bearer ${cookies.F3aN8XDCvMstYf}`,
            'api-key': apiKey
        }
    })
    api.interceptors.request.use(
        async function (config) {
            const cookies = parseCookies();
            if (cookies.PLSYNsSrVpa2uh) {
                if (cookies.F3aN8XDCvMstYf) {
                    config.headers['Authorization'] = 'Bearer ' + cookies.F3aN8XDCvMstYf
                    config.headers['api-key'] = apiKey
                } else {
                    const response = await axios.post('https://homeclixteste.dataclix.com.br:3312/auth/refresh', undefined, {
                        headers: {
                            Authorization: `Bearer ${cookies.PLSYNsSrVpa2uh}`,
                            'api-key': apiKey
                        }
                    })
                    config.headers['Authorization'] = 'Bearer ' + response.data.accessToken
                    if (cookies.feBa7Hz86DD9YK === 'false') {
                        setCookie(undefined, accessTokenHomeclix, response.data.accessToken, {
                            maxAge: 60 * 5,
                            path: "/"
                        })

                        setCookie(undefined, refreshTokenHomeclix, response.data.refreshToken, {
                            path: '/'
                        })
                        setCookie(undefined, lembrarHomeclix, 'false', {
                            path: '/'
                        })

                    } else if (cookies.feBa7Hz86DD9YK === 'true') {
                        setCookie(undefined, accessTokenHomeclix, response.data.accessToken, {
                            maxAge: 60 * 5,
                            path: "/"
                        })

                        setCookie(undefined, refreshTokenHomeclix, response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 7,
                            path: '/'
                        })
                        setCookie(undefined, lembrarHomeclix, 'true', {
                            maxAge: 60 * 60 * 24 * 7,
                            path: '/'
                        })
                    }
                }
            }
            return config
        },
        function (error) {
            // Faça algo com erros de solicitação
            return Promise.reject(error);
        }
    )
    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError) => {
        if (error.response?.status === 401) {
            // qualquer error 401 (nao autorizado) devemos deslogar o usuario
            if (typeof window !== "undefined") {
                console.log("ola")
            } else {
                return Promise.reject(new AuthTokenError())
            }
        }

        return Promise.reject(error);
    })

    return api;
}

function signOut() {
    throw new Error("Function not implemented.");
}
