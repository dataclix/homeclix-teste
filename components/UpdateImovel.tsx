import { formatCEP } from "@/global/TratamentoDeDados";
import { removeAccents } from "@/global/TratamentosDeStrings";
import { atualizarImovelAtom, atualizarUpdateImovelAtom, imovelIdAtom, openCreateImovelAtom } from "@/pages/painel-administrativo";
import { api } from "@/services/apiClient";
import { Checkbox, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, SelectProps, Switch, Tooltip } from "antd";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineFileText, AiOutlinePlusCircle } from "react-icons/ai";
import { FaLocationDot, FaTags } from "react-icons/fa6";
const ReactQuill = dynamic(import("react-quill"), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { IoMdClose } from "react-icons/io";
import { RiHomeGearFill, RiInformationFill } from "react-icons/ri";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { BiImageAdd } from "react-icons/bi";
import { CiCirclePlus } from "react-icons/ci";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ListManager } from "react-beautiful-dnd-grid";
import { MdClose, MdVideoLibrary } from "react-icons/md";
import LoadingScreen from "./LoadingScreen";
import { FaEdit, FaCloudDownloadAlt } from "react-icons/fa";
import UniversalFileViewer from "./UniversalFileViewer";
import UpdateDocumento from "./UpdateDocumento";
import _ from "lodash";
import moment from "moment";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
interface Icon {
    open: boolean
}
interface Estado {
    id: number;
    nome: string
    sigla?: string
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
interface Cliente {
    id: string
    nome: string
    email?: string
    telefone?: string
    celular?: string
    cpfCnpj?: string
    tipoPessoa?: string
}
interface Categoria {
    id: string
    nome: string
    cor?: string
}
interface Tipo {
    id: string
    nome: string
}
interface SubTipo {
    id: string
    nome: string
}
interface Captador {
    id: string
    nome: string
}
interface Filial {
    id: string
    nome: string
}
interface Atributo {
    id: string
    nome: string
}
interface CaptadorSaida {
    captador: string
    isPrincipal?: boolean
}
interface Imagem {
    id: string
    arquivo: string
}
interface CaptadarEntrada {
    isPrincipal: boolean
    captador: Captador
}
interface Dimob {
    id: number
    nome: string
    estado: Estado
}
interface AtributoEntrada {
    atributo: Atributo
}
interface Video {
    id: string
    tipo?: string
    link: string
    arquivo?: string
}
interface Documento {
    id: string
    nome: string
    descricao: string
    arquivo: string
    fileType: string
}
interface Entrada {
    id: string
    idInterno: string
    permuta: boolean
    createdAt: Date
    estado: Estado
    cidade: Cidade
    bairro: Bairro
    numero: string
    complemento: string
    cep: string
    logradouro: string
    referencia: string
    valor: number
    comissaoPorcentagem: number
    comissaoValor: number
    areaTerreno: string
    areaConstruida: string
    testada: string
    ladoEsquerdo: string
    ladoDireito: string
    fundos: string
    observacoes: string
    descricao: string
    restricoes: string
    destaque: boolean
    quartos: number
    banheiros: number
    garagens: number
    camas: number
    situacaoDocumentacao: string
    exibirDetalhesEnderecoSite: boolean
    parceria: boolean
    filial: Cidade
    olx: boolean
    chave: boolean
    placa: boolean
    terra: boolean
    mostrarIptu: boolean
    mostrarCondominio: boolean
    valorIptu: number
    valorCondominio: number
    numeroIptu: string
    numeroMatricula: string
    numeroContaAgua: string
    numeroClienteEnergia: string
    numeroInstalacaoEnergia: string
    tipo: Tipo
    subtipo: SubTipo
    atributos: AtributoEntrada[]
    categoria: Categoria
    modalidade: string
    cliente: Cliente
    captadores: CaptadarEntrada[]
    documentos: Documento[],
    imagens: Imagem[]
    videos: Video[],
    status: string
    cidadeDimob: Dimob
}
interface Saida {
    idInterno: string
    permuta: boolean
    idTipo: number | null
    idSubtipo: number | null
    idCategoria: string | null
    idCliente: string | null
    modalidade: string
    titulo?: string
    idEstado: number | null
    idCidade: number | null
    idCidadeDimob: number | null
    idFilial: number | null
    idBairro: number | null
    status: string
    numero: string
    complemento: string
    cep: string | null
    logradouro: string
    referencia: string
    valor: number
    comissaoPorcentagem: number | null
    comissaoValor: number | null
    areaTerreno: string
    areaConstruida: string
    testada: string
    ladoEsquerdo: string
    ladoDireito: string
    fundos: string
    quartos: number
    banheiros: number
    garagens: number
    camas: number
    observacoes: string
    descricao: string
    restricoes: string
    situacaoDocumentacao: string
    parceria: boolean
    exibirDetalhesEnderecoSite: boolean
    posicao: string
    destaque: boolean
    chave: boolean
    placa: boolean
    terra: boolean
    olx: boolean
    mostrarIptu: boolean
    exclusivo: boolean
    mostrarCondominio: boolean
    valorIptu: number | null
    valorCondominio: number | null
    numeroIptu: string
    numeroMatricula: string
    numeroContaAgua: string
    numeroClienteEnergia: string
    numeroInstalacaoEnergia: string
    atributos: string[]
    captadores: CaptadorSaida[]
}
interface ImagemPreview {
    src?: Blob
    nomeOriginal: string
    caminho: string
}
interface Preview {
    id: number
    item: ImagemPreview[]
}
interface PreviewDocument {
    src: string;
    nome: string;
    type: string;
}

export const idMaterialUpdateAtom = atom('')
export const openUpdateDocumentoAtom = atom(false)
export const atualizarVideoAtom = atom(false)
export default function UpdateImovel() {
    const [open, setOpen] = useAtom(openCreateImovelAtom)
    const [form] = Form.useForm();

    const [openCaracteristicaImovel, setOpenCaracteristicaImovel] = useState<boolean>(true)
    const [openInformacaoBasica, setOpenInformacaoBasica] = useState<boolean>(true)
    const [openInformacaoVenda, setOpenInformacaoVenda] = useState<boolean>(true)
    const [openInformacaoAdicional, setOpenInformacaoAdicional] = useState<boolean>(true)
    const [openImagem, setOpenImagem] = useState<boolean>(true)
    const [openDocumento, setOpenDocumento] = useState<boolean>(true)
    const [openVideo, setOpenVideo] = useState<boolean>(true)
    const [openLocalizacao, setOpenLocalizacao] = useState<boolean>(true)
    const [atualizarVideo, setAtualizarVideo] = useAtom(atualizarVideoAtom)
    const [tipos, setTipos] = useState<Tipo[]>([])
    const [tipo, setTipo] = useState<Tipo>()
    const [subTipos, setSubTipos] = useState<SubTipo[]>([])
    const [subTipo, setSubTipo] = useState<SubTipo>()
    const [tipoNull, setTipoNull] = useState<boolean>(true)
    function onChangeTipo(e: string, option: any) {
        setTipoNull(false)
        setTipo({
            id: option.id,
            nome: option.label,
        })

        form.setFieldsValue({
            subTipo: undefined
        })
        api.get('tipos/subtipos/' + option.id).then((resposta) => {

            setSubTipos(resposta.data)
            if (resposta.data.length === 0) {
                form.setFieldsValue({
                    subTipo: option.label
                })
                setTipoNull(true)
            }
        })

    }
    function onChangeSubTipo(e: string, option: any) {
        setSubTipo({
            id: option.id,
            nome: option.label,
        })
    }

    const optionsSubTipos: SelectProps['options'] = subTipos?.map(subTipo => ({
        label: subTipo.nome,
        value: subTipo.nome,
        id: subTipo.id
    })) || [];

    const optionsTipos: SelectProps['options'] = tipos?.map(tipo => ({
        label: tipo.nome,
        value: tipo.nome,
        id: tipo.id
    })) || [];


    const [clientes, setClientes] = useState<Cliente[]>([])
    const [cliente, setCliente] = useState<Cliente>()

    function onChangeCliente(e: string, option: any) {
        console.log(e)

        setCliente({
            id: option.id,
            nome: option.label,
        })
    }
    const [value, setValue] = useState<string>('')
    const [controle, setControle] = useState<boolean>(false)
    function onChangeSearchCliente(e: string) {
        setValue(e)
    }
    const debouncedSearch = useCallback(
        _.debounce((value) => {
            setValue(value)
            setControle((prevControle) => !prevControle);
        }, 300),
        []
    );
    useEffect(() => {
        api.post('clientes/filtrar/palavra', { palavra: value }).then((resposta) => {
            setClientes(resposta.data)
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }, [controle]);
    useEffect(() => {
        debouncedSearch(value);
        // Cancel debounce on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [value, debouncedSearch]);

    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [categoria, setCategoria] = useState<Categoria | null>()

    function onChangeCategoria(e: string, option: any) {
        if(option){
            setCategoria({
                id: option.id,
                nome: option.label,
            })
        }else{
            setCategoria(null)
        }
        
    }
    const optionsCategorias: SelectProps['options'] = categorias?.map(categoria => ({
        label: categoria.nome,
        value: categoria.nome,
        id: categoria.id
    })) || [];

    const [cep, setCep] = useState<string | null>('')
    function handleCepChange(event: React.ChangeEvent<HTMLInputElement>) {
        const formattedCEP = formatCEP(event.target.value);
        setCep(formattedCEP);
    };

    const [estados, setEstados] = useState<Estado[]>([])
    useEffect(() => {
        api.get('localidades/estados').then((resposta) => {
            setEstados(resposta.data)
        })
        api.get('categorias/all').then((resposta) => {
            setCategorias(resposta.data)
        })
        api.get('tipos/all').then((resposta: any) => {
            setTipos(resposta.data)
        })
        api.get('usuarios/captadores').then((resposta) => {
            setCaptadores(resposta.data)
        })
        api.get('filiais/all').then((resposta) => {
            setFiliais(resposta.data)
        })
        api.get('atributos/all').then((resposta) => {
            setAtributos(resposta.data)
        })
    }, [])


    const [imovelId, setImovelId] = useAtom(imovelIdAtom)
    const [imovel, setImovel] = useState<Entrada>()

    useEffect(() => {
        if (imovelId !== '') {

            api.get('imoveis/' + imovelId).then((resposta) => {
                setImovel(resposta.data)
                setTipo(resposta.data.tipo)
                setSubTipo(resposta.data.subtipo)
                setCliente(resposta.data.cliente)
                setCategoria(resposta.data.categoria)
                setChecked(resposta.data.status)
                const fotos: Preview[] = [] as Preview[]
                let i = 0
                while (i < resposta.data.imagens.length) {
                    const imagens: ImagemPreview[] = [] as ImagemPreview[]
                    for (let j = 0; j < 4; j++) {
                        if (resposta.data.imagens[i]) {
                            imagens.push({
                                nomeOriginal: resposta.data.imagens[i].nomeOriginal,
                                caminho: resposta.data.imagens[i].arquivo
                            })
                            i++
                        } else {
                            j = 4
                        }

                    }
                    fotos.push({ id: fotos.length, item: imagens })
                }
                if (resposta.data.cliente) {
                    api.post('clientes/filtrar/palavra', { palavra: resposta.data.cliente.nome }).then((resposta) => {
                        setClientes(resposta.data)
                    })
                }

                setPreview(fotos)
                setCep(resposta.data.cep)
                setAtributosSaida(resposta.data.atributos.map((atributo: AtributoEntrada) => {
                    return {
                        id: atributo.atributo.id,
                        nome: atributo.atributo.nome,
                    }
                }))
                setValor(resposta.data.valor)
                setComissaoPocentagem(resposta.data.comissaoPorcentagem)
                setComissaoValor(resposta.data.comissaoValor)

                setIptu(resposta.data.valorIptu)
                setCondominio(resposta.data.valorCondominio)

                setDescricao(resposta.data.descricao)
                setRestricao(resposta.data.restricoes)
                setFilial(resposta.data.filial)
                if (resposta.data.captadores.length > 0) {
                    setCaptador(resposta.data.captadores[0].captador)
                }

                if (resposta.data.captadores[1]) {
                    setCaptadorSecundario(resposta.data.captadores[1].captador)
                }
                if (resposta.data.subtipo) {
                    setTipoNull(false)
                }
                if (resposta.data.cidadeDimob) {
                    setEstadoDimob(resposta.data.cidadeDimob.estado)
                    setCidadeDimob({ id: resposta.data.cidadeDimob.id, nome: resposta.data.cidadeDimob.nome })
                    api.get('localidades/estados/' + resposta.data.cidadeDimob.estado.id + '/cidades').then((resposta) => {
                        setCidadesDimob(resposta.data)

                    })
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
                console.log()
                form.setFieldsValue({
                    idInterno: resposta.data.idInterno,
                    permuta: resposta.data.permuta,
                    modalidade: resposta.data.modalidade,
                    tipo: resposta.data.tipo ? resposta.data.tipo.nome : null,
                    subTipo: resposta.data.subtipo ? resposta.data.subtipo.nome : resposta.data.tipo ? resposta.data.tipo.nome : null,
                    cliente: resposta.data.cliente ? resposta.data.cliente.nome + ' - ' + resposta.data.cliente.celular : null,
                    categoria: resposta.data.categoria ? resposta.data.categoria.nome : null,

                    logradouro: resposta.data.logradouro,
                    numero: resposta.data.numero,
                    complemento: resposta.data.complemento,
                    estado: resposta.data.estado ? resposta.data.estado.nome : null,
                    cidade: resposta.data.cidade ? resposta.data.cidade.nome : null,
                    bairro: resposta.data.bairro ? resposta.data.bairro.nome : null,
                    referencia: resposta.data.referencia,
                    estado_dimob: resposta.data.cidadeDimob ? resposta.data.cidadeDimob.estado.nome : null,
                    cidade_dimob: resposta.data.cidadeDimob ? resposta.data.cidadeDimob.nome : null,
                    exibirDetalhesEnderecoSite: resposta.data.exibirDetalhesEnderecoSite,

                    areaTerreno: resposta.data.areaTerreno,
                    testada: resposta.data.testada,
                    areaConstruida: resposta.data.areaConstruida,
                    ladoEsquerdo: resposta.data.ladoEsquerdo,
                    ladoDireito: resposta.data.ladoDireito,
                    fundos: resposta.data.fundos,
                    posicao: resposta.data.posicao,
                    quartos: resposta.data.quartos,
                    banheiros: resposta.data.banheiros,
                    garagens: resposta.data.garagens,
                    camas: resposta.data.camas,
                    atributos: resposta.data.atributos.map((atributo: AtributoEntrada) => {
                        return atributo.atributo.nome
                    }),

                    captador_principal: resposta.data.captadores.length > 0 ? resposta.data.captadores[0].captador.nome : null,
                    captador_secundario: resposta.data.captadores[1] ? resposta.data.captadores[1].captador.nome : null,
                    filial: resposta.data.filial ? resposta.data.filial.nome : null,
                    mostrar_iptu: resposta.data.mostrarIptu,
                    mostrar_condominio: resposta.data.mostrarCondominio,
                    comissaoPorcentagem: resposta.data.comissaoPorcentagem,

                    numeroIptu: resposta.data.numeroIptu,
                    numeroMatricula: resposta.data.numeroMatricula,
                    numeroContaAgua: resposta.data.numeroContaAgua,
                    numeroClienteCemig: resposta.data.numeroClienteEnergia,
                    numeroInstalacaoEnergia: resposta.data.numeroInstalacaoEnergia,
                    destaque: resposta.data.destaque,
                    chave: resposta.data.chave,
                    exclusivo: resposta.data.exclusivo,
                    parceria: resposta.data.parceria,
                    placa: resposta.data.placa,
                    olx: resposta.data.olx,
                    terra: resposta.data.terra,
                    observacoes: resposta.data.observacoes,
                    situacaoDocumentacao: resposta.data.situacaoDocumentacao

                })

            })
        }

    }, [imovelId, atualizarVideo])

    const optionsClientes: SelectProps['options'] = clientes?.map(cliente => ({
        label: cliente.nome + ' - ' + cliente.celular,
        value: cliente.id,
        id: cliente.id
    })) || [];

    function onChangeEstado(e: string, option: any) {
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

    const optionsEstado: SelectProps['options'] = estados?.map(estado => ({
        label: estado.nome,
        value: estado.nome,
        id: estado.id
    })) || [];


    const [cidades, setCidades] = useState<Cidade[]>([])

    function onChangeCidade(e: string, option: any) {
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

    const optionsCidade: SelectProps['options'] = cidades?.map(cidade => ({
        label: cidade.nome,
        value: cidade.nome,
        id: cidade.id
    })) || [];

    const [cidadesDimob, setCidadesDimob] = useState<Cidade[]>([])
    const [cidadeDimob, setCidadeDimob] = useState<Cidade>()
    const [estadoDimob, setEstadoDimob] = useState<Estado>()
    function onChangeEstadoDimob(e: string, option: any) {
        setEstadoDimob({
            id: option.id,
            nome: option.label,
            sigla: option.value
        })
        form.setFieldsValue({
            cidade_dimob: undefined,

        })
        setCidadeDimob(undefined)
        api.get('localidades/estados/' + option.id + '/cidades').then((resposta) => {
            setCidadesDimob(resposta.data)
        })
    }
    function onChangeCidadeDimob(e: string, option: any) {
        setCidadeDimob({
            id: option.id,
            nome: option.label,
        })

    }

    const optionsCidadeDimob: SelectProps['options'] = cidadesDimob?.map(cidade => ({
        label: cidade.nome,
        value: cidade.nome,
        id: cidade.id
    })) || [];



    const [bairros, setBairros] = useState<Bairro[]>([])

    function onChangeBairro(e: string, option: any) {
        setBairro({
            id: option.id,
            nome: option.label,
        })
    }
    const optionsBairro: SelectProps['options'] = bairros?.map(bairro => ({
        label: bairro.nome,
        value: bairro.nome,
        id: bairro.id
    })) || [];
    const [estado, setEstado] = useState<Estado>()
    const [cidade, setCidade] = useState<Cidade>()
    const [bairro, setBairro] = useState<Bairro>()

    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) {
            return false; // ou true, dependendo do seu requisito para opções indefinidas
        }

        const optionLabel = removeAccents(option.label);
        return optionLabel.toLowerCase().includes(removeAccents(input.toLowerCase()));
    };
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
    const formatter = (value: any) => {
        if (!value) return '';
        return `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parser = (value: any) => {
        if (!value) return '';
        return value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.');
    };


    const [valor, setValor] = useState<number | null>()
    const onChangeValor = (value: number | null) => {
        setValor(value);
        console.log(value)
        if (comissaoPocentagem && comissaoPocentagem === -1) {

        }
        else if (value) {
            if (comissaoPocentagem) {

                setComissaoValor((value / 100) * comissaoPocentagem)
                form.setFieldsValue({
                    comissaoValor: (value / 100) * comissaoPocentagem
                })
            }
        } else {
            setComissaoValor(0)
            form.setFieldsValue({
                comissaoValor: 0
            })
        }
    };

    const [comissaoPocentagem, setComissaoPocentagem] = useState<number | null>()

    const onChangeComissaoPorcentagem = (value: number | null) => {

        setComissaoPocentagem(value === null ? null : value);
        if (valor && value && value !== -1) {

            console.log((valor / 100) * value)

            setComissaoValor((valor / 100) * value)
            form.setFieldsValue({
                comissaoValor: (valor / 100) * value
            })
        } else {
            setComissaoValor(0)
            form.setFieldsValue({
                comissaoValor: 0
            })
        }
    };
    const [comissaoValor, setComissaoValor] = useState<number | null>()
    const onChangeComisaoValor = (value: number | null) => {
        setComissaoValor(value);

    };

    const [iptu, setIptu] = useState<number | null>()
    const onChangeIptu = (value: number | null) => {
        setIptu(value);
    };


    const [condominio, setCondominio] = useState<number | null>()
    const onChangeCondominio = (value: number | null) => {
        setCondominio(value);
    };
    const [captadores, setCaptadores] = useState<Captador[]>([])
    const [captador, setCaptador] = useState<Captador>()
    const [captadorSecundario, setCaptadorSecundario] = useState<Captador>()

    const optionsCaptador: SelectProps['options'] = captadores?.map(captador => ({
        label: captador.nome,
        value: captador.nome,
        id: captador.id
    })) || [];

    function onChangeCaptadorPrincipal(e: string, option: any) {
        setCaptador({
            id: option.id,
            nome: option.label,
        })
    }

    function onChangeCaptadorSecundario(e: string, option: any) {
        setCaptadorSecundario({
            id: option.id,
            nome: option.label,
        })
    }

    const [filiais, setFiliais] = useState<Filial[]>([])
    const [filial, setFilial] = useState<Filial>()
    const optionsFiliais: SelectProps['options'] = filiais?.map(filial => ({
        label: filial.nome,
        value: filial.nome,
        id: filial.id
    })) || [];

    function onChangeFilial(e: string, option: any) {
        setFilial({
            id: option.id,
            nome: option.label,
        })
    }

    const [descricao, setDescricao] = useState<string>('')
    const onChangeDescricao = (e: string) => {

        setDescricao(e)

    }

    const [restricao, setRestricao] = useState<string>('')
    const onChangeRestricao = (e: string) => {
        setRestricao(e)

    }
    const [checked, setChecked] = useState<string>('ATIVO')
    function changeStatus(e: boolean) {

        if (e === false) {

            setChecked('INATIVO')


        } else {

            setChecked('ATIVO')

        }
    }
    const [atributos, setAtributos] = useState<Atributo[]>([])
    const [atributosSaida, setAtributosSaida] = useState<Atributo[]>([])
    function onChangeAtributo(e: string[], option: any) {
        setAtributosSaida(option.map((valor: any) => {
            return {
                id: valor.id,
                nome: valor.label
            }
        }))
    }
    const optionsAtributos: SelectProps['options'] = atributos?.map(atributo => ({
        label: atributo.nome,
        value: atributo.nome,
        id: atributo.id
    })) || [];
    const [atualizar, setAtualizar] = useAtom(atualizarUpdateImovelAtom)
    const [atualizarTotal, setAtualizarTotal] = useAtom(atualizarImovelAtom)
    const onFinish = (values: any) => {

        const saida: Saida = {
            idInterno: values.idInterno.toString(),
            permuta: values.permuta,
            modalidade: values.modalidade,
            idTipo: tipo ? parseInt(tipo.id) : null,
            idSubtipo: (subTipo && tipoNull === false) ? parseInt(subTipo.id) : null,
            idCliente: cliente ? cliente.id : null,
            idCategoria: categoria ? categoria.id : null,
            status: checked,

            cep: cep,
            logradouro: values.logradouro,
            numero: values.numero,
            complemento: values.complemento,
            idBairro: bairro ? bairro.id : null,
            idCidade: cidade ? cidade.id : null,
            idEstado: estado ? estado.id : null,
            referencia: values.referencia,
            exibirDetalhesEnderecoSite: false,
            idCidadeDimob: cidadeDimob ? cidadeDimob.id : null,


            areaTerreno: values.areaTerreno,
            areaConstruida: values.areaConstruida,
            testada: values.testada,
            ladoEsquerdo: values.ladoEsquerdo,
            ladoDireito: values.ladoDireito,
            posicao: values.posicao,
            fundos: values.fundos,
            quartos: parseInt(values.quartos),
            banheiros: parseInt(values.banheiros),
            garagens: parseInt(values.garagens),
            camas: parseInt(values.camas),
            atributos: atributosSaida.map((valor) => valor.id).flat(),



            captadores: captadorSecundario ? [{ captador: captador ? captador.id : '', isPrincipal: true }, { captador: captadorSecundario.id }] : [{ captador: captador ? captador.id : '', isPrincipal: true }],
            idFilial: filial ? parseInt(filial.id) : null,
            valor: valor ? valor : 0,
            comissaoPorcentagem: comissaoPocentagem ? comissaoPocentagem : null,
            comissaoValor: comissaoValor ? comissaoValor : null,
            valorIptu: iptu ? iptu : null,
            mostrarIptu: values.mostrar_iptu,
            valorCondominio: condominio ? condominio : null,
            mostrarCondominio: values.mostrar_condominio,

            numeroIptu: values.numeroIptu,
            numeroMatricula: values.numeroMatricula,
            numeroContaAgua: values.numeroContaAgua,
            numeroClienteEnergia: values.numeroClienteCemig,
            numeroInstalacaoEnergia: values.numeroInstalacaoEnergia,
            destaque: values.destaque,
            chave: values.chave,
            exclusivo: values.exclusivo,
            parceria: values.parceria,
            placa: values.placa,
            olx: values.olx,
            terra: values.terra,
            observacoes: values.observacoes,
            situacaoDocumentacao: values.situacaoDocumentacao,
            descricao: descricao,
            restricoes: restricao,

        }

        const result = preview.map((img) => img.item.map((img) => img.nomeOriginal)).flat()
        const src = preview.map((img) => img.item.map((img) => img.src)).flat().filter(item => item !== undefined)
        const uploadImageDto = {
            imagensNomes: result,
            imagensPosicoes: result.map((img, index) => index)
        }
        api.patch('imoveis/' + imovel?.id, saida).then((resposta) => {
            const data = new FormData()
            src.forEach((file: any) => {
                if (file) {
                    data.append('files', file, file.name)
                }
            })
            data.append('uploadImageDto', JSON.stringify(uploadImageDto))
            api.post('imoveis/imagens/upload/' + imovel?.id, data).then((resposta) => {
                setAtualizar(!atualizar)
                toast.success("Imóvel atualizado com sucesso!")
            }).catch((err) => {console.log(err)})
        }).catch((resposta) => {
            console.log(resposta.response.status)
            if (resposta.response.status === 409) {
                toast.error('Código ja existe!')
            }
        })
    }

    const [preview, setPreview] = useState<Preview[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);


    const handleInputClick = (e: any) => {
        e.preventDefault();
        if (inputRef.current !== null) {
            inputRef.current.click();
        }
    };
    // handle Change
    const [converterImagem, setConverterImagem] = useState<boolean>(false)
    const [quantidade, setQuantidade] = useState<number>(0)
    const [total, setTotal] = useState<number>(0)
    const handleImgChange = async (e: any) => {
        const files = e.target.files;
        const dados: Preview[] = [...preview]; // Cria uma cópia dos previews existentes
        setConverterImagem(true)
        setTotal(files.length)
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setQuantidade(i + 1)
            // Configura opções para a conversão para WebP, sem alterar o tamanho da imagem
            const options = {
                maxSizeMB: 0, // Sem limite de tamanho
                maxWidthOrHeight: Infinity, // Sem limite de largura/altura
                useWebWorker: true,
                fileType: 'image/webp', // Tipo de arquivo desejado
            };

            try {
                // Comprime a imagem e converte para WebP
                const compressedFile = await imageCompression(file, options);

                const previewItem: ImagemPreview = {
                    src: compressedFile,
                    caminho: URL.createObjectURL(compressedFile),
                    nomeOriginal: file.name.replace(/\.[^/.]+$/, '') + '.webp' // Renomeia o arquivo para .webp
                };

                if (dados[dados.length - 1] && dados[dados.length - 1].item.length < 4) {
                    dados[dados.length - 1].item.push(previewItem);
                } else {
                    dados.push({
                        id: dados.length,
                        item: [previewItem]
                    });
                }

                setPreview([...dados]);
            } catch (error) {
                console.log('Erro ao comprimir a imagem:', error);
            }
        }
        setConverterImagem(false)
    };

    const onDragEnd = (result: any) => {
        const { source, destination } = result;
        console.log(source, destination)
        // If no destination or same position, do nothing
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const updatedRows = [...preview];
        const sourceRow = updatedRows.find(row => row.id === parseInt(source.droppableId));
        const destRow = updatedRows.find(row => row.id === parseInt(destination.droppableId));
        console.log(sourceRow, destRow)
        // Remove the dragged item from the source row
        if (sourceRow) {
            const draggedItem = sourceRow.item.splice(source.index, 1)[0];
            if (destRow) {
                destRow.item.splice(destination.index, 0, draggedItem);
            }
        }




        // Insert the dragged item into the destination row


        for (let i = 0; i < updatedRows.length; i++) {
            if (updatedRows[i].item.length < 4) {
                if (updatedRows[i + 1]) {
                    const lastItem = updatedRows[i + 1].item.shift();
                    if (lastItem) {
                        updatedRows[i].item.push(lastItem);
                    }
                }


            }
            if (updatedRows[i].item.length > 4) {
                const lastItem = updatedRows[i].item.pop();
                if (lastItem) {
                    updatedRows[i + 1].item.unshift(lastItem);
                } // Remove last item from destination row

            }
        }
        // Update state with the new rows configuration
        setPreview(updatedRows);
    };
    function deleteImagem(id: number, indexDelete: number) {
        if (preview[id]) {
            const valores = preview[id].item.filter((item, index) => index !== indexDelete)
            setPreview(prevValor => prevValor.map((item, index) => {
                if (index === id) {
                    return {
                        id: item.id,
                        item: valores
                    }
                } else {
                    return item
                }
            }))
        }
    }
    const getYouTubeVideoId = (url: string) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/|embed\/|v\/|e\/|shorts\/|playlist\?list=)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };
    const [openExcluir, setOpenExcluir] = useState<boolean>(false)
    function excluirCliente(id: string) {
        api.delete('imoveis/' + id).then(() => {
            toast.success('Imóvel Excluido com sucesso!')
            setAtualizarTotal(!atualizarTotal)
            setOpenExcluir(false)
        })
    }
    const onFinishFailed = (errorInfo: any) => {
        const { errorFields } = errorInfo;
        if (errorFields.length > 0) {
            form.scrollToField(errorFields[0].name[0], {
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    const onFinishAdicionarVideo = (values: any) => {
        console.log(values)

        if (imovel) {
            api.post('imoveis/videos/link', {
                idImovel: imovel.id,
                link: values.video
            }).then((resposta) => {
                toast.success('Vídeo adicionado com sucesso!')
                setAtualizarVideo(!atualizarVideo)
                setOpenAdicionarVideo(false)
            })
        }

    }
    function deleteVideo(id: string, link: string) {
        api.delete('imoveis/videos/' + id).then((resposta) => {
            toast.success('Vídeo removido com sucesso!')
            setAtualizarVideo(!atualizarVideo)
        })
    }
    const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>()
    const inputRefMaterial = useRef<HTMLInputElement | null>(null);
    const [src, setSrc] = useState<string | null>(null);

    const handleInputClickMaterial = (e: any) => {
        e.preventDefault();
        if (inputRefMaterial.current !== null) {
            inputRefMaterial.current.click();
        }
    };
    // handle Change
    const handleImgChangeMaterial = (e: any) => {
        const dados: Preview[] = preview
        if (e.target.files[0]) {
            if (e.target.files[0].size < 500 * 1024 * 1024) {
                setPreviewDocument({
                    nome: e.target.files[0].name,
                    src: URL.createObjectURL(e.target.files[0]),
                    type: e.target.files[0].type
                })
                setSrc(e.target.files[0]);
            } else {
                toast.error('Limite de tamanho de arquivo de 500mb !')
            }

        }

    }
    const onFinishCreateMaterial = (values: any) => {
        if (src) {
            setLoading(true)
            const documentos = {
                nome: values.material,
                descricao: values.descricao,
            }
            const data = new FormData()
            data.append('file', src)
            data.append('documentos', JSON.stringify(documentos))
            api.post('/imoveis/documentos/upload/' + imovel?.id, data).then((response) => {
                toast.success('Documento adicionado com sucesso!')
                setOpenCreateMaterial(false)
                setLoading(false)
                setAtualizarVideo(!atualizarVideo)
            })
        } else {
            toast.error('Por favor adicione um arquivo!')
        }
    }
    function splitAtLastDot(str: string) {
        const lastIndex = str.lastIndexOf('.');
        if (lastIndex === -1) {
            return [str];
        }
        const firstPart = str.substring(0, lastIndex);
        const secondPart = str.substring(lastIndex + 1);
        return [firstPart, secondPart];
    }
    function deleteImage() {
        setPreviewDocument(null)
        setSrc(null)
    }
    const onFinishDeleteMaterial = (values: any) => {
        api.delete('imoveis/documentos/' + idMaterial).then((resposta) => {
            setAtualizarVideo(!atualizarVideo)
            toast.success('Documento excluido com sucesso!')
            setOpenExcluirMaterial(false)
        })
    }
    const [avaliacao, setAvaliacao] = useState<boolean>(false)
    const [loadingGerar, setLoadingGerar] = useState<boolean>(false)
    const [idGerar, setIdGerar] = useState<string>('')
    const GerarDescricao = () => {
        setLoadingGerar(true)
        const dados = {
            tipo: form.getFieldValue('tipo') !== null ? form.getFieldValue('tipo') : undefined,
            subtipo: form.getFieldValue('subtipo') !== null ? form.getFieldValue('subtipo') : undefined,
            categoria: form.getFieldValue('categoria') !== null ? form.getFieldValue('categoria') : undefined,
            modalidade: form.getFieldValue('modalidade') !== null ? form.getFieldValue('modalidade') : undefined,
            estado: form.getFieldValue('estado') !== null ? form.getFieldValue('estado') : undefined,
            cidade: form.getFieldValue('cidade') !== null ? form.getFieldValue('cidade') : undefined,
            bairro: form.getFieldValue('bairro') !== null ? form.getFieldValue('bairro') : undefined,
            referencia: form.getFieldValue('referencia') !== null && form.getFieldValue('referencia') !== '' ? form.getFieldValue('referencia') : undefined,
            areaConstruida: form.getFieldValue('areaConstruida') !== null && form.getFieldValue('areaConstruida') !== '' ? form.getFieldValue('areaConstruida').toString() : null,
            areaTerreno: form.getFieldValue('areaTerreno') !== null && form.getFieldValue('areaTerreno') !== '' ? form.getFieldValue('areaTerreno').toString() : null,
            camas: form.getFieldValue('camas') !== null && form.getFieldValue('camas') !== 0 ? form.getFieldValue('camas') : undefined,
            valor: valor !== null && valor !== 0 ? valor : undefined,
            quartos: form.getFieldValue('quartos') !== null && form.getFieldValue('quartos') !== 0 ? form.getFieldValue('quartos') : undefined,
            banheiros: form.getFieldValue('banheiros') !== null && form.getFieldValue('banheiros') !== 0 ? form.getFieldValue('banheiros') : undefined,
            garagens: form.getFieldValue('garagens') !== null && form.getFieldValue('garagens') !== 0 ? form.getFieldValue('garagens') : undefined,
            atributos: form.getFieldValue('atributos') !== null && form.getFieldValue('atributos').length > 0 ? form.getFieldValue('atributos') : undefined
        }
        api.post('imoveis/gerar-descricao', dados).then((resposta) => {
            setDescricao(resposta.data.response)
            setAvaliacao(true)
            setIdGerar(resposta.data.id)
            setLoadingGerar(false)
            toast.success("Descrição gerada com sucesso!")
        }).catch((err) => {
            console.log(err)
        })
    }
    function Avaliar(valor: number) {
        api.post('/imoveis/avaliar-prompt', {
            idPrompt: idGerar,
            pontuacao: valor
        }).then((resposta) => {
            console.log(resposta.data)
            setAvaliacao(false)
            toast.success("Obrigado por avaliar a descrição gerada!")
        })
    }
    const [imageLinks, setImageLinks] = useState<any>([]);

    const handleEnderecoCompleto = () => {
        let logradouro = form.getFieldValue('logradouro');
        let numero = form.getFieldValue('numero');
        let complemento = form.getFieldValue('complemento');
        let bairro = form.getFieldValue('bairro');
        let cidade = form.getFieldValue('cidade');
        let estado = form.getFieldValue('estado');


        let endereco = logradouro + (numero !== null ? ", " + numero : '') + (complemento !== null ? ", " + complemento : '') + ", " + bairro + ", " + cidade + ", " + estado + ", CEP " + cep

        // Criar um elemento de texto temporário
        const textarea = document.createElement("textarea");
        textarea.value = endereco;

        // Adicionar o textarea ao documento
        document.body.appendChild(textarea);

        // Selecionar o texto do textarea
        textarea.select();
        textarea.setSelectionRange(0, 99999); // Para compatibilidade com dispositivos móveis

        // Copiar o texto para a área de transferência
        document.execCommand("copy");

        // Remover o textarea do documento
        document.body.removeChild(textarea);

        alert("Endereço copiado para a área de transferência!");
    }
    const handleDownloadImages = async () => {
        const zip = new JSZip();

        try {
            const resposta = await api.get(`website/imagens/${imovelId}`);
            setImageLinks(resposta.data); // Atualiza os links de imagem após o retorno da requisição
        } catch (error) {
            console.error('Erro ao buscar links de imagens:', error);
            return; // Interrompe o fluxo caso haja um erro
        }

        for (let i = 0; i < imageLinks.length; i++) {
            try {
                const imageUrl = imageLinks[i].arquivo;
                console.log('Baixando imagem:', imageUrl);

                const response = await fetch(imageUrl, { mode: 'cors' }); // Aguarda o download da imagem

                if (!response.ok) {
                    throw new Error(`Erro ao baixar imagem ${imageUrl}: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                const filename = `${i + 1}.webp`; // Ajuste a extensão se necessário
                zip.file(filename, blob);
            } catch (error) {
                console.error('Erro ao baixar imagem:', error);
            }
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.setAttribute('download', 'imagens.zip');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erro ao gerar arquivo ZIP:', error);
        }
    };


    const [openAdicionarVideo, setOpenAdicionarVideo] = useState<boolean>(false)
    const [openCreateMaterial, setOpenCreateMaterial] = useState<boolean>(false)
    const [openEditarMaterial, setOpenEditarMaterial] = useAtom(openUpdateDocumentoAtom)
    const [openExcluirMaterial, setOpenExcluirMaterial] = useState<boolean>(false)
    const [idMaterial, setIdMaterial] = useState<string>('')
    const [idMaterialUpdate, setIdMaterialUpdate] = useAtom(idMaterialUpdateAtom)
    const [loading, setLoading] = useState<boolean>(false)
    return (
        <div className="">
            <Modal open={openExcluir} centered onCancel={() => setOpenExcluir(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Excluir imóvel - {imovel?.idInterno}</p>} closeIcon={<IoMdClose size={24} color="white" className="" />} >
                <p className="py-4 px-6  text-lg">Tem certeza que quer excluir o imóvel: <span className="font-bold">{imovel?.idInterno}</span></p>
                <div className="flex justify-center gap-4 pb-4 mt-4">
                    <button onClick={() => excluirCliente(imovel ? imovel.id : '')} className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                        Excluir
                    </button>
                    <button type="button" onClick={() => setOpenExcluir(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                        Cancelar
                    </button>
                </div>
            </Modal>
            {openCreateMaterial === true && (
                <Modal width={1000} centered open={openCreateMaterial} onCancel={() => setOpenCreateMaterial(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Adicionar Documento</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
                    {loading === false ? <Form layout="vertical" className="px-10 mt-4" onFinish={onFinishCreateMaterial}>
                        <div className="grid grid-cols-5">
                            <div className="col-span-2 my-auto">
                                {previewDocument ? (
                                    <div className="my-auto mt-4">

                                        <div className="flex justify-center">
                                            <button type="button" onClick={handleInputClick} className="">
                                                {previewDocument.type.split('/')[0] === 'image'
                                                    ?
                                                    <Image src={previewDocument.src} className="rounded-md w-[300px]  mx-auto" />
                                                    :
                                                    previewDocument.type.split('/')[0] === 'video'
                                                        ?
                                                        <div>
                                                            <video src={previewDocument.src} />
                                                            <p className="font-bold  mt-1">{previewDocument.nome}</p>
                                                        </div>

                                                        :
                                                        <div>
                                                            <img src={'/images/tipos/' + splitAtLastDot(previewDocument.nome)[1] + '.png' ? '/images/tipos/' + splitAtLastDot(previewDocument.nome)[1] + '.png' : '/images/tipos/indefinido.png'} alt="" className="h-[200px] mx-auto" />
                                                            <p className="font-bold  mt-1">{previewDocument.nome}</p>
                                                        </div>

                                                }

                                            </button>
                                            {preview && (
                                                <div className="relative h-0 flex justify-center top-4 right-10 ">
                                                    <button type="button" onClick={() => deleteImage()}>
                                                        <IoMdClose size={32} className="text-red-500 bg-white rounded-full" />
                                                    </button>

                                                </div>
                                            )}
                                        </div>


                                        <input
                                            type="file"
                                            accept=""
                                            ref={inputRefMaterial}
                                            className="invisible h-0"
                                            onChange={handleImgChangeMaterial}
                                        />
                                    </div>
                                )
                                    :
                                    (
                                        <>
                                            <div className="flex justify-center items-center py-4 ">
                                                <button type="button" onClick={handleInputClick} className="">
                                                    <div className="border-[1px] border-azul-escuro-crm rounded-md w-[300px] h-[300px] flex justify-center items-center">
                                                        <div>
                                                            <CiCirclePlus className="mx-auto" size={32} />
                                                            <p className="mt-2 text-lg ">Adicionar Material</p>
                                                        </div>

                                                    </div>
                                                </button>

                                            </div>
                                            <input
                                                type="file"
                                                accept=""
                                                ref={inputRef}
                                                maxLength={10}
                                                className="invisible h-0"
                                                onChange={handleImgChangeMaterial}
                                            />
                                        </>

                                    )
                                }
                            </div>
                            <div className="col-span-3">
                                <Form.Item name='material' required rules={[{ required: true, message: "Por favor insira o nome do material" }]} label={<p className="font-bold text-md">Nome Material</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='descricao' label={<p className="font-bold text-md">Descrição</p>}>
                                    <Input.TextArea rows={4} showCount maxLength={100} />
                                </Form.Item>
                            </div>
                        </div>



                        <div className="flex justify-center gap-4 pb-4 mt-8">
                            <button className="w-40 shadow-md bg-verde text-white py-1.5 rounded-xl">
                                Adicionar Documento
                            </button>
                            <button type="button" onClick={() => setOpenCreateMaterial(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                                Cancelar
                            </button>
                        </div>
                    </Form>
                        :
                        <LoadingScreen heigth="500px" message="subindo arquivos" />
                    }

                </Modal>
            )}
            {openEditarMaterial === true && (
                <UpdateDocumento />
            )}

            {openAdicionarVideo === true && (
                <Modal open={openAdicionarVideo} centered onCancel={() => setOpenAdicionarVideo(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Adicionar Vídeo</p>} closeIcon={<IoMdClose size={24} color="white" className="" />} >
                    <Form layout="vertical" onFinish={onFinishAdicionarVideo} className="px-6 mt-4">
                        <Form.Item rules={[{ required: true, message: 'Por favor insira o link do vídeo' }]} name='video' label={<p className="font-bold text-base">Link do Vídeo</p>}>
                            <Input />
                        </Form.Item>
                        <div className="flex justify-center gap-4 pb-4 mt-4">
                            <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                                Adicionar
                            </button>
                            <button type="button" onClick={() => setOpenAdicionarVideo(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                                Cancelar
                            </button>
                        </div>
                    </Form>
                </Modal>
            )}

            < Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                <div className="h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar">
                    <div className="px-2 mt-2 ">
                        <button type="button" className="w-full" onClick={() => setOpenInformacaoBasica(!openInformacaoBasica)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <RiInformationFill size={24} />
                                    <p className="text-lg">Informações Básicas</p>
                                </div>

                                <Icon open={openInformacaoBasica} />
                            </div>
                        </button>

                        <div className={`w-full border-[1px]  border-verde rounded-b-md transition-all duration-1000 px-6  ${openInformacaoBasica === true ? 'h-full sm:h-[270px] opacity-100' : 'opacity-0 hidden h-0'}`}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 pt-4">
                                <Form.Item rules={[{ required: true, message: 'Por favor insira o código do imóvel' }]} name='idInterno' label={<p className="font-bold text-base">Código</p>}>
                                    <InputNumber className="w-full" type="number" />
                                </Form.Item>
                                <Form.Item rules={[{ required: true, message: 'Por favor insira a modalidade' }]} name='modalidade' label={<p className="font-bold text-base">Modalidade</p>}>
                                    <Select options={[{ label: 'Venda', value: 'VENDA' }, { label: 'Aluguel', value: 'ALUGUEL' }]} />
                                </Form.Item>
                                <Form.Item rules={[{ required: true, message: 'Por favor insira o tipo' }]} name='tipo' label={<p className="font-bold text-base">Tipo</p>}>
                                    <Select
                                        options={optionsTipos}
                                        onChange={(e, option) => onChangeTipo(e, option)}
                                    />
                                </Form.Item>
                                <Form.Item rules={[{ required: true, message: 'Por favor insira o subTipo' }]} name='subTipo' label={<p className="font-bold text-base">SubTipo</p>}>
                                    <Select disabled={(tipoNull === true) ? true : false} onChange={(e, option) => onChangeSubTipo(e, option)} options={optionsSubTipos} />
                                </Form.Item >

                            </div>
                            <div className="grid grid-cols-6 gap-x-4">
                                <Form.Item className="col-span-3" rules={[{ required: true, message: 'Por favor insira o proprietário' }]} name='cliente' label={<p className="font-bold text-base">Proprietário</p>}>
                                    <Select
                                        options={optionsClientes}
                                        showSearch
                                        onSearch={(e) => onChangeSearchCliente(e)}
                                        onChange={(e, option) => onChangeCliente(e, option)}
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <Form.Item className="col-span-2" name='categoria'  label={<p className="font-bold text-base">Categoria</p>}>
                                    <Select
                                        allowClear
                                        options={optionsCategorias}
                                        onChange={(e, option) => onChangeCategoria(e, option)}
                                        showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <div className="mt-1">
                                    <p className="font-bold text-base">Status</p>
                                    <Switch
                                        className="mt-2 w-full"
                                        checked={checked === 'ATIVO'}
                                        onChange={(e) => changeStatus(e)}
                                        checkedChildren={<p className="text-md font-bold">ATIVO</p>}
                                        unCheckedChildren={<p className="text-md font-bold">INATIVO</p>}
                                    />
                                </div>

                            </div>
                            <div className="grid  grid-cols-3 sm:grid-cols-4 gap-x-4">
                                <Form.Item name='olx' initialValue={false} valuePropName="checked" label={<p className="font-bold text-sm">OLX</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                                <Form.Item name='terra' initialValue={true} valuePropName="checked" label={<p className="font-bold text-sm">Terra dos Imóveis</p>}>
                                    <Checkbox >Sim</Checkbox>
                                </Form.Item>
                                <Form.Item name='permuta' initialValue={false} valuePropName="checked" label={<p className="font-bold text-sm">Aceita Permuta?</p>}>
                                    <Checkbox >Sim</Checkbox>
                                </Form.Item>
                                <div className="flex text-sm  justify-end items-center">
                                    <div>
                                        <p>Criado em:</p>
                                        <p className="font-bold">{imovel && moment(imovel.createdAt).format('DD/MM/YYYY')}</p>
                                    </div>

                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="px-2 mt-4">
                        <button type="button" className="w-full" onClick={() => setOpenLocalizacao(!openLocalizacao)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <FaLocationDot size={24} />
                                    <p className="text-lg">Localização</p>
                                </div>

                                <Icon open={openLocalizacao} />
                            </div>
                        </button>

                        <div className={`w-full   border-[1px]  border-verde rounded-b-md transition-all duration-1000 px-6 ${openLocalizacao === true ? 'opacity-100 h-full sm:h-[370px]' : ' opacity-0 hidden h-0'} `}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 pt-4">
                                <div>
                                    <p className="font-bold text-base">CEP  <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" className="text-[12px] underline">(não sei o CEP)</a></p>
                                    <input placeholder="00000-000" value={cep ? cep : ''} onChange={handleCepChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                                </div>
                                <Form.Item name='logradouro' className="col-span-2" label={<p className="font-bold text-base">Rua</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numero' label={<p className="font-bold text-base">Número</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='complemento' label={<p className="font-bold text-base">Complemento</p>}>
                                    <Input />
                                </Form.Item>




                                <Form.Item required rules={[{ required: true, message: 'Por favor insira o estado!' }]} name='estado' label={<p className="font-bold text-base">Estado</p>}>
                                    <Select onChange={(e, option) => onChangeEstado(e, option)} options={optionsEstado} showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })} />
                                </Form.Item>
                                <Form.Item required rules={[{ required: true, message: 'Por favor insira a cidade!' }]} name='cidade' label={<p className="font-bold text-base">Cidade</p>}>
                                    <Select
                                        disabled={estado === undefined ? true : false}
                                        onChange={(e, option) => onChangeCidade(e, option)}
                                        options={optionsCidade}
                                        showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <Form.Item required rules={[{ required: true, message: 'Por favor insira o bairro!' }]} name='bairro' label={<p className="font-bold text-base">Bairro</p>}>
                                    <Select
                                        disabled={estado === undefined || cidade === undefined ? true : false}
                                        options={optionsBairro}
                                        onChange={(e, option) => onChangeBairro(e, option)}
                                        showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>

                            </div>
                            <div className="">
                                <Form.Item name='referencia' label={<p className="font-bold text-base">Referência</p>}>
                                    <Input />
                                </Form.Item>

                            </div>
                            <div className="grid grid-cols-4 gap-x-4">
                                <Form.Item name='estado_dimob' label={<p className="font-bold text-base">Estado DIMOB</p>}>
                                    <Select
                                        onChange={(e, option) => onChangeEstadoDimob(e, option)}
                                        options={optionsEstado}
                                        showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <Form.Item name='cidade_dimob' label={<p className="font-bold text-base">Cidade DIMOB</p>}>
                                    <Select
                                        disabled={estadoDimob === undefined ? true : false}
                                        onChange={(e, option) => onChangeCidadeDimob(e, option)}
                                        options={optionsCidadeDimob}
                                        showSearch
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <div>

                                </div>
                                <div className="flex justify-center items-center">
                                    <div>
                                        <button type="button" onClick={handleEnderecoCompleto} className="bg-verde px-6 py-2 text-white font-semibold rounded-md">
                                            Copiar Endereco Completo
                                        </button>
                                    </div>

                                </div>

                            </div>
                        </div>


                    </div>
                    <div className="px-2 mt-4">
                        <button type="button" className="w-full" onClick={() => setOpenCaracteristicaImovel(!openCaracteristicaImovel)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <RiHomeGearFill size={24} />
                                    <p className="text-lg">Características do imóvel</p>
                                </div>

                                <Icon open={openCaracteristicaImovel} />
                            </div>
                        </button>

                        <div
                            className={`w-full border-[1px] border-verde rounded-b-md transition-all duration-1000 px-6 ${openCaracteristicaImovel === true
                                ? "opacity-100 h-full sm:h-[400px]"
                                : "opacity-0 hidden h-0"
                                }`}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 pt-4">
                                <Form.Item
                                    name="areaTerreno"
                                    label={<p className="font-bold text-base">Área do Terreno</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="testada"
                                    label={<p className="font-bold text-base">Testada / Frente</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="areaConstruida"
                                    label={<p className="font-bold text-base">Área Construída</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="ladoEsquerdo"
                                    label={<p className="font-bold text-base">Lado Esquerdo</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="ladoDireito"
                                    label={<p className="font-bold text-base">Lado Direito</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="fundos"
                                    label={<p className="font-bold text-base">Fundos</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="posicao"
                                    label={<p className="font-bold text-base">Posição</p>}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    required
                                    rules={[{ required: true, message: "Por favor insira a quantidade de quarto" }]}
                                    name="quartos"
                                    className="w-full"
                                    label={<p className="font-bold text-base">Quarto</p>}
                                >
                                    <InputNumber className="w-full" />
                                </Form.Item>
                                <Form.Item
                                    required
                                    rules={[{ required: true, message: "Por favor insira a quantidade de banheiro" }]}
                                    name="banheiros"
                                    className="w-full"
                                    label={<p className="font-bold text-base">Banheiro</p>}
                                >
                                    <InputNumber className="w-full" />
                                </Form.Item>
                                <Form.Item
                                    required
                                    rules={[{ required: true, message: "Por favor insira a quantidade de garagem" }]}
                                    name="garagens"
                                    className="w-full"
                                    label={<p className="font-bold text-base">Garagem</p>}
                                >
                                    <InputNumber className="w-full" />
                                </Form.Item>
                                <Form.Item
                                    required
                                    rules={[{ required: true, message: "Por favor insira a quantidade de cama" }]}
                                    name="camas"
                                    className="w-full"
                                    label={<p className="font-bold text-base">Cama</p>}
                                >
                                    <InputNumber className="w-full" />
                                </Form.Item>
                                <Form.Item
                                    name="atributos"
                                    className="col-span-full sm:col-span-4"
                                    label={<p className="font-bold text-base">Adicionar Atributos</p>}
                                >
                                    <Select
                                        options={optionsAtributos}
                                        mode="multiple"
                                        onChange={(e, option) => onChangeAtributo(e, option)}
                                    />
                                </Form.Item>
                            </div>
                        </div>


                    </div>
                    <div className="px-2 mt-4 ">
                        <button type="button" className="w-full" onClick={() => setOpenInformacaoVenda(!openInformacaoVenda)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <FaTags size={24} />
                                    <p className="text-lg">Informações de Venda</p>
                                </div>

                                <Icon open={openInformacaoVenda} />
                            </div>
                        </button>
                        <div className={`w-full   border-[1px]  border-verde rounded-b-md transition-all duration-1000 px-6 ${openInformacaoVenda === true ? 'h-full sm:h-[270px] opacity-100' : ' hidden h-0 opacity-0'}`}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 pt-4">
                                <Form.Item name='captador_principal' rules={[{ required: true, message: 'Por favor insira o captador principal!' }]} label={<p className="font-bold text-base">Captador Principal</p>}>
                                    <Select
                                        options={optionsCaptador}
                                        showSearch
                                        onChange={(e, option) => onChangeCaptadorPrincipal(e, option)}
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <Form.Item name='captador_secundario' label={<p className="font-bold text-base">2º Captador</p>}>
                                    <Select
                                        options={optionsCaptador}
                                        showSearch
                                        onChange={(e, option) => onChangeCaptadorSecundario(e, option)}
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <Form.Item name='filial' label={<p className="font-bold text-base">Filial</p>}>
                                    <Select
                                        options={optionsFiliais}
                                        showSearch
                                        onChange={(e, option) => onChangeFilial(e, option)}
                                        filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                    />
                                </Form.Item>
                                <Form.Item label={<p className="font-bold text-base">Valor</p>}>
                                    <InputNumber
                                        className="w-full"
                                        value={valor}
                                        onChange={onChangeValor}
                                        formatter={formatter}
                                        parser={parser}
                                    />
                                </Form.Item>
                                <Form.Item name='comissaoPorcentagem' label={<p className="font-bold text-base">Comissão (%)</p>}>
                                    <Select

                                        onChange={(e) => onChangeComissaoPorcentagem(e)}
                                        options={[{
                                            label: <span>Imóvel Urbano</span>,
                                            title: 'Imóvel Urbano',
                                            options: [
                                                { label: <span>4</span>, value: 4 },
                                                { label: <span>5</span>, value: 5 },
                                                { label: <span>6</span>, value: 6 },
                                            ],
                                        },
                                        {
                                            label: <span>Imóvel Rural</span>,
                                            title: 'Imóvel Rural',
                                            options: [
                                                { label: <span>8</span>, value: 8 },
                                                { label: <span>9</span>, value: 9 },
                                                { label: <span>10</span>, value: 10 }
                                            ],
                                        },
                                        {
                                            label: <span>Aluguel</span>,
                                            title: 'Aluguel',
                                            options: [
                                                { label: <span>20% no primeiro mês, 10% no demais</span>, value: 20 },
                                            ],
                                        },
                                        {
                                            label: <span>Comissão Fechada</span>,
                                            title: 'Comissão Fechada',
                                            options: [
                                                { label: <span>Comissão Fechada</span>, value: -1 },

                                            ],
                                        },
                                        ]}
                                    />
                                </Form.Item >
                                <Form.Item label={<p className="font-bold text-base">Comissão (R$)</p>}>
                                    <InputNumber
                                        disabled={comissaoPocentagem !== -1 ? true : false}
                                        className="w-full"
                                        value={comissaoValor}
                                        onChange={onChangeComisaoValor}
                                        precision={2}
                                        formatter={formatter}
                                        parser={parser}
                                        step={0.01}
                                    />
                                </Form.Item>



                            </div>
                            <div className="grid grid-cols-4 gap-x-4">
                                <Form.Item label={<p className="font-bold text-base">Valor do IPTU</p>}>
                                    <InputNumber
                                        className="w-full"
                                        value={iptu}
                                        onChange={onChangeIptu}
                                        precision={2}
                                        formatter={formatter}
                                        parser={parser}
                                        step={0.01} />
                                </Form.Item>
                                <Form.Item name='mostrar_iptu' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Mostrar IPTU?</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                                <Form.Item label={<p className="font-bold text-base">Valor do Condomínio</p>}>
                                    <InputNumber
                                        className="w-full"
                                        value={condominio}
                                        onChange={onChangeCondominio}
                                        precision={2}
                                        formatter={formatter}
                                        parser={parser}
                                        step={0.01} />
                                </Form.Item>
                                <Form.Item name='mostrar_condominio' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Mostrar Condomínio?</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                            </div>
                        </div>


                    </div>
                    <div className="px-2 mt-4 ">
                        <button type="button" className="w-full" onClick={() => setOpenInformacaoAdicional(!openInformacaoAdicional)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <AiOutlinePlusCircle size={24} />
                                    <p className="text-lg">Informações Adicionais</p>
                                </div>

                                <Icon open={openInformacaoAdicional} />
                            </div>
                        </button>

                        <div className={`w-full   border-[1px] border-verde rounded-b-md transition-all duration-1000 px-6 ${openInformacaoAdicional === true ? 'h-[1350px] sm:h-[1200px] opacity-100 block ' : 'h-0 hidden opacity-0'}`}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 pt-4">
                                <Form.Item name='numeroIptu' label={<p className="font-bold text-base">Nº IPTU</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numeroMatricula' label={<p className="font-bold text-base">Nº Matrícula</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numeroContaAgua' label={<p className="font-bold text-base">CÓD. DAMAE</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numeroClienteCemig' label={<p className="font-bold text-base">Nº Cliente CEMIG</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='numeroInstalacaoEnergia' label={<p className="font-bold text-base">Nº Instalação CEMIG</p>}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='destaque' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Destaque</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                                <Form.Item name='chave' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Chave na imobiliária</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                                <Form.Item name='exclusivo' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Exclusivo</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                                <Form.Item name='parceria' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Parceria</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>
                                <Form.Item name='placa' initialValue={false} valuePropName="checked" label={<p className="font-bold text-base">Placa</p>}>
                                    <Checkbox>Sim</Checkbox>
                                </Form.Item>

                            </div>
                            <div>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <Form.Item name='observacoes' label={<p className="font-bold text-base">Observação</p>}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='situacaoDocumentacao' label={<p className="font-bold text-base">Situação da Documentação</p>}>
                                        <Input />
                                    </Form.Item>
                                </div>

                                <div className=" rounded-lg  py-4  h-[380px] ">
                                    <div className="flex justify-between items-center ">
                                        <p className="text-xl font-bold font-andika text-start mt-2">Descrição</p>
                                        <div className="flex justify-center items-center gap-x-4">
                                            {avaliacao === true && (
                                                <div>
                                                    <p className="text-sm font-bold ">Por favor avalie</p>
                                                    <div className="flex gap-x-2 mt-2" >
                                                        <button type="button" onClick={() => Avaliar(1)} >
                                                            <Tooltip title='Ruim'>
                                                                <img src="/images/icones/ruin.png" className="w-7" alt="ruim" />
                                                            </Tooltip>
                                                        </button>
                                                        <button type="button" onClick={() => Avaliar(2)}>
                                                            <Tooltip title='Mais ou menos'>
                                                                <img src="/images/icones/razoavel.png" className="w-7" alt="mais ou menos" />
                                                            </Tooltip>
                                                        </button>
                                                        <button type="button" onClick={() => Avaliar(3)}>
                                                            <Tooltip title='Bom'>
                                                                <img src="/images/icones/bom.png" className="w-7" alt="bom" />
                                                            </Tooltip>
                                                        </button>
                                                        <button type="button" onClick={() => Avaliar(4)}>
                                                            <Tooltip title='Ótimo'>
                                                                <img src="/images/icones/estrela.webp" className="w-7" alt="otimo" />
                                                            </Tooltip>
                                                        </button>
                                                    </div>
                                                </div>

                                            )}
                                            <button disabled={loadingGerar === true ? true : false} type="button" onClick={GerarDescricao} className={` px-6 py-2 rounded-md  font-bold ${loadingGerar === true ? 'bg-gray-400 text-black' : 'bg-verde text-white'}`} >{loadingGerar === true ? 'Gerando' : 'Gerar por IA'}</button>
                                        </div>

                                    </div>

                                    <ReactQuill value={descricao} onChange={onChangeDescricao} theme="snow" className="mt-2   bg-white   " style={{ height: '240px' }} />
                                </div>
                                <div className=" rounded-lg  py-4  h-[310px] ">
                                    <p className="text-xl font-bold font-andika text-start mt-2">Restrições do imóvel</p>
                                    <ReactQuill value={restricao} defaultValue={imovel?.restricoes} onChange={onChangeRestricao} theme="snow" className="mt-4   bg-white   " style={{ height: '200px' }} />
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="px-2 mt-4 mb-6">
                        <button type="button" className="w-full" onClick={() => setOpenImagem(!openImagem)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <BiImageAdd size={24} />
                                    <p className="text-lg">Imagens</p>
                                </div>

                                <Icon open={openImagem} />
                            </div>
                        </button>

                        <div className={`  border-[1px] border-verde rounded-b-md transition-all duration-1000 px-2 ${openImagem === true ? ' opacity-100 block  ' : 'h-0 hidden opacity-0'}`}>
                            {converterImagem === true ? <LoadingScreen heigth="200px" message={'convertendo imagens ' + quantidade + ' de ' + total} /> :
                                <>
                                    <div className="w-auto sm:w-[62vw] overflow-x-hidden whitespace-nowrap mt-4">

                                        <DragDropContext onDragEnd={onDragEnd}>
                                            {preview.map(row => (
                                                <Droppable key={row.id} droppableId={row.id.toString()} direction="horizontal">
                                                    {(provided, snapshot) => (
                                                        <div
                                                            {...provided.droppableProps}
                                                            ref={provided.innerRef}
                                                            style={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                gap: '8px',
                                                                padding: '8px',
                                                                borderRadius: '8px',

                                                                background: snapshot.isDraggingOver ? '#f0f0f0' : 'transparent',
                                                            }}
                                                            className="h-[11vw]"
                                                        >
                                                            {row.item.map((item, index) => (
                                                                <Draggable key={item.caminho} draggableId={item.caminho} index={index}>
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps} // Inclua as dragHandleProps aqui
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                border: '1px solid #aaa',
                                                                                borderRadius: '8px',
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}
                                                                            className="w-[20.5vw] sm:w-[14.5vw] h-[10vw] overflow-y-hidden"
                                                                        >
                                                                            <div className="relative h-0 w-0 z-30 left-2 bottom-[45%] ">
                                                                                <Popconfirm
                                                                                    title="Deletar Imagem"
                                                                                    description="Tem certeza que quer excluir esta imagem?"
                                                                                    onConfirm={() => deleteImagem(row.id, index)}

                                                                                    okText="Sim"
                                                                                    cancelText="Não"
                                                                                >
                                                                                    <button type="button" className="bg-white w-4 h-4 flex justify-center items-center rounded-full sm:w-6 sm:h-6">
                                                                                        <IoMdClose className="text-red-500 text-xs sm:text-base" /> {/* Ícone menor no mobile */}
                                                                                    </button>
                                                                                </Popconfirm>
                                                                            </div>
                                                                            <Image src={item.caminho} className="w-[14.5vw] h-[10vw] object-cover" />
                                                                            <div className="relative h-0 w-0 right-9 top-[30%]">
                                                                                <div className="bg-white w-6 h-6 flex justify-center items-center rounded-full">
                                                                                    <p>{row.id == 0 ? <span>{index + 1}</span> : <span>{(row.id * 4) + index + 1}</span>}</p>
                                                                                </div>

                                                                            </div>
                                                                        </div>

                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            ))}
                                        </DragDropContext>
                                    </div>
                                    <div className="flex justify-end py-2 pr-4 w-full gap-2">
                                        {/* <button type="button" className="flex justify-center items-center border-[1px] border-verde rounded-lg px-4 py-1 bg-verde text-white font-bold" onClick={handleDownloadImages}>
                                            <FaCloudDownloadAlt title="Baixar Imagens" size={28} className="mx-auto" />
                                        </button> */}
                                        <button type="button" className="flex justify-center items-center border-[1px] border-verde rounded-lg px-4 py-1 bg-verde text-white font-bold" onClick={handleInputClick}>


                                            <CiCirclePlus size={32} className="mx-auto" />
                                            <p>Adicionar imagem</p>


                                        </button>
                                    </div>
                                </>
                            }
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={inputRef}
                                className="invisible h-0"
                                onChange={handleImgChange}
                            />
                        </div>
                    </div>
                    <div className="px-2 mt-4 mb-6">
                        <button type="button" className="w-full" onClick={() => setOpenVideo(!openVideo)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <MdVideoLibrary size={24} />
                                    <p className="text-lg">Vídeos</p>
                                </div>

                                <Icon open={openVideo} />
                            </div>
                        </button>

                        <div className={`  border-[1px] border-verde rounded-b-md transition-all duration-1000 px-2 ${openVideo === true ? ' opacity-100 block  ' : 'h-0 hidden opacity-0'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 py-4 px-2 gap-4"> {/* Grid responsivo */}
                                {imovel &&
                                    imovel.videos.map((video) => (
                                        <>
                                            <div className="w-full h-[180px] sm:h-[10vw]"> {/* Altura responsiva */}
                                                <div className="relative h-0 w-0 z-30 left-2 top-2 ">
                                                    <Popconfirm
                                                        title="Deletar Vídeo"
                                                        description="Tem certeza que quer excluir este vídeo?"
                                                        onConfirm={() => deleteVideo(video.id, video.link)}
                                                        okText="Sim"
                                                        cancelText="Não"
                                                    >
                                                        <button type="button" className="bg-white w-4 h-4 flex justify-center items-center rounded-full sm:w-6 sm:h-6">
                                                            <IoMdClose className="text-red-500 text-xs sm:text-base" />
                                                        </button>
                                                    </Popconfirm>
                                                </div>
                                                <a href={video.link} target="_blank">
                                                    <img
                                                        className="w-full h-full rounded-md"
                                                        src={`https://img.youtube.com/vi/${getYouTubeVideoId(video.link)}/mqdefault.jpg`}
                                                        alt=""
                                                    />
                                                </a>
                                            </div>
                                        </>
                                    ))}
                                <button
                                    onClick={() => setOpenAdicionarVideo(true)}
                                    type="button"
                                    className="w-full h-[180px] sm:h-[10vw] border-[1px] border-verde rounded-md flex justify-center items-center hover:bg-verde/10"
                                >
                                    <div className="text-verde font-bold">
                                        <CiCirclePlus size={32} className="mx-auto" />
                                        <p>Adicionar Vídeo</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="px-2 mt-4 mb-6">
                        <button type="button" className="w-full" onClick={() => setOpenDocumento(!openDocumento)}>
                            <div className="bg-verde text-white font-bold py-2 flex justify-between gap-3 items-center px-6 rounded-t-md">
                                <div className="flex items-center gap-2">
                                    <AiOutlineFileText size={24} />
                                    <p className="text-lg">Documentos</p>
                                </div>

                                <Icon open={openDocumento} />
                            </div>
                        </button>

                        <div className={`border-[1px] border-verde rounded-b-md transition-all duration-1000 px-2 ${openDocumento === true ? ' opacity-100 block  ' : 'h-0 hidden opacity-0'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-4 py-4 px-2 gap-4"> {/* Grid responsivo */}
                                {imovel &&
                                    imovel.documentos.map((documento) => (
                                        <>
                                            {openExcluirMaterial === true && (
                                                <Modal
                                                    width={400}
                                                    centered
                                                    open={openExcluirMaterial}
                                                    onCancel={() => setOpenExcluirMaterial(false)}
                                                    footer={false}
                                                    title={
                                                        <p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">
                                                            Excluir Documento
                                                        </p>
                                                    }
                                                    closeIcon={<IoMdClose size={24} color="white" className="" />}
                                                >
                                                    <Form
                                                        layout="vertical"
                                                        className="px-10 mt-6"
                                                        onFinish={onFinishDeleteMaterial}
                                                    >
                                                        <p>Tem certeza que quer apagar este documento ?</p>
                                                        <div className="flex justify-center gap-4 pb-4 mt-8">
                                                            <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                                                                Sim
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenExcluirMaterial(false)}
                                                                className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10"
                                                            >
                                                                Não
                                                            </button>
                                                        </div>
                                                    </Form>
                                                </Modal>
                                            )}

                                            <div key={documento.id} className="flex justify-center w-full sm:w-auto">
                                                <div className="relative w-0 h-0 z-30 ">
                                                    <div className="flex justify-between gap-2 mt-2 pl-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIdMaterialUpdate(documento.id);
                                                                setOpenEditarMaterial(true);
                                                            }}
                                                            className="bg-white text-black rounded-full p-2"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenExcluirMaterial(true);
                                                                setIdMaterial(documento.id);
                                                            }}
                                                            className="bg-white text-black rounded-full p-2"
                                                        >
                                                            <MdClose size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <UniversalFileViewer
                                                    fileUrl={documento.arquivo}
                                                    fileType={documento.fileType}
                                                    nome={documento.nome}
                                                    descricao={documento.descricao}
                                                />
                                            </div>
                                        </>
                                    ))}
                                <button
                                    onClick={() => setOpenCreateMaterial(true)}
                                    type="button"
                                    className="w-full h-[180px] sm:h-[10vw] border-[1px] border-verde rounded-md flex justify-center items-center hover:bg-verde/10"
                                >
                                    <div className="text-verde font-bold">
                                        <CiCirclePlus size={32} className="mx-auto" />
                                        <p>Adicionar Documento</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 pb-3 mt-3">
                        <button disabled={converterImagem === true ? true : false} className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                            Salvar
                        </button>
                        <button type="button" onClick={() => setOpenExcluir(true)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                            Excluir
                        </button>
                    </div>
                </div >


            </Form >
        </div >

    )
}