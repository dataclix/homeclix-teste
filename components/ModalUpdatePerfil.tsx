import { atualizarAtom, idPerfilAtom, openUpdatePerfilAtom } from "@/pages/painel-administrativo/configuracoes/usuarios/perfil";
import { api } from "@/services/apiClient";
import { Form, Input, Modal, Checkbox } from "antd";
import { useAtom } from "jotai";

import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import LoadingScreen from "./LoadingScreen";
import { ModuloGlobal } from "@/global/usuario";
const CheckboxGroup = Checkbox.Group;

type Modulos = Modulo[];

interface Modulo {
    id: number;
    nome: string;
    descricao: string;
    status: string;
    permissoes: Permissao[]
}
interface Permissao {
    id: number;
    status: string;
    nome: string;
    descricao: string;
    id_modulo: number;
}
type PermissoesFinais = PermissaoFinal[]
interface PermissaoFinal {
    id: number;
    checkAll: boolean;
    indeterminate: boolean;
    permissoes: number[];
}

interface Dados {
    id: number;
    nome: string;
    permissoesPerfis: DadosModulo[];
}
interface DadosModulo {
    idPermissao: number
    permissao: DaodsPermissao
}
interface DaodsPermissao {
    idModulo: number
    nome: string
}

interface TratamentoDado {
    idModulo: number
    permissoes: number[]
}
interface Props {
    perfil: ModuloGlobal[]
}
export default function ModalUpdatePerfil({ perfil }: Props) {
    const [form] = Form.useForm();
    const [modulos, setModulos] = useState<Modulos>()
    const [open, setOpen] = useAtom(openUpdatePerfilAtom)
    const [checkedList, setCheckedList] = useState<PermissaoFinal[]>()
    const [permissoesFinais, setPermissoesFinais] = useState<PermissoesFinais>([])
    const [atualizar, setAtualizar] = useAtom(atualizarAtom)
    const [idPerfil, setIdPerfil] = useAtom(idPerfilAtom)
    const [nome, setNome] = useState<string>()

    const [loading, setLoading] = useState<boolean>(false)
    const perfilControle = perfil.length === 0 ? false : perfil[0].permissoes.filter((valor) => {
        if(valor.nome === 'Atualizar Perfil'){
            return true
        }
    }).length > 0 ? false : true
    const a: PermissoesFinais = [] as PermissoesFinais
    function trocarPermissaoAll(list: boolean, permissao: Permissao[], idModulo: number) {
        let dados: number[] = permissao.map((valor) => valor.id)
        if (list === true) {
            const resultado = permissoesFinais.find((valor) => valor.id === idModulo)
            if (resultado) {
                setPermissoesFinais(permissoesFinais => permissoesFinais.map(item => {
                    if (item.id === idModulo) {
                        return {
                            ...item,
                            checkAll: true,
                            indeterminate: false,
                            permissoes: dados
                        }
                    }
                    return item
                }))
            } else {
                const valores: PermissaoFinal = {} as PermissaoFinal
                valores.id = idModulo
                valores.permissoes = dados
                valores.checkAll = true
                valores.indeterminate = false
                setPermissoesFinais([...permissoesFinais, valores])
            }
        } else {
            const resultado = permissoesFinais.find((valor) => valor.id === idModulo)
            if (resultado) {
                setPermissoesFinais(permissoesFinais => permissoesFinais.map(item => {
                    if (item.id === idModulo) {
                        return {
                            ...item,
                            checkAll: false,
                            indeterminate: false,
                            permissoes: []
                        }
                    }
                    return item
                }))
            } else {
                const valores: PermissaoFinal = {} as PermissaoFinal
                valores.id = idModulo
                valores.permissoes = []
                valores.checkAll = false
                valores.indeterminate = false
                setPermissoesFinais([...permissoesFinais, valores])
            }
        }
    }

    function trocarPermissao(valor: any, idModulo: number, permissao: Permissao[]) {


        const resultado = permissoesFinais.find((valor) => valor.id === idModulo)



        if (resultado) {
            if (valor.checked === true) {
                const list = resultado.permissoes.concat(valor.value)
                const checkAllValor = permissao.length === list.length
                const indeterminate = list.length > 0 && permissao.length > list.length
                setPermissoesFinais(permissoesFinais => permissoesFinais.map(item => {
                    if (item.id === idModulo) {
                        return {
                            ...item,
                            checkAll: checkAllValor,
                            indeterminate: indeterminate,
                            permissoes: list
                        }
                    }
                    return item
                }))
            }
            else {
                const list = resultado.permissoes.filter(item => { if (item !== valor.value) { return item } })
                console.log(list)
                const checkAllValor = permissao.length === list.length
                const indeterminate = list.length > 0 && permissao.length > list.length
                setPermissoesFinais(permissoesFinais => permissoesFinais.map(item => {
                    if (item.id === idModulo) {
                        return {
                            ...item,
                            checkAll: checkAllValor,
                            indeterminate: indeterminate,
                            permissoes: list
                        }
                    }
                    return item
                }))
            }
        } else {
            if (valor.checked === true) {
                const valores: PermissaoFinal = {} as PermissaoFinal
                const list: number[] = [valor.value] as number[];
                valores.id = idModulo
                const checkAllValor = permissao.length === list.length
                const indeterminate = list.length > 0 && permissao.length > list.length
                valores.permissoes = list
                valores.checkAll = checkAllValor,
                    valores.indeterminate = indeterminate
                setPermissoesFinais([...permissoesFinais, valores])
            } else {
                console.log('Nao sei o fazer')
            }

        }
    }

    const onFinish = (values: any) => {
        const dados = ([] as number[]).concat(...permissoesFinais.map((vetor: PermissaoFinal) => vetor.permissoes));
        const uniqueArray = dados.filter((item, index) => dados.indexOf(item) === index);
        api.patch(`/perfis/${idPerfil}`, {
            nome: values.nome,
            permissoes: uniqueArray
        }).then((response) => {
            setOpen(false)
            toast.success("Perfil atualizado com sucesso!")
            setAtualizar(!atualizar)

        })

    };
    useEffect(() => {
        async function fechDados() {
            const resposta = await api.get('/modulos')
            setModulos(resposta.data)
            const resposta2 = await api.get(`/perfis/${idPerfil}`)
            const perfil: Dados = resposta2.data
            const permissoesAgrupadas: TratamentoDado[] = [] as TratamentoDado[];

            // Itera sobre cada permissão e agrupa-as por idModulo
            perfil.permissoesPerfis.forEach(permissao => {
                const idModulo = permissao.permissao.idModulo;

                // Procura se o módulo já existe no array
                let modulo = permissoesAgrupadas.find(mod => mod.idModulo === idModulo);

                // Se o módulo não existir no array, cria um novo objeto e adiciona ao array
                if (!modulo) {
                    modulo = { idModulo: idModulo, permissoes: [] };
                    permissoesAgrupadas.push(modulo);
                }

                // Adiciona o idPermissao ao array do módulo correspondente
                modulo.permissoes.push(permissao.idPermissao);
            });
            setPermissoesFinais([])
            setNome(perfil.nome)
            permissoesAgrupadas.map((modulo) => {
                const valores: PermissaoFinal = {} as PermissaoFinal
                const permissoes = modulo.permissoes
                const lengthModulos = resposta.data.find((valor: any) => valor.id == modulo.idModulo)
                const checkAll = lengthModulos.permissoes.length == permissoes.length
                const indeterminate = permissoes.length > 0 && lengthModulos.permissoes.length > permissoes.length
                valores.id = modulo.idModulo
                valores.permissoes = permissoes
                valores.checkAll = checkAll
                valores.indeterminate = indeterminate
                a.push(valores)
            })
            setPermissoesFinais(a)
            setLoading(true)

        }
        fechDados();
    }, [])
    return (
        <Modal open={open} height={650} centered onCancel={() => setOpen(false)} width={900} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Editar Perfil do Usuário</p>} closeIcon={<IoMdClose size={24} color="white" className="" />} >
            {loading === true
                ?
                <Form disabled={perfilControle} form={form} onFinish={onFinish} layout="vertical">
                    <div className=" mt-4">

                        <Form.Item className="px-6" initialValue={nome} name='nome' rules={[{ required: true, message: 'Por favor insira um nome para o perfil' }]} label={<p className="text-lg font-bold">Nome do perfil</p>}>
                            <Input />
                        </Form.Item>
                        <div className="h-[420px] overflow-y-auto custom-scrollbar px-6 pb-2 ">
                            {modulos && modulos.map((modulo) => (
                                <div key={modulo.id} className="">

                                    <div>
                                        <Checkbox className="" checked={permissoesFinais.filter(valor => valor.id === modulo.id).map(valor => valor.checkAll).some(checkAll => checkAll)} indeterminate={permissoesFinais.filter(valor => valor.id === modulo.id).map(valor => valor.indeterminate).some(indeterminate => indeterminate)} onChange={(e) => trocarPermissaoAll(e.target.checked, modulo.permissoes, modulo.id)} key={modulo.id}  >
                                            <p className="text-lg font-bold">{modulo.nome}</p>

                                        </Checkbox>
                                        <p className="text-xs">{modulo.descricao}</p>
                                    </div>

                                    <div className="px-6 mt-4">
                                        <div className="mt-3 grid grid-cols-2 gap-y-1">
                                            {modulo.permissoes.map((permissao) => (
                                                <Checkbox key={permissao.id} value={permissao.id} checked={permissoesFinais
                                                    .filter(valor => valor.id === modulo.id)
                                                    .map(valor => valor.permissoes)
                                                    .flat().includes(permissao.id) === true ? true : false} onChange={(e) => trocarPermissao(e.target, modulo.id, modulo.permissoes)}>
                                                    <p>{permissao.descricao}</p>
                                                </Checkbox>
                                            ))}
                                        </div>
                                    </div>


                                </div>

                            ))}
                        </div>



                    </div>
                    <div className={` gap-4 pb-4 mt-2 ${perfilControle === true ? 'hidden' : 'flex justify-center'}`}>
                        <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                            Salvar
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                            Cancelar
                        </button>
                    </div>
                </Form>
                :
                <LoadingScreen heigth="560px" />
            }


        </Modal >
    )
}