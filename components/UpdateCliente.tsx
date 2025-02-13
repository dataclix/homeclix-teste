import { atualizarAtom, atualizarEditarAtom, clienteIdAtom, openCreateClienteAtom } from "@/pages/painel-administrativo/clientes";
import { Form, Input, Modal, Select, DatePicker, SelectProps, ConfigProvider } from "antd";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

import { api } from "@/services/apiClient";
import { removeAccents } from "@/global/TratamentosDeStrings";
import moment from 'moment';
import 'moment/locale/pt-br';
import { formatCEP, formatCNPJ, formatCPF, formatCPFCNPJ, formatCelular, formatTelefone, validarCPF } from "@/global/TratamentoDeDados";
import { toast } from "react-toastify";
import { UsuarioGlobal } from "@/global/usuario";
moment.locale('pt-br');




interface Icon {
    open: boolean
}
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
interface Financeiro {
    id: string
    idCliente: string
    banco: string
    agencia: string
    operacao: string
    conta: string
    tipoConta: string
    cpfcnpjConta: string
    tipoChavePix: string
    chavePix: string
    createdAt: Date
    updatedAt: Date
}
interface Entrada {
    id: string
    idImobiliaria: number
    nome: string
    cpfCnpj: string
    tipoPessoa: string
    identidade: string
    orgaoEmissor: string
    dataExpedicao: Date
    email: string
    telefone: string
    celular: string
    dataNascimento: Date
    cep: string,
    logradouro: string
    numero: string
    complemento: string
    idBairro: null,
    idCidade: 3243,
    idEstado: 19,
    nacionalidade: string
    profissao: string
    nomePai: string
    nomeMae: string
    nomeConjuge: string
    cpfConjuge: string
    identidadeConjuge: string
    orgaoEmissorConjuge: string
    dataExpedicaoConjuge: Date
    emailConjuge: string
    telefoneConjuge: string
    celularConjuge: string
    dataNascimentoConjuge: Date
    cepConjuge: string
    logradouroConjuge: string
    numeroConjuge: string
    complementoConjuge: string
    idBairroConjuge: 16,
    idCidadeConjuge: 2974,
    idEstadoConjuge: 17,
    nacionalidadeConjuge: string
    profissaoConjuge: string
    nomePaiConjuge: string
    nomeMaeConjuge: string
    estadoCivil: string
    createdAt: Date
    updatedAt: Date
    documentos: []
    financeiro: Financeiro[]
}
interface Saida {
    nome: string
    cpfCnpj: string
    tipoPessoa: string
    identidade: string
    orgaoEmissor: string
    dataExpedicao: Date | null
    email: string
    telefone: string
    celular: string
    dataNascimento: Date | null
    cep: string
    logradouro: string
    numero: string
    complemento: string
    idBairro: number | null
    idCidade: number | null
    idEstado: number | null
    nacionalidade: string
    profissao: string
    nomePai: string
    nomeMae: string
    estadoCivil: string
    nomeConjuge: string
    cpfConjuge: string
    identidadeConjuge: string
    orgaoEmissorConjuge: string
    dataExpedicaoConjuge: Date | null
    emailConjuge: string
    telefoneConjuge: string
    celularConjuge: string
    dataNascimentoConjuge: Date | null
    cepConjuge: string
    logradouroConjuge: string
    numeroConjuge: string
    complementoConjuge: string
    idBairroConjuge: number | null
    idCidadeConjuge: number | null
    idEstadoConjuge: number | null
    nacionalidadeConjuge: string
    profissaoConjuge: string
    nomePaiConjuge: string
    nomeMaeConjuge: string
}
export default function UpdateCliente() {
    const [idCliente, setIdCliente] = useAtom(clienteIdAtom)
    const [cliente, setCliente] = useState<Entrada>()
    const [openExcluir, setOpenExcluir] = useState<boolean>(false)
    const [openDadosBancarios, setOpenDadosBancarios] = useState<boolean>(true)
    const [openInformacoesConjuge, setOpenInformacoesConjuge] = useState<boolean>(true)
    const [estados, setEstados] = useState<Estado[]>([])
    const [cidades, setCidades] = useState<Cidade[]>([])
    const [cidadesConjuge, setCidadesConjuge] = useState<Cidade[]>([])
    const [bairros, setBairros] = useState<Bairro[]>([])
    const [bairrosConjuge, setBairrosConjuge] = useState<Bairro[]>([])
    const [cepCliente, setCepCliente] = useState<string>('')
    const [telefoneCliente, setTelefoneCliente] = useState<string>('')
    const [celularCliente, setCelularCliente] = useState<string>('')
    const [cpfCnpjCliente, setCpfCnpjCliente] = useState<string>('')
    const [cepConjuge, setCepConjuge] = useState<string>('')
    const [telefoneConjuge, setTelefoneConjuge] = useState<string>('')
    const [celularConjuge, setCelularConjuge] = useState<string>('')
    const [cpfCnpjConjuge, setCpfCnpjConjuge] = useState<string>('')
    const [cpfCnpjBancario, setCpfCnpjBancario] = useState<string>('')
    const [estado, setEstado] = useState<Estado>()
    const [cidade, setCidade] = useState<Cidade>()
    const [bairro, setBairro] = useState<Bairro>()
    const [estadoConjuge, setEstadoConjuge] = useState<Estado>()
    const [cidadeConjuge, setCidadeConjuge] = useState<Cidade>()
    const [bairroConjuge, setBairroConjuge] = useState<Bairro>()
    const [form] = Form.useForm();
    const [atualizar, setAtualizar] = useAtom(atualizarAtom)
    const [atualizarEditar, setAtualizarEditar] = useAtom(atualizarEditarAtom)
    const [profile, setProfile] = useState<UsuarioGlobal>()

    const [tipoPessoa, setTipoPessoa] = useState<string>()
    const [cpf, setCpf] = useState<string>('')
    const [cpfError, setCpfError] = useState<boolean>(false)
    function handleCpf(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCpf = formatCPF(event.target.value)
        setCpfError(false)
        setCpf(formattedCpf)
    }

    const [cnpj, setCnpj] = useState<string>('')
    const [cnpjError, setCnpjError] = useState<boolean>(false)
    function handleCnpj(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCpf = formatCNPJ(event.target.value)
        setCnpjError(false)
        setCnpj(formattedCpf)
    }
    useEffect(() => {

        if (idCliente !== '') {
            api.get('usuarios/profile').then((resposta) => {

                setProfile(resposta.data)
            })
            api.get('clientes/' + idCliente).then((resposta) => {

                setCliente(resposta.data)
                setTelefoneCliente(resposta.data.telefone)
                setCelularCliente(resposta.data.celular)
                setCpfCnpjCliente(resposta.data.cpfCnpj)
                setTelefoneConjuge(resposta.data.telefoneConjuge)
                setCelularConjuge(resposta.data.celularConjuge)
                setCpfCnpjConjuge(resposta.data.cpfConjuge)
                setCepCliente(resposta.data.cep)
                setCepConjuge(resposta.data.cepConjuge)
                setTipoPessoa(resposta.data.tipoPessoa)
                if(resposta.data.tipoPessoa === 'FISICA'){
                    setCpf(resposta.data.cpfCnpj)
                }
                if(resposta.data.tipoPessoa === 'JURIDICA'){
                    setCnpj(resposta.data.cpfCnpj)
                }
                if (resposta.data.estado) {
                    setEstado(resposta.data.estado)
                    if (resposta.data.cidade) {
                        api.get('localidades/estados/' + resposta.data.cidade.idEstado + '/cidades').then((resposta) => {
                            setCidades(resposta.data)
                        })
                        setCidade(resposta.data.cidade)
                        if (resposta.data.bairro) {
                            api.get('localidades/cidades/' + resposta.data.bairro.idCidade + '/bairros').then((resposta) => {
                                setBairros(resposta.data)
                            })
                            setBairro(resposta.data.bairro)
                        }
                    }
                }
                if (resposta.data.estadoConjuge) {
                    setEstadoConjuge(resposta.data.estadoConjuge)
                    if (resposta.data.cidadeConjuge) {
                        api.get('localidades/estados/' + resposta.data.cidadeConjuge.idEstado + '/cidades').then((resposta) => {
                            setCidadesConjuge(resposta.data)
                        })
                        setCidadeConjuge(resposta.data.cidadeConjuge)
                        if (resposta.data.bairroConjuge) {
                            api.get('localidades/cidades/' + resposta.data.bairroConjuge.idCidade + '/bairros').then((resposta) => {
                                setBairrosConjuge(resposta.data)
                            })
                            setBairroConjuge(resposta.data.bairroConjuge)
                        }
                    }
                }
                if (resposta.data.financeiro[0]) {
                    setCpfCnpjBancario(resposta.data.financeiro[0].cpfcnpjConta)
                    form.setFieldsValue({
                        banco: resposta.data.financeiro[0].banco,
                        agencia: resposta.data.financeiro[0].agencia,
                        conta: resposta.data.financeiro[0].conta,
                        operacao: resposta.data.financeiro[0].operacao,
                        tipoConta: resposta.data.financeiro[0].tipoConta,
                        chavePix: resposta.data.financeiro[0].chavePix,
                        tipoChavePix: resposta.data.financeiro[0].tipoChavePix
                    })
                } else {
                    form.setFieldsValue({
                        banco: null,
                        agencia: null,
                        conta: null,
                        operacao: null,
                        tipoConta: null,
                        chavePix: null,
                        tipoChavePix: null
                    })
                }
                form.setFieldsValue({
                    nome: resposta.data.nome,
                    email: resposta.data.email,
                    tipoPessoa: resposta.data.tipoPessoa,
                    dataNascimaento: moment(resposta.data.dataNascimento).isValid() ? moment(resposta.data.dataNascimento) : null,
                    identidade: resposta.data.identidade,
                    dataExpedicao: moment(resposta.data.dataExpedicao).isValid() ? moment(resposta.data.dataExpedicao) : null,
                    orgaoEmissor: resposta.data.orgaoEmissor,
                    profissao: resposta.data.profissao,
                    estado: resposta.data.estado ? resposta.data.estado.nome : null,
                    cidade: resposta.data.cidade ? resposta.data.cidade.nome : null,
                    bairro: resposta.data.bairro ? resposta.data.bairro.nome : null,
                    estadoCivil: resposta.data.estadoCivil,
                    nacionalidade: resposta.data.nacionalidade,
                    nomePai: resposta.data.nomePai,
                    nomeMae: resposta.data.nomeMae,
                    logradouro: resposta.data.logradouro,
                    numero: resposta.data.numero,
                    complemento: resposta.data.complemento,
                    nomeConjuge: resposta.data.nomeConjuge,
                    emailConjuge: resposta.data.emailConjuge,
                    tipoPessoaConjuge: resposta.data.tipoPessoaConjuge,
                    dataNascimaentoConjuge: moment(resposta.data.dataNascimentoConjuge).isValid() ? moment(resposta.data.dataNascimentoConjuge) : null,
                    identidadeConjuge: resposta.data.identidadeConjuge,
                    dataExpedicaoConjuge: moment(resposta.data.dataExpedicaoConjuge).isValid() ? moment(resposta.data.dataExpedicaoConjuge) : null,
                    orgaoEmissorConjuge: resposta.data.orgaoEmissorConjuge,
                    profissaoConjuge: resposta.data.profissaoConjuge,
                    estadoCivilConjuge: resposta.data.estadoCivilConjuge,
                    nacionalidadeConjuge: resposta.data.nacionalidadeConjuge,
                    nomePaiConjuge: resposta.data.nomePaiConjuge,
                    nomeMaeConjuge: resposta.data.nomeMaeConjuge,
                    logradouroConjuge: resposta.data.logradouroConjuge,
                    numeroConjuge: resposta.data.numeroConjuge,
                    complementoConjuge: resposta.data.complementoConjuge,
                    estadoConjuge: resposta.data.estadoConjuge ? resposta.data.estadoConjuge.nome : null,
                    cidadeConjuge: resposta.data.cidadeConjuge ? resposta.data.cidadeConjuge.nome : null,
                    bairroConjuge: resposta.data.bairroConjuge ? resposta.data.bairroConjuge.nome : null,


                })

            }).catch((error) => {
            })
        }

    }, [idCliente])

    function handleCepClienteChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCEP = formatCEP(event.target.value);
        setCepCliente(formattedCEP);
    };
    function handleTelefoneClienteChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedTelefone = formatTelefone(event.target.value);
        setTelefoneCliente(formattedTelefone); // Assumindo que setTelefone é a função para atualizar o estado do número de telefone
    }
    const [celularClienteError, setCelularClienteError] = useState<boolean>(false)
    function handleCelularClienteChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedTelefone = formatCelular(event.target.value);
        setCelularClienteError(false)
        setCelularCliente(formattedTelefone); // Assumindo que setTelefone é a função para atualizar o estado do número de telefone
    }
    function handleCPFCNPJClienteChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;

        // Limita o tamanho máximo para CPF (11 caracteres) e CNPJ (14 caracteres)
        const maxLength = value.length <= 14 ? 14 : 18;
        const formattedValue = formatCPFCNPJ(value.slice(0, maxLength));
        setCpfCnpjCliente(formattedValue);
    }
    function handleCepConjugeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCEP = formatCEP(event.target.value);
        setCepConjuge(formattedCEP);
    };
    function handleTelefoneConjugeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedTelefone = formatTelefone(event.target.value);
        setTelefoneConjuge(formattedTelefone); // Assumindo que setTelefone é a função para atualizar o estado do número de telefone
    }
    function handleCelularConjugeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCelular = formatCelular(event.target.value);
        setCelularConjuge(formattedCelular); // Assumindo que setTelefone é a função para atualizar o estado do número de telefone
    }
    function handleCPFCNPJConjugeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;

        // Limita o tamanho máximo para CPF (11 caracteres) e CNPJ (14 caracteres)
        const maxLength = value.length <= 14 ? 14 : 18;
        const formattedValue = formatCPFCNPJ(value.slice(0, maxLength));
        setCpfCnpjConjuge(formattedValue);
    }
    function handleCPFCNPJBancarioChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;

        // Limita o tamanho máximo para CPF (11 caracteres) e CNPJ (14 caracteres)
        const maxLength = value.length <= 14 ? 14 : 18;
        const formattedValue = formatCPFCNPJ(value.slice(0, maxLength));
        setCpfCnpjBancario(formattedValue);
    }
    useEffect(() => {
        api.get('localidades/estados').then((resposta) => {
            setEstados(resposta.data)
        })
    }, [])
    function Icon({ open }: Icon) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className={`${open === true ? "rotate-180" : ""} h-5 w-5 transition-transform`}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        );
    }

    const onFinish = (values: any) => {
        if (celularCliente && celularCliente.length < 15) {
            setCelularClienteError(true)
        }
        if (tipoPessoa === 'FISICA') {
            if (cpf && cpf.length < 14) {
                setCpfError(true)
            }
        } else if (tipoPessoa === 'JURIDICA') {
            if (cnpj && cnpj.length < 18) {
                setCnpjError(true)
            }
        }
        if (((tipoPessoa === 'FISICA' && cpf && cpf.length === 14) || (tipoPessoa === 'JURIDICA' && cnpj && cnpj.length === 18)) && (celularCliente && celularCliente.length === 15)) {
            if((cpf !== undefined && validarCPF(cpf)) || tipoPessoa === 'JURIDICA') {

                
                const saida: Saida = {
                    nome: values.nome,
                    cpfCnpj: tipoPessoa === 'FISICA' ? cpf : cnpj ,
                    tipoPessoa: values.tipoPessoa,
                    identidade: values.identidade,
                    orgaoEmissor: values.orgaoEmissor,
                    dataExpedicao: values.dataExpedicao,
                    email: values.email === '' ? null : values.email,
                    telefone: telefoneCliente,
                    celular: celularCliente,
                    dataNascimento: values.dataNascimento !== undefined ? values.dataNascimento : null,
                    cep: cepCliente,
                    logradouro: values.logradouro,
                    numero: values.numero,
                    complemento: values.complemento,
                    idBairro: bairro?.id ? bairro.id : null,
                    idCidade: cidade?.id ? cidade.id : null,
                    idEstado: estado?.id ? estado.id : null,
                    nacionalidade: values.nacionalidade,
                    profissao: values.profissao,
                    nomePai: values.nomePai,
                    nomeMae: values.nomeMae,
                    estadoCivil: values.estadoCivil,
                    nomeConjuge: values.nomeConjuge,
                    cpfConjuge: cpfCnpjConjuge,
                    identidadeConjuge: values.identidadeConjuge,
                    orgaoEmissorConjuge: values.orgaoEmissorConjuge,
                    dataExpedicaoConjuge: values.dataExpedicaoConjuge,
                    emailConjuge: values.emailConjuge,
                    telefoneConjuge: telefoneConjuge,
                    celularConjuge: celularConjuge,
                    dataNascimentoConjuge: values.dataNascimentoConjuge,
                    cepConjuge: cepConjuge,
                    logradouroConjuge: values.logradouroConjuge,
                    numeroConjuge: values.numeroConjuge,
                    complementoConjuge: values.complementoConjuge,
                    idBairroConjuge: bairroConjuge?.id ? bairroConjuge.id : null,
                    idCidadeConjuge: cidadeConjuge?.id ? cidadeConjuge.id : null,
                    idEstadoConjuge: estadoConjuge?.id ? estadoConjuge.id : null,
                    nacionalidadeConjuge: values.nacionalidadeConjuge,
                    profissaoConjuge: values.profissaoConjuge,
                    nomePaiConjuge: values.nomePaiConjuge,
                    nomeMaeConjuge: values.nomeMaeConjuge
                }
                api.patch('clientes/' + cliente?.id, saida).then((resposta) => {

                    if (cliente && cliente.financeiro.length > 0) {
        
                        api.patch('clientes/financeiro/' + cliente.financeiro[0].id, {
                            idCliente: cliente.id,
                            banco: values.banco,
                            agencia: values.agencia,
                            operacao: values.operacao,
                            conta: values.conta,
                            tipoConta: values.tipoConta,
                            cpfcnpjConta: cpfCnpjBancario,
                            tipoChavePix: values.tipoChavePix,
                            chavePix: values.chavePix
                        }).then((resposta) => {
                            toast.success('Cliente atualizado com sucesso!')
                            setAtualizarEditar(!atualizarEditar)
                        })
                    } else if (cliente) {
                        api.post('clientes/financeiro', {
                            idCliente: cliente.id,
                            banco: values.banco,
                            agencia: values.agencia,
                            operacao: values.operacao,
                            conta: values.conta,
                            tipoConta: values.tipoConta,
                            cpfcnpjConta: cpfCnpjBancario,
                            tipoChavePix: values.tipoChavePix,
                            chavePix: values.chavePix
                        }).then((resposta) => {
        
                            toast.success('Cliente atualizado com sucesso!')
                            setAtualizarEditar(!atualizarEditar)
                        })
                    }
                }).catch((err) => {
                    toast.error(err.response.data.Mensagem)
                })
            


            } else {

                setCpfError(true)
            }
        }
       

       

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
        value: estado.nome,
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
    function onChangeEstadoConjuge(e: string, option: any) {
        setEstadoConjuge({
            id: option.id,
            nome: option.label,
            sigla: option.value
        })
        form.setFieldsValue({
            cidadeConjuge: undefined,
            bairroConjuge: undefined
        })
        setCidadeConjuge(undefined)
        setBairroConjuge(undefined)
        api.get('localidades/estados/' + option.id + '/cidades').then((resposta) => {
            setCidadesConjuge(resposta.data)
        })
    }
    const optionsCidadeConjuge: SelectProps['options'] = cidadesConjuge?.map(cidade => ({
        label: cidade.nome,
        value: cidade.nome,
        id: cidade.id
    })) || [];
    function onChangeCidadeConjuge(e: string, option: any) {
        setCidadeConjuge({
            id: option.id,
            nome: option.label,
        })
        form.setFieldsValue({
            bairroConjuge: undefined
        })
        setBairroConjuge(undefined)
        api.get('localidades/cidades/' + option.id + '/bairros').then((resposta) => {
            setBairrosConjuge(resposta.data)
        })
    }
    const optionsBairroConjuge: SelectProps['options'] = bairrosConjuge?.map(bairro => ({
        label: bairro.nome,
        value: bairro.nome,
        id: bairro.id
    })) || [];
    function onChangeBairroConjuge(e: string, option: any) {
        setBairroConjuge({
            id: option.id,
            nome: option.label,
        })
    }
    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) {
            return false; // ou true, dependendo do seu requisito para opções indefinidas
        }

        const optionLabel = removeAccents(option.label);
        return optionLabel.toLowerCase().includes(removeAccents(input.toLowerCase()));
    };
    function excluirCliente(id: string) {
        api.delete('clientes/' + id).then(() => {
            toast.success('Cliente Excluido com sucesso!')
            setAtualizar(!atualizar)
            setOpenExcluir(false)
        })
    }
    return (
        <>
            <Modal open={openExcluir} centered onCancel={() => setOpenExcluir(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Exclir cliente - {cliente?.nome}</p>} closeIcon={<IoMdClose size={24} color="white" className="" />} >
                <p className="py-4 px-6  text-lg">Tem certeza que quer excluir o cliente: <span className="font-bold">{cliente?.nome}</span></p>
                <div className="flex justify-center gap-4 pb-4 mt-4">
                    <button onClick={() => excluirCliente(cliente ? cliente.id : '')} className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                        Excluir
                    </button>
                    <button type="button" onClick={() => setOpenExcluir(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                        Cancelar
                    </button>
                </div>
            </Modal>
            {cliente ?
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    < div className="sm:h-[calc(100vh-125px)] overflow-y-auto custom-scrollbar" >
                        <div className="px-2">


                            <div className="w-full  px-6 py-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Form.Item initialValue={cliente.nome} rules={[{ required: true, message: 'Por favor insira o nome do cliente!' }]} name='nome' className="col-span-2" label={<p className="font-bold text-base">Nome</p>}>
                                        <Input required />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.email} rules={[{ type: 'email', message: 'E-mail invalido!' }]} name='email' className="col-span-2" label={<p className="font-bold text-base">E-mail</p>}>
                                        <Input  />
                                    </Form.Item>
                                    <div>
                                        <p className="font-bold text-base">Telefone Fixo</p>
                                        <input placeholder="(00) 0000-0000" value={telefoneCliente} onChange={handleTelefoneClienteChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base"><span className="text-red-500">*</span>Celular</p>
                                        <input required placeholder="(00) 00000-0000" value={celularCliente} onChange={handleCelularClienteChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                        {celularClienteError === true && (<p className="text-sm text-red-500 my-0.5 px-2">celular inválido!</p>)}
                                    </div>
                                    <Form.Item initialValue={tipoPessoa} rules={[{ required: true, message: 'Por favor insira o tipo de pessoa' }]} name='tipoPessoa' label={<p className="font-bold text-base">Tipo de Pessoa</p>}>
                                        <Select
                                            onChange={(e) => setTipoPessoa(e)}
                                            options={[
                                                {
                                                    label: 'Pessoa Física',
                                                    value: 'FISICA'
                                                },
                                                {
                                                    label: 'Pessoa Jurídica',
                                                    value: 'JURIDICA'
                                                }
                                            ]}
                                        />
                                    </Form.Item>
                                    {tipoPessoa === 'FISICA' && (
                                        <div>
                                            <p className="font-bold text-base"><span className="text-red-500">* </span>CPF</p>
                                            <input required placeholder="123.456.789-00" value={cpf} onChange={handleCpf} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                            {cpfError === true && (<p className="text-sm text-red-500 my-0.5 px-2">CPF inválido!</p>)}
                                        </div>
                                    )}
                                    {tipoPessoa === 'JURIDICA' && (
                                        <div>
                                            <p className="font-bold text-base"><span className="text-red-500">* </span>CNPJ</p>
                                            <input required placeholder="12.345.678/9101-11" value={cnpj} onChange={handleCnpj} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                            {cnpjError === true && (<p className="text-sm text-red-500 my-0.5 px-2">CNPJ inválido!</p>)}
                                        </div>
                                    )}


                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Form.Item initialValue={moment(cliente.dataNascimento).isValid() ? moment(cliente.dataNascimento) : null} name='dataNascimento' label={<p className="font-bold text-base">Data de Nascimento</p>}>
                                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.identidade} name='identidade' label={<p className="font-bold text-base">Identidade</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={moment(cliente.dataExpedicao).isValid() ? moment(cliente.dataExpedicao) : null} name='dataExpedicao' label={<p className="font-bold text-base">Identidade(D. Expedição)</p>}>
                                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.orgaoEmissor} name='orgaoEmissor' label={<p className="font-bold text-base">Identidade(Orgão Emissor)</p>}>
                                        <Input />
                                    </Form.Item>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                                    <Form.Item initialValue={cliente.profissao} name='profissao' className="col-span-2" label={<p className="font-bold text-base">Profissão</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.estadoCivil} name='estadoCivil' label={<p className="font-bold text-base">Estado Civil</p>}>
                                        <Select options={[
                                            {
                                                label: 'Solteiro',
                                                value: 'SOLTEIRO'
                                            },
                                            {
                                                label: 'Casado',
                                                value: 'CASADO'
                                            },
                                            {
                                                label: 'Divorciado',
                                                value: 'DIVORCIADO'
                                            },
                                            {
                                                label: 'Viuvo',
                                                value: 'VIUVO'
                                            },
                                            {
                                                label: 'Separado',
                                                value: 'SEPARADO'
                                            },

                                        ]} />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.nacionalidade} name='nacionalidade' label={<p className="font-bold text-base">Nacionalidade</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.nomePai} name='nomePai' className="col-span-2" label={<p className="font-bold text-base">Nome do pai</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.nomeMae} name='nomeMae' className="col-span-2" label={<p className="font-bold text-base">Nome do mãe</p>}>
                                        <Input />
                                    </Form.Item>

                                </div>
                                <div className="border-b-[1px] border-b-verde mb-3 py-2">
                                    <p className="text-xl font-bold">Endereço</p>

                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <p className="font-bold text-base">CEP  <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" className="text-[12px] underline">(não sei o CEP)</a></p>
                                        <input placeholder="00000-000" value={cepCliente} onChange={handleCepClienteChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <Form.Item initialValue={cliente.logradouro} name='logradouro' className="col-span-2" label={<p className="font-bold text-base">Logradouro</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.numero} name='numero' label={<p className="font-bold text-base">Número</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.complemento} name='complemento' label={<p className="font-bold text-base">Complemento</p>}>
                                        <Input />
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
                                    <Form.Item name='cidade' label={<p className="font-bold text-base">Cidade</p>}>
                                        <Select
                                            disabled={estado === undefined ? true : false}
                                            onChange={(e, option) => onChangeCidadeCliente(e, option)}
                                            options={optionsCidade}
                                            showSearch
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                        />
                                    </Form.Item>
                                    <Form.Item name='estado' label={<p className="font-bold text-base">Estado</p>}>
                                        <Select onChange={(e, option) => onChangeEstadoCliente(e, option)} options={optionsEstado} showSearch
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })} />
                                    </Form.Item>
                                </div>
                            </div>

                        </div>
                        <div className="px-2 mt-4">
                            <button type="button" className="w-full" onClick={() => setOpenInformacoesConjuge(!openInformacoesConjuge)}>
                                <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                    <div className="flex items-center gap-2">
                                        <FiMenu size={24} />
                                        <p className="text-lg">Informações do Cônjuge</p>
                                    </div>

                                    <Icon open={openInformacoesConjuge} />
                                </div>
                            </button>

                            <div className={`"w-full   border-[1px] border-verde rounded-b-md transition-all duration-1000 px-6 py-4" ${openInformacoesConjuge === true ? 'h-full sm:h-[780px] opacity-100' : 'opacity-0 hidden h-0'}`}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                    <Form.Item initialValue={cliente.nomeConjuge} name='nomeConjuge' className="col-span-2" label={<p className="font-bold text-base">Nome</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.emailConjuge} rules={[{ type: 'email', message: 'Email Invalido!' }]} name='emailConjuge' className="col-span-2" label={<p className="font-bold text-base">E-mail</p>}>
                                        <Input />
                                    </Form.Item>
                                    <div>
                                        <p className="font-bold text-base">Telefone Fixo</p>
                                        <input placeholder="(00) 0000-0000" value={telefoneConjuge} onChange={handleTelefoneConjugeChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">Celular</p>
                                        <input placeholder="(00) 00000-0000" value={celularConjuge} onChange={handleCelularConjugeChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">CPF/CNPJ</p>
                                        <input placeholder="cpf ou cnpj " value={cpfCnpjConjuge} onChange={handleCPFCNPJConjugeChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <Form.Item initialValue={moment(cliente.dataNascimentoConjuge).isValid() ? moment(cliente.dataNascimentoConjuge) : null} label={<p className="font-bold text-base">Data de Nascimento</p>}>
                                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                                    </Form.Item>

                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <Form.Item initialValue={cliente.identidadeConjuge} name='identidadeConjuge' label={<p className="font-bold text-base">Identidade</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={moment(cliente.dataExpedicaoConjuge).isValid() ? moment(cliente.dataExpedicaoConjuge) : null} name='dataExpedicaoConjuge' label={<p className="font-bold text-base">Identidade(D. Expedição)</p>}>
                                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.orgaoEmissorConjuge} name='orgaoEmissorConjuge' label={<p className="font-bold text-base">Identidade(Orgão Emissor)</p>}>
                                        <Input />
                                    </Form.Item>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">



                                    <Form.Item initialValue={cliente.profissaoConjuge} name='profissaoConjuge' className="col-span-2" label={<p className="font-bold text-base">Profissão</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.nacionalidadeConjuge} name='nacionalidadeConjuge' className="col-span-2" label={<p className="font-bold text-base">Nacionalidade</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.nomePaiConjuge} name='nomePaiConjuge' className="col-span-2" label={<p className="font-bold text-base">Nome do pai</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.nomeMaeConjuge} name='nomeMaeConjuge' className="col-span-2" label={<p className="font-bold text-base">Nome do mãe</p>}>
                                        <Input />
                                    </Form.Item>

                                </div>
                                <div className="border-b-[1px] border-b-verde mb-3 py-2">
                                    <p className="text-xl font-bold">Endereço</p>

                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <p className="font-bold text-base">CEP  <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" className="text-[12px] underline">(não sei o CEP)</a></p>
                                        <input placeholder="00000-000" value={cepConjuge} onChange={handleCepConjugeChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <Form.Item initialValue={cliente.logradouroConjuge} name='logradouroConjuge' className="col-span-2" label={<p className="font-bold text-base">Logradouro</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.numeroConjuge} name='numeroConjuge' label={<p className="font-bold text-base">Número</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.complementoConjuge} name='complementoConjuge' label={<p className="font-bold text-base">Complemento</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='bairroConjuge' label={<p className="font-bold text-base">Bairro</p>}>
                                        <Select
                                            disabled={estadoConjuge === undefined || cidadeConjuge === undefined ? true : false}
                                            options={optionsBairroConjuge}
                                            onChange={(e, option) => onChangeBairroConjuge(e, option)}
                                            showSearch
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                        />
                                    </Form.Item>
                                    <Form.Item name='cidadeConjuge' label={<p className="font-bold text-base">Cidade</p>}>
                                        <Select
                                            disabled={estadoConjuge === undefined ? true : false}
                                            onChange={(e, option) => onChangeCidadeConjuge(e, option)}
                                            options={optionsCidadeConjuge}
                                            showSearch
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                        />
                                    </Form.Item>
                                    <Form.Item name='estadoConjuge' label={<p className="font-bold text-base">Estado</p>}>
                                        <Select onChange={(e, option) => onChangeEstadoConjuge(e, option)} options={optionsEstado} showSearch
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })} />
                                    </Form.Item>
                                </div>
                            </div>

                        </div>
                        <div className="px-2 mt-4 mb-4 ">
                            <button type="button" className="w-full" onClick={() => setOpenDadosBancarios(!openDadosBancarios)}>
                                <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                    <div className="flex items-center gap-2">
                                        <FiMenu size={24} />
                                        <p className="text-lg">Dados Bancários</p>
                                    </div>

                                    <Icon open={openDadosBancarios} />
                                </div>
                            </button>

                            <div className={`w-full  border-[1px]  border-verde rounded-b-md transition-all duration-1000 px-6 py-4 ${openDadosBancarios === true ? 'h-full sm:h-[210px] opacity-100' : 'opacity-0 hidden h-0'}`}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].banco : null} name='banco' label={<p className="font-bold text-base">Banco</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].agencia : null} name='agencia' label={<p className="font-bold text-base">Agência</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].conta : null} name='conta' label={<p className="font-bold text-base">Conta</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].operacao : null} name='operacao' label={<p className="font-bold text-base">Operação</p>}>
                                        <Input />
                                    </Form.Item>


                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].tipoConta : null} name='tipoConta' label={<p className="font-bold text-base">Tipo de Conta</p>}>
                                        <Select options={[{ label: 'Corrente', value: 'CORRENTE' }, { label: 'Poupança', value: 'POUPANCA' }]} />
                                    </Form.Item>
                                    <div>
                                        <p className="font-bold text-base">CPF/CNPJ da Conta</p>
                                        <input placeholder="cpf ou cnpj " value={cpfCnpjBancario} onChange={handleCPFCNPJBancarioChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].chavePix : null} name='chavePix' className="col-span-2" label={<p className="font-bold text-base">Chave PIX</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item initialValue={cliente.financeiro[0] ? cliente.financeiro[0].tipoChavePix : null} name='tipoChavePix' label={<p className="font-bold text-base">Tipo de chave PIX</p>}>
                                        <Select
                                            options={[
                                                { label: 'CPF', value: 'CPF' },
                                                { label: 'CNPJ', value: 'CNPJ' },
                                                { label: 'E-mail', value: 'EMAIL' },
                                                { label: 'Telefone', value: 'TELEFONE' },
                                                { label: 'Chave Aleatória', value: 'CHAVE_ALEATORIA' }
                                            ]}
                                        />
                                    </Form.Item>
                                </div>
                            </div>


                        </div>
                        <div className="flex justify-center gap-4 pb-4 mt-8">
                            {profile && profile.perfil && profile?.perfil?.permissoesPerfis.filter((modulo) => {
                                if (modulo.nome === 'Clientes') {
                                    const valor = modulo.permissoes.filter((permissao) => {
                                        if (permissao.nome === 'Atualizar Cliente') {
                                            return true
                                        }
                                    })
                                    if (valor.length > 0) {
                                        return true
                                    }
                                }
                            }).length > 0 || profile?.role === 'ROOT' || profile?.role === 'DONO'
                                ?
                                <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                                    Salvar
                                </button>
                                :
                                <div></div>
                            }
                            {profile && profile.perfil && profile?.perfil?.permissoesPerfis.filter((modulo) => {
                                if (modulo.nome === 'Clientes') {
                                    const valor = modulo.permissoes.filter((permissao) => {
                                        if (permissao.nome === 'Deletar Cliente') {
                                            return true
                                        }
                                    })
                                    if (valor.length > 0) {
                                        return true
                                    }
                                }
                            }).length > 0 || profile?.role === 'ROOT' || profile?.role === 'DONO'
                                ?
                                <button type="button" onClick={() => setOpenExcluir(true)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                                    Excluir Cliente
                                </button>
                                :
                                <div></div>
                            }
                        </div>
                    </div >


                </Form >
                :
                <></>
            }
        </>




    )
}