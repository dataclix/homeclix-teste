import { formatCEP } from "@/global/TratamentoDeDados";
import { removeAccents } from "@/global/TratamentosDeStrings";
import { atualizarUsuarioPerfilAtom } from "@/pages/painel-administrativo/meu-perfil";
import { api } from "@/services/apiClient";
import { Form, Input, Select, SelectProps } from "antd";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


interface Estado {
    id: number;
    nome: string
    sigla: string
}
interface Cidade {
    id: number;
    nome: string
    idEstado?: number
}
interface Bairro {
    id: number;
    nome: string
    idCidade?: number
}
interface Endereco {
    idUsuario: string;
    cepEntrada: string | null
    logradouro: string | null
    numero: string | null
    complemento: string | null
    estadoEntrada: Estado | null
    cidadeEntrada: Cidade | null
    bairroEntrada: Bairro | null
}
export default function EnderecoUsuario({ idUsuario, cepEntrada, complemento, logradouro, numero, cidadeEntrada, estadoEntrada, bairroEntrada }: Endereco) {
    const [form] = Form.useForm();
    const [estados, setEstados] = useState<Estado[]>([])
    const [cidades, setCidades] = useState<Cidade[]>([])
    const [bairros, setBairros] = useState<Bairro[]>([])
    const [estado, setEstado] = useState<Estado>()
    const [cidade, setCidade] = useState<Cidade>()
    const [bairro, setBairro] = useState<Bairro>()
    const [atualizar, setAtualizar] = useAtom(atualizarUsuarioPerfilAtom)

    useEffect(() => {
        api.get('localidades/estados').then((resposta) => {
            setEstados(resposta.data)
        })
        if (estadoEntrada) {
            setEstado(estadoEntrada)
            if (cidadeEntrada) {
                api.get('localidades/estados/' + cidadeEntrada.idEstado + '/cidades').then((resposta) => {
                    setCidades(resposta.data)
                })
                setCidade(cidadeEntrada)
                if (bairroEntrada) {
                    api.get('localidades/cidades/' + bairroEntrada.idCidade + '/bairros').then((resposta) => {
                        setBairros(resposta.data)
                    })
                    setBairro(bairroEntrada)
                }
            }
        }
        form.setFieldsValue({
            estado: estadoEntrada ? estadoEntrada.nome : null,
            cidade: cidadeEntrada ? cidadeEntrada.nome : null,
            bairro: bairroEntrada ? bairroEntrada.nome : null,
        })
    }, [])
    const onFinishEndereco = (valores: any) => {
        console.log(valores)
        console.log(cidade)
        console.log(bairro)
        console.log(estado)
        api.patch('usuarios/' + idUsuario, {
            cep: cep,
            logradouro: valores.logradouro,
            numero: valores.numero,
            complemento: valores.complemento,
            idBairro: bairro ? bairro.id : null,
            idCidade: cidade ? cidade.id : null,
            idEstado: estado ? estado.id : null
        }).then((resposta) => {
            toast.success('Endereço alterado com sucesso!')
            setAtualizar(!atualizar)
        })
    }
    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) {
            return false; // ou true, dependendo do seu requisito para opções indefinidas
        }

        const optionLabel = removeAccents(option.label);
        return optionLabel.toLowerCase().includes(removeAccents(input.toLowerCase()));
    };
    const optionsBairro: SelectProps['options'] = bairros?.map(bairro => ({
        label: bairro.nome,
        value: bairro.nome,
        id: bairro.id
    })) || [];
    function onChangeBairroCliente(e: string, option: any) {
        setBairro({
            id: option.id,
            nome: option.label,
        })
    }
    const optionsCidade: SelectProps['options'] = cidades?.map(cidade => ({
        label: cidade.nome,
        value: cidade.nome,
        id: cidade.id
    })) || [];
    function onChangeCidadeCliente(e: string, option: any) {
        setCidade({
            id: option.id,
            nome: option.label,
        })
        form.setFieldsValue({
            bairro: undefined
        })
        setBairro(undefined)
        api.get('localidades/cidades/' + option.id + '/bairros').then((resposta) => {
            setBairros(resposta.data)
        })
    }
    const optionsEstado: SelectProps['options'] = estados?.map(estado => ({
        label: estado.nome,
        value: estado.sigla,
        id: estado.id
    })) || [];
    function onChangeEstadoCliente(e: string, option: any) {
        setEstado({
            id: option.id,
            nome: option.label,
            sigla: option.value
        })
        form.setFieldsValue({
            cidade: undefined,
            bairro: undefined
        })
        setCidade(undefined)
        setBairro(undefined)
        api.get('localidades/estados/' + option.id + '/cidades').then((resposta) => {
            setCidades(resposta.data)
        })
    }

    const [cep, setCep] = useState<string>(cepEntrada ? cepEntrada : '')
    function handleCepChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCEP = formatCEP(event.target.value);
        setCep(formattedCEP);
    };

    return (
        <div>
            <div className="border-[1px] border-verde rounded-lg pb-4">
                <div className="text-white bg-verde text-xl font-bold rounded-t-lg py-2">
                    <p className="text-center">Endereço</p>
                </div>
                <Form form={form} onFinish={onFinishEndereco} layout="vertical">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 px-4 mt-4">
                        <div>
                            <p className="font-bold text-base">CEP  <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" className="text-[12px] underline">(não sei o CEP)</a></p>
                            <input placeholder="00000-000" value={cep} onChange={handleCepChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                        </div>
                        <Form.Item initialValue={logradouro} name='logradouro' className="col-span-2" label={<p className="font-bold text-base">Rua</p>}>
                            <Input />
                        </Form.Item>
                        <Form.Item initialValue={numero} name='numero' label={<p className="font-bold text-base">Número</p>}>
                            <Input />
                        </Form.Item>
                        <Form.Item initialValue={complemento} className="sm:col-span-2" name='complemento' label={<p className="font-bold text-base">Complemento</p>}>
                            <Input />
                        </Form.Item>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-x-4 px-4">
                        <Form.Item name='estado' label={<p className="font-bold text-base">Estado</p>}>
                            <Select onChange={(e, option) => onChangeEstadoCliente(e, option)} options={optionsEstado} showSearch
                                filterOption={(input, option) => filterOption(input, option as { label: string; value: string })} />
                        </Form.Item>
                        <Form.Item name='cidade' label={<p className="font-bold text-base">Cidade</p>}>
                            <Select
                                disabled={estado === undefined ? true : false}
                                onChange={(e, option) => onChangeCidadeCliente(e, option)}
                                options={optionsCidade}
                                showSearch
                                filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                            />
                        </Form.Item>
                        <Form.Item name='bairro' label={<p className="font-bold text-base">Bairro</p>}>
                            <Select
                                disabled={estado === undefined || cidade === undefined ? true : false}
                                options={optionsBairro}
                                onChange={(e, option) => onChangeBairroCliente(e, option)}
                                showSearch
                                filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                            />
                        </Form.Item>

                    </div>
                    <div className="flex justify-center items-center gap-6 ">
                        <button className="bg-verde text-white py-2 px-6 rounded-md">Salvar Endereço</button>
                    </div>
                </Form>

            </div>
        </div>
    )
}