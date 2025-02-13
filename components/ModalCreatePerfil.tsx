
import { atualizarAtom, openCreatePerfilAtom } from "@/pages/painel-administrativo/configuracoes/usuarios/perfil";
import { api } from "@/services/apiClient";
import { Form, Input, Modal, Checkbox } from "antd";
import { useAtom } from "jotai";

import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import LoadingScreen from "./LoadingScreen";
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



export default function ModalCreatePerfil() {
    const [form] = Form.useForm();
    const [modulos, setModulos] = useState<Modulos>()
    const [open, setOpen] = useAtom(openCreatePerfilAtom)
    const [checkedList, setCheckedList] = useState<PermissaoFinal[]>()
    const [permissoesFinais, setPermissoesFinais] = useState<PermissoesFinais>([])
    const [atualizar, setAtualizar] = useAtom(atualizarAtom)
    const [loading, setLoading] = useState<boolean>(false)

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

    function trocarPermissao(list: number[], idModulo: number, permissao: Permissao[]) {

        const resultado = permissoesFinais.find((valor) => valor.id === idModulo)
        const checkAllValor = permissao.length === list.length
        const indeterminate = list.length > 0 && permissao.length > list.length
        if (resultado) {
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
        } else {
            const valores: PermissaoFinal = {} as PermissaoFinal
            valores.id = idModulo
            valores.permissoes = list
            valores.checkAll = checkAllValor,
                valores.indeterminate = indeterminate
            setPermissoesFinais([...permissoesFinais, valores])
        }
    }
    const onFinish = (values: any) => {
        const dados = ([] as number[]).concat(...permissoesFinais.map((vetor: PermissaoFinal) => vetor.permissoes));

        api.post('/perfis/create', {
            nome: values.nome,
            permissoes: dados
        }).then((response) => {
            setOpen(false)
            toast.success("Perfil criado com sucesso!")
            setAtualizar(!atualizar)

        })

    };
    useEffect(() => {
        async function fechDados() {
            const resposta = await api.get('/modulos')
            setModulos(resposta.data)
            setLoading(true)

        }
        fechDados();
    }, [])
    return (
        <Modal open={open} height={650} onCancel={() => setOpen(false)} width={900} footer={false} centered title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Criar Perfil do Usuário</p>} closeIcon={<IoMdClose size={24} color="white" className="" />} >
            {loading === true
                ?
            <Form form={form} onFinish={onFinish} layout="vertical">
                <div className=" mt-4">

                    <Form.Item className="px-6" name='nome' rules={[{ required: true, message: 'Por favor insira um nome para o perfil' }]} label={<p className="text-lg font-bold">Nome do perfil</p>}>
                        <Input />
                    </Form.Item>

                    <div className="h-[420px] overflow-y-auto custom-scrollbar px-6 pb-2">
                        {modulos && modulos.map((modulo) => (
                            <div key={modulo.id} className="">

                                <div>
                                    <Checkbox className="" checked={permissoesFinais.filter(valor => valor.id === modulo.id).map(valor => valor.checkAll).some(checkAll => checkAll)} indeterminate={permissoesFinais.filter(valor => valor.id === modulo.id).map(valor => valor.indeterminate).some(indeterminate => indeterminate)} onChange={(e) => trocarPermissaoAll(e.target.checked, modulo.permissoes, modulo.id)} key={modulo.id}  >
                                        <p className="text-lg font-bold">{modulo.nome}</p>

                                    </Checkbox>
                                    <p className="text-xs ">{modulo.descricao}</p>
                                </div>

                                <div className="px-6 mt-4">
                                    <CheckboxGroup value={permissoesFinais
                                        .filter(valor => valor.id === modulo.id)
                                        .map(valor => valor.permissoes)
                                        .flat()
                                    } onChange={(e) => trocarPermissao(e, modulo.id, modulo.permissoes)} className="mt-3 grid grid-cols-2 gap-y-1" options={modulo.permissoes.map((valor) => ({
                                        label: valor.descricao,
                                        value: valor.id
                                    }))} />
                                </div>


                            </div>

                        ))}
                    </div>



                </div>
                <div className="flex justify-center gap-4 pb-4 mt-2">
                    <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                        Criar Perfil
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                        Cancelar
                    </button>
                </div>
            </Form>
            : <LoadingScreen heigth='560px'/>}
        </Modal >
    )
}