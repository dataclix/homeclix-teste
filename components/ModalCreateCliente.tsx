import { atualizarAtom, openCreateClienteAtom } from "@/pages/painel-administrativo/clientes";
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
export default function ModalCreateCliente() {
    const [open, setOpen] = useAtom(openCreateClienteAtom)
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
    const [profile, setProfile] = useState<UsuarioGlobal>()
    useEffect(() => {
        api.get('localidades/estados').then((resposta) => {
            setEstados(resposta.data)
        })
        api.get('usuarios/profile').then((resposta) => {

            setProfile(resposta.data)
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
                    email: values.email,
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
                api.post('clientes', saida).then((resposta) => {

                    api.post('clientes/financeiro', {
                        idCliente: resposta.data.id,
                        banco: values.banco,
                        agencia: values.agencia,
                        operacao: values.operacao,
                        conta: values.conta,
                        tipoConta: values.tipoConta,
                        cpfcnpjConta: cpfCnpjBancario,
                        tipoChavePix: values.tipoChavePix,
                        chavePix: values.chavePix
                    }).then((resposta) => {
                        toast.success('Cliente criado com sucesso!')
                        setOpen(false)
                        setAtualizar(!atualizar)
                    })
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

    return (
        <Modal centered width={1000} open={open} onCancel={() => setOpen(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Criar cliente</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="h-[520px] overflow-y-auto custom-scrollbar">
                    <div className="px-2">


                        <div className="w-full  px-6 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Form.Item rules={[{ required: true, message: 'Por favor insira o nome do cliente!' }]} name='nome' className="col-span-2" label={<p className="font-bold text-base">Nome</p>}>
                                    <Input required />
                                </Form.Item>
                                <Form.Item  rules={[ { type: 'email', message: 'E-mail invalido!' }]} name='email' className="col-span-2" label={<p className="font-bold text-base">E-mail</p>}>
                                    <Input />
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
                                <Form.Item rules={[{ required: true, message: 'Por favor insira o tipo de pessoa' }]} name='tipoPessoa' label={<p className="font-bold text-base">Tipo de Pessoa</p>}>
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
                                <Form.Item name='dataNascimento' label={<p className="font-bold text-base">Data de Nascimento</p>}>
                                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                                </Form.Item>
                                <Form.Item name='identidade' label={<p className="font-bold text-base">Identidade</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='dataExpedicao' label={<p className="font-bold text-base">Identidade(D. Expedição)</p>}>
                                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                                </Form.Item>
                                <Form.Item name='orgaoEmissor' label={<p className="font-bold text-base">Identidade(Orgão Emissor)</p>}>
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                                <Form.Item name='profissao' className="col-span-2" label={<p className="font-bold text-base">Profissão</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='estadoCivil' label={<p className="font-bold text-base">Estado Civil</p>}>
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
                                <Form.Item name='nacionalidade' label={<p className="font-bold text-base">Nacionalidade</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='nomePai' className="col-span-2" label={<p className="font-bold text-base">Nome do pai</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='nomeMae' className="col-span-2" label={<p className="font-bold text-base">Nome do mãe</p>}>
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
                                <Form.Item name='logradouro' className="col-span-2" label={<p className="font-bold text-base">Logradouro</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numero' label={<p className="font-bold text-base">Número</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='complemento' label={<p className="font-bold text-base">Complemento</p>}>
                                    <Input />
                                </Form.Item>
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
                                <Form.Item name='nomeConjuge' className="col-span-2" label={<p className="font-bold text-base">Nome</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item rules={[{ type: 'email', message: 'Email Invalido!' }]} name='emailConjuge' className="col-span-2" label={<p className="font-bold text-base">E-mail</p>}>
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
                                <Form.Item label={<p className="font-bold text-base">Data de Nascimento</p>}>
                                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                                </Form.Item>

                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Form.Item name='identidadeConjuge' label={<p className="font-bold text-base">Identidade</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='dataExpedicaoConjuge' label={<p className="font-bold text-base">Identidade(D. Expedição)</p>}>
                                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                                </Form.Item>
                                <Form.Item name='orgaoEmissorConjuge' label={<p className="font-bold text-base">Identidade(Orgão Emissor)</p>}>
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">



                                <Form.Item name='profissaoConjuge' className="col-span-2" label={<p className="font-bold text-base">Profissão</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='nacionalidadeConjuge' className="col-span-2" label={<p className="font-bold text-base">Nacionalidade</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='nomePaiConjuge' className="col-span-2" label={<p className="font-bold text-base">Nome do pai</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='nomeMaeConjuge' className="col-span-2" label={<p className="font-bold text-base">Nome do mãe</p>}>
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
                                <Form.Item name='logradouroConjuge' className="col-span-2" label={<p className="font-bold text-base">Logradouro</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numeroConjuge' label={<p className="font-bold text-base">Número</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='complementoConjuge' label={<p className="font-bold text-base">Complemento</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='estadoConjuge' label={<p className="font-bold text-base">Estado</p>}>
                                    <Select onChange={(e, option) => onChangeEstadoConjuge(e, option)} options={optionsEstado} showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })} />
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
                                <Form.Item name='bairroConjuge' label={<p className="font-bold text-base">Bairro</p>}>
                                    <Select
                                        disabled={estadoConjuge === undefined || cidadeConjuge === undefined ? true : false}
                                        options={optionsBairroConjuge}
                                        onChange={(e, option) => onChangeBairroConjuge(e, option)}
                                        showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>


                            </div>
                        </div>



                    </div>
                    {profile && profile.perfil && profile?.perfil?.permissoesPerfis.filter((modulo) => {
                        if (modulo.nome === 'Financeiro Clientes') {
                            const valor = modulo.permissoes.filter((permissao) => {
                                if (permissao.nome === 'Cadastrar Financeiro Cliente') {
                                    return true
                                }
                            })
                            if (valor.length > 0) {
                                return true
                            }
                        }
                    }).length > 0 || profile?.role === 'ROOT' || profile?.role === 'DONO'
                        ?
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
                                    <Form.Item name='banco' label={<p className="font-bold text-base">Banco</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='agencia' label={<p className="font-bold text-base">Agência</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='conta' label={<p className="font-bold text-base">Conta</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='operacao' label={<p className="font-bold text-base">Operação</p>}>
                                        <Input />
                                    </Form.Item>


                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <Form.Item name='tipoConta' label={<p className="font-bold text-base">Tipo de Conta</p>}>
                                        <Select options={[{ label: 'Corrente', value: 'CORRENTE' }, { label: 'Poupança', value: 'POUPANCA' }]} />
                                    </Form.Item>
                                    <div>
                                        <p className="font-bold text-base">CPF/CNPJ da Conta</p>
                                        <input placeholder="cpf ou cnpj " value={cpfCnpjBancario} onChange={handleCPFCNPJBancarioChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                    </div>
                                    <Form.Item name='chavePix' className="col-span-2" label={<p className="font-bold text-base">Chave PIX</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='tipoChavePix' label={<p className="font-bold text-base">Tipo de chave PIX</p>}>
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
                        :
                        <div></div>
                    }
                </div>
                <div className="flex justify-center gap-4 pb-2 mt-4">
                    <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                        Criar Cliente
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                        Cancelar
                    </button>
                </div>

            </Form>


        </Modal>
    )
}