
export interface UsuarioGlobal{
    id: string;
    nome: string;
    perfil? : Perfil;
    foto?: string;
    role: string;
}
export interface Perfil{
    id: number;
    nome: string;
    permissoesPerfis: ModuloGlobal[];
}
export interface ModuloGlobal{
    idModulo: number;
    nome: string;
    permissoes: Permissao[]
}
export interface Permissao{
    id: number;
    nome: string;
}