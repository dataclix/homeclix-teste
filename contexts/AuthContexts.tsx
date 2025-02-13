import Router from "next/router";
import { destroyCookie, setCookie } from "nookies";
import { createContext, ReactNode, useState } from "react";

import { toast } from 'react-toastify'
import axios from "axios";
import { accessTokenHomeclix, apiKey, lembrarHomeclix, refreshTokenHomeclix, url } from "@/global/variaveis";
import { api } from "@/services/apiClient";


type AuthContextData = {
    user: UserProps | undefined;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    signOut: () => void;
    signUp: (credentials: SignUpProps) => Promise<void>;
}

type UserProps = {
    id: string;
    nome: string;
    username: string;
}
type SignInProps = {
    email: string;
    senha: string;
    lembrar: boolean;
}

type SignUpProps = {
    name: string;
    email: string;
    password: string;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export async function signOut() {
    try {
        destroyCookie(null, 'lembra',{
            path:'/'
        })
        destroyCookie(null, 'lembra',{
            path:'/'
        })
        destroyCookie(null, 'lembra',{
            path:'/'
        })
        await Router.push('/')
    } catch {
        console.log('erro ao deslogar')
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>()
    const isAuthenticated = !!user;


    async function signIn({ email, senha, lembrar }: SignInProps) {
        await axios.post(url + 'auth/login', {
            email,
            senha: senha
        }, { headers: { 'api-key': apiKey } }).then((response) => {
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken
            if (lembrar === false) {
                setCookie(undefined, accessTokenHomeclix, accessToken, {
                    maxAge: 60 * 5,
                    path: "/"
                })

                setCookie(undefined, refreshTokenHomeclix, refreshToken, {
                    path: '/'
                })
                setCookie(undefined, lembrarHomeclix , 'false', {
                    path: '/'
                })

            } else if (lembrar === true) {
                setCookie(undefined, accessTokenHomeclix, accessToken, {
                    maxAge: 60 * 5,
                    path: "/"
                })

                setCookie(undefined, refreshTokenHomeclix, refreshToken, {
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                })
                setCookie(undefined, lembrarHomeclix , 'true', {
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                })
            }

            toast.success('Logado com sucesso!')
            Router.push('/painel-administrativo')
        }).catch((error) =>{
            toast.error("Dados incorreto!")
        })




       
    }

    async function signUp({ name, email, password }: SignUpProps) {
        try {
            const response = await api.post('/user/add', {
                name,
                email,
                password
            })

            toast.success("Conta criada com sucesso!")



            Router.push('/login')
        } catch (error) {
            toast.error("Erro ao criar conta!")
            console.log("error ao cadastrar", error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}
