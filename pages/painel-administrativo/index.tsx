import Layout from "@/components/Layout";
import { atom, useAtom } from "jotai";
import { Suspense, useCallback, useEffect, useState } from "react";
import { IoIosBed, IoMdClose, IoMdSearch } from "react-icons/io";
import ModalCreateImovel from "@/components/ModalCreateImovel";
import { api } from "@/services/apiClient";
import {
    FaCar,
    FaLocationDot,
    FaPlus,
    FaVectorSquare,
} from "react-icons/fa6";
import { GiBathtub } from "react-icons/gi";
import {
    Cascader,
    CascaderProps,
    Drawer,
    FloatButton,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    SelectProps,
    Slider,
    Tag,
} from "antd";
import { button, Spinner } from "@material-tailwind/react";
import UpdateImovel from "@/components/UpdateImovel";
import diacritics from "diacritics";
import { pegarPrimeiroUltimoNome, removeAccents } from "@/global/TratamentosDeStrings";
import LoadingScreen from "@/components/LoadingScreen";
import _ from "lodash";
import { telaTamanho } from "../_app";

// Interfaces
interface Imoveis {
    total: number;
    imoveis: Imovel[];
}

interface Imovel {
    id: string;
    idInterno: number;
    modalidade: string;
    tipo: string;
    subtipo: string;
    proprietario: string;
    categoria: string;
    status: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    captadorPrincipal: string;
    valor: number;
    areaTerreno: string;
    quartos: number;
    banheiros: number;
    garagens: number;
    camas: number;
    foto: string;
}

interface Filtro {
    idEstado?: number[];
    idCidade?: number[];
    idBairro?: number[];
    modalidade?: string[];
    idTipo?: number[];
    idSubtipo?: number[];
    idCliente?: string[];
    idCaptador?: string[];
    status?: string;
    valorMin?: number;
    valorMax?: number;
    idInterno?: string;
    garagens?: number;
    banheiros?: number;
    quartos?: number;
    rua?: string;
    ordem?: string;
}

interface Categoria {
    id: string;
    nome: string;
    cor?: string;
}

interface Estado {
    id: number;
    nome: string;
    sigla: string;
}

interface Cidade {
    id: number;
    nome: string;
    idEstado?: number;
}

interface Bairro {
    id: number;
    nome: string;
    idCidade?: number;
}

interface Tipo {
    id: string;
    nome: string;
}

interface SubTipo {
    id: string;
    nome: string;
}

interface Captador {
    id: string;
    nome: string;
}

interface Cliente {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    celular?: string;
    cpfCnpj?: string;
    tipoPessoa?: string;
}

interface Filial {
    id: string;
    nome: string;
}

interface SubTipoSingle {
    label: string;
    value: number;
}

interface TipoFiltro {
    label: string;
    value: number;
    children?: SubTipoSingle[];
}

// Constantes
const { SHOW_CHILD } = Cascader;
export const openCreateImovelAtom = atom(false);
export const atualizarImovelAtom = atom(false);
export const atualizarUpdateImovelAtom = atom(false);
export const imovelIdAtom = atom("");
export const skipAtom = atom(0);
export const takeAtom = atom(10);

// Componente principal
export default function PainelAdminitrativo() {
    // Estados
    const [openCreateImovel, setOpenCreateImovel] = useAtom(openCreateImovelAtom);
    const [imovelId, setImovelId] = useAtom(imovelIdAtom);
    const [atualizar, setAtualizar] = useAtom(atualizarImovelAtom);
    const [atualizarUpdate, setAtualizarUpdate] = useAtom(
        atualizarUpdateImovelAtom
    );
    const [loading, setLoading] = useState(false);
    const [loadingImoveis, setLoadingImoveis] = useState<boolean>(false);
    const [imoveis, setImoveis] = useState<Imoveis>({ total: 0, imoveis: [] });
    const [open, setOpen] = useState<boolean>(false);
    const [filtro, setFiltro] = useState<boolean>(false);
    const [configuracoes, setConfiguracoes] = useState<Filtro>();
    const [skip, setSkip] = useAtom(skipAtom);
    const [take, setTake] = useAtom(takeAtom);
    const [estados, setEstados] = useState<Estado[]>([]);
    const [tipos, setTipos] = useState<TipoFiltro[]>([]);
    const [form] = Form.useForm();
    const [showDetails, setShowDetails] = useState(false);
    const [tela, setTela] = useAtom(telaTamanho);

    // Efeitos
    useEffect(() => {
        api
            .post("imoveis/filtrar/skip/0/take/10", configuracoes)
            .then((resposta) => {
                setImoveis(resposta.data);
                if (resposta.data.imoveis.length > 0) {
                    setImovelId(resposta.data.imoveis[0].id);
                }
                setLoading(true);
            });
    }, [atualizar]);

    useEffect(() => {
        api
            .post(
                "imoveis/filtrar/skip/" + 0 + "/take/" + (take + skip),
                configuracoes
            )
            .then((resposta) => {
                setImoveis(resposta.data);
                setLoading(true);
            });
    }, [atualizarUpdate]);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearch = useCallback(
        _.debounce((searchTerm) => {
            setConfiguracoes((prevConfig) => ({
                ...prevConfig,
                idInterno: searchTerm,
            }));
        }, 300),
        []
    );

    useEffect(() => {
        setLoadingImoveis(true);
        api
            .post("imoveis/filtrar/skip/" + skip + "/take/" + take, configuracoes)
            .then((resposta) => {
                setImoveis(resposta.data);
                if (resposta.data.imoveis.length > 0) {
                    setImovelId(resposta.data.imoveis[0].id);
                }
                setLoadingImoveis(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [filtro, configuracoes]);

    useEffect(() => {
        api
            .post("imoveis/filtrar/skip/" + skip + "/take/" + take, configuracoes)
            .then((resposta) => {
                setImoveis((prevImoveis) => ({
                    ...prevImoveis,
                    imoveis: [...(prevImoveis.imoveis || []), ...resposta.data.imoveis],
                }));
            });
    }, [skip]);

    const [height, setHeight] = useState<number>(0);

    // Funções
    function onChangeOrdem(ordem: string) {
        setConfiguracoes((prevConfig) => ({ ...prevConfig, ordem: ordem }));
        setSkip(0);
        setTake(10);
    }

    useEffect(() => {
        debouncedSearch(searchTerm);
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, debouncedSearch]);

    function onChange(id: string) {
        if (window.innerWidth < 768) {
            setShowDetails(true);
        }
        setLoading(false);
        setTimeout(() => {
            setImovelId(id);
            setLoading(true);
        }, 1500);
    }

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [captadores, setCaptadores] = useState<Captador[]>([]);
    const [filiais, setFiliais] = useState<Filial[]>([]);

    const filterOption = (
        input: string,
        option?: { label: string; value: string }
    ) => {
        if (!option) {
            return false;
        }

        const optionLabel = removeAccents(option.label);
        return optionLabel.toLowerCase().includes(removeAccents(input.toLowerCase()));
    };

    useEffect(() => {
        api.get("localidades/estados").then((resposta) => {
            setEstados(resposta.data);
        });
        api.get("categorias/all").then((resposta) => {
            setCategorias(resposta.data);
        });
        api.get("tipos/subtipos/all").then((resposta) => {
            let tipoAux: TipoFiltro[] = [] as TipoFiltro[];
            resposta.data.map((tipo: any) => {
                let subtipo: SubTipoSingle[] = [] as SubTipoSingle[];
                tipo.subtipos.map((subTipo: any) => {
                    return subtipo.push({ label: subTipo.nome, value: subTipo.id });
                });
                if (subtipo.length > 0) {
                    tipoAux.push({
                        label: tipo.nome,
                        value: tipo.id,
                        children: subtipo,
                    });
                } else {
                    tipoAux.push({ label: tipo.nome, value: tipo.id });
                }
            });

            setTipos(tipoAux);
        });
        api.get("usuarios/captadores").then((resposta) => {
            setCaptadores(resposta.data);
        });
        api.get("filiais/all").then((resposta) => {
            setFiliais(resposta.data);
        });
    }, []);

    const [estado, setEstado] = useState<Estado>();
    const [cidade, setCidade] = useState<Cidade>();
    const [bairro, setBairro] = useState<Bairro[]>();

    function onChangeEstado(e: string, option: any) {
        setEstado({
            id: option.id,
            nome: option.label,
            sigla: option.value,
        });
        form.setFieldsValue({
            cidade: undefined,
            bairro: undefined,
        });
        setCidade(undefined);
        setBairro(undefined);
        api
            .get("localidades/estados/" + option.id + "/cidades")
            .then((resposta) => {
                setCidades(resposta.data);
            });
    }

    const optionsEstado: SelectProps["options"] = estados?.map((estado) => ({
        label: estado.nome,
        value: estado.nome,
        id: estado.id,
    }));

    const [cidades, setCidades] = useState<Cidade[]>([]);

    function onChangeCidade(e: string, option: any) {
        setCidade({
            id: option.id,
            nome: option.label,
        });
        form.setFieldsValue({
            bairro: undefined,
        });
        setBairro(undefined);
        api
            .get("localidades/cidades/" + option.id + "/bairros")
            .then((resposta) => {
                setBairros(resposta.data);
            });
    }

    const optionsCidade: SelectProps["options"] = cidades?.map((cidade) => ({
        label: cidade.nome,
        value: cidade.nome,
        id: cidade.id,
    }));

    const [bairros, setBairros] = useState<Bairro[]>([]);

    function onChangeBairro(e: string[], option: any) {
        setBairro(
            option.map((value: any) => {
                return {
                    nome: value.label,
                    id: value.id,
                };
            })
        );
    }

    const optionsBairro: SelectProps["options"] = bairros?.map((bairro) => ({
        label: bairro.nome,
        value: bairro.nome,
        id: bairro.id,
    }));

    const onChangeTipo: CascaderProps<TipoFiltro, "value", true>["onChange"] = (
        value
    ) => {
        console.log(value);
    };

    const [value, setValue] = useState<string>("");
    const [controle, setControle] = useState<boolean>(false);

    function onChangeSearchCliente(e: string) {
        setValue(e);
    }

    const debouncedSearchCliente = useCallback(
        _.debounce((value) => {
            setValue(value);
            setControle((prevControle) => !prevControle);
        }, 300),
        []
    );

    useEffect(() => {
        api
            .post("clientes/filtrar/palavra", { palavra: value })
            .then((resposta) => {
                setClientes(resposta.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [controle]);

    useEffect(() => {
        debouncedSearchCliente(value);
        return () => {
            debouncedSearchCliente.cancel();
        };
    }, [value, debouncedSearchCliente]);

    const optionsClientes: SelectProps["options"] = clientes?.map((cliente) => ({
        label: cliente.nome,
        value: cliente.id,
        id: cliente.id,
    }));

    const onFinish = (values: any) => {
        let tipo: number[] = [] as number[];
        let subTipo: number[] = [] as number[];
        if (values.tipo) {
            values.tipo.map((aux: any) => {
                if (aux.length > 1) {
                    subTipo.push(aux[1]);
                } else {
                    tipo.push(aux[0]);
                }
            });
        }

        values.modalidade
            ? values.modalidade
            : (values.modalidade = "TODOS");

        setConfiguracoes((prevConfig) => ({
            ...prevConfig,
            status:
                values.status !== "TODOS" && values.status !== undefined
                    ? values.status
                    : undefined,
            modalidade:
                values.modalidade !== "TODOS" && values.modalidade !== undefined
                    ? [values.modalidade]
                    : undefined,
            rua: values.rua !== undefined ? values.rua : undefined,
            idTipo: values.tipo !== undefined ? tipo : [],
            idSubtipo: values.tipo !== undefined ? subTipo : [],
            idCaptador:
                captadoresFiltro.length > 0
                    ? captadoresFiltro[0] === "Todos"
                        ? captadores.map((captador) => captador.id)
                        : captadoresFiltro
                    : undefined,
            idCliente: values.propietario !== undefined ? values.propietario : undefined,
            idEstado: estado ? [estado.id] : undefined,
            idCidade: cidade ? [cidade.id] : undefined,
            valorMin: values.minimo,
            valorMax: values.maximo,
            idBairro:
                bairro && bairro.length > 0
                    ? bairro.map((valor) => valor.id).flat()
                    : undefined,
        }));
        setSkip(0);
        setTake(10);
        setOpen(false);
    };

    const formatter = (value: any) => {
        if (!value) return "";
        return `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parser = (value: any) => {
        if (!value) return "";
        return value.replace(/R\$\s?|(\.*)/g, "").replace(",", ".");
    };

    const [min, setMin] = useState<number>(0);
    const [max, setMax] = useState<number>(10000000000);

    const onChangeMin = (value: number) => {
        setMin(value);
    };

    const [captadoresFiltro, setCaptadoresFiltro] = useState<string[]>([]);

    function onChangeCaptadoresFiltro(valor: string[]) {
        if (valor[valor.length - 1] === "Todos") {
            setCaptadoresFiltro(["Todos"]);
        } else {
            setCaptadoresFiltro(valor.filter((valor) => valor !== "Todos"));
        }
    }

    const onChangeMax = (value: number) => {
        setMax(value);
    };
    const onChangeSlider = (value: number[]) => {
        if (value[0]) {
            setMin(value[0]);
            form.setFieldValue("minimo", value[0]);
        }
        if (value[1]) {
            setMax(value[1]);
            form.setFieldValue("maximo", value[1]);
        }
    };

    // Renderização
    return (
        <Layout>
            {openCreateImovel === true && (
                <Suspense>
                    <ModalCreateImovel />
                </Suspense>
            )}
            <div className="flex flex-col md:flex-row">
                {/* Coluna de detalhes do imóvel */}
                <div
                    className={`w-full md:w-[65vw] md:h-[calc(100vh-160px)] transition-all duration-500 ease-in-out ${showDetails ? "block" : "hidden md:block"
                        }`}
                >
                    {imovelId !== "" && loading === true ? (
                        <Suspense>
                            <div className="relative">
                                <UpdateImovel />
                                {/* Botão fechar (somente mobile) */}
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="absolute top-3.5 right-14 z-10 bg-white text-verde p-1.5 rounded-full md:hidden"
                                >
                                    <IoMdClose />
                                </button>
                            </div>
                        </Suspense>
                    ) : imoveis && imoveis.imoveis.length > 0 ? (
                        <div className="flex justify-center h-[calc(100vh-122px)] items-center">
                            <LoadingScreen heigth="600px" />
                        </div>
                    ) : null}
                </div>

                {/* Coluna de listagem de imóveis */}
                <div
                    style={{ height: (tela - 60) + "px" }}
                    className={`w-full md:w-[35vw] border-r-2  ${showDetails ? "hidden md:block" : "block"
                        }`}
                >
                    <div className="px-4 py-2 ">
                        <div className="mt-2">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-x-1">
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className="flex items-center gap-x-1"
                                    >
                                        <img
                                            src="/img/icones/config.webp"
                                            alt=""
                                            className="w-5"
                                        />
                                        <p className="text-verde font-extrabold">Filtros</p>
                                    </button>
                                </div>
                                <div>
                                    <button
                                        onClick={() => setOpenCreateImovel(true)}
                                        className="bg-[#EC681D] text-white py-1 px-4 rounded-lg"
                                    >
                                        Adicionar Imóvel
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-2">
                                <Select
                                    onChange={(e) => onChangeOrdem(e)}
                                    defaultValue="RECENTES"
                                    className="w-40"
                                    options={[
                                        {
                                            label: "Mais recentes",
                                            value: "RECENTES",
                                        },
                                        {
                                            label: "Mais antigos",
                                            value: "ANTIGOS",
                                        },
                                        {
                                            label: "Maior valor",
                                            value: "MAIOR_VALOR",
                                        },
                                        {
                                            label: "Menor valor",
                                            value: "MENOR_VALOR",
                                        },
                                    ]}
                                />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-32 border-[1px] border-gray-400 rounded-md px-2 h-8"
                                    placeholder="código"
                                />
                                <p className="font-bold">
                                    <span className="text-[#00B97C] ">
                                        {imoveis ? imoveis.total : 0}
                                    </span>{" "}
                                    imóveis
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        style={{ height: (tela - 160) + "px" }}
                        className="px-2 py-2 space-y-2 md:block hidden  overflow-y-auto custom-scrollbar"
                    >
                        {loadingImoveis === false ? (
                            <>
                                {imoveis &&
                                    imoveis.imoveis.map((imovel) => (
                                        <button
                                            key={imovel.id}
                                            onClick={() => onChange(imovel.id)}
                                            className={`w-full text-start shadow-md border-verde rounded-md  border-[1px] hover:bg-verde/10 ${imovel.id === imovelId ? "bg-verde/10" : ""
                                                }`}
                                        >
                                            <div
                                                key={imovel.id}
                                                className="border-[1px] border-verde rounded-md w-full pb-4"
                                            >
                                                <div className="flex gap-3 w-full">
                                                    <div className="w-48 h-32">
                                                        <img
                                                            className="w-full h-full rounded-br-md rounded-tl-md"
                                                            src={
                                                                imovel.foto
                                                                    ? imovel.foto
                                                                    : "img/imovel_sem_foto.webp"
                                                            }
                                                            alt="foto do imovel"
                                                        />
                                                    </div>

                                                    <div className="mt-2 w-full pr-4">
                                                        <div className="flex justify-between">
                                                            <p className="font-bold text-base text-verde">
                                                                {imovel.tipo} {imovel.bairro}
                                                            </p>
                                                            <div>
                                                                <Tag
                                                                    className={`${imovel.status === "ATIVO"
                                                                        ? "bg-verde text-white"
                                                                        : "bg-red-500 text-white"
                                                                        }`}
                                                                >
                                                                    {imovel.status}
                                                                </Tag>
                                                            </div>

                                                        </div>
                                                        <p className="font-bold text-sm">
                                                            Código: {imovel.idInterno}
                                                        </p>
                                                        <div className="mt-2 flex text-[10px] items-center gap-2">
                                                            <FaLocationDot className="text-verde" />
                                                            <p>
                                                                {imovel.logradouro}
                                                                {imovel.numero && (
                                                                    <span>, {imovel.numero}</span>
                                                                )}
                                                                {imovel.bairro && (
                                                                    <span>, {imovel.bairro}</span>
                                                                )}
                                                                {imovel.cidade && (
                                                                    <span>, {imovel.cidade}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex justify-between mt-2 w-full">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                
                                                                {imovel.garagens && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <FaCar />
                                                                        <p>{imovel.garagens}</p>
                                                                        
                                                                    </div>
                                                                )}
                                                                {imovel.banheiros && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <GiBathtub />
                                                                        <p>{imovel.banheiros}</p>
                                                                        
                                                                    </div>
                                                                )}
                                                                {imovel.areaTerreno && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <FaVectorSquare />
                                                                        {imovel.areaTerreno}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-orange-400 font-extrabold text-md">
                                                                    {imovel.valor.toLocaleString("pt-BR", {
                                                                        style: "currency",
                                                                        currency: "BRL",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between px-4 mt-2">
                                                    <div>
                                                        <p className="font-bold sm:font-extrabold text-[14px]">
                                                            Modalidade
                                                        </p>
                                                        <p className="text-[10px]">{imovel.modalidade}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold sm:font-extrabold text-[14px]">
                                                            Captador
                                                        </p>
                                                        <p className="text-[10px]">
                                                            {pegarPrimeiroUltimoNome(imovel.captadorPrincipal)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold sm:font-extrabold text-[14px]">Tipo</p>
                                                        <p className="text-[10px]">{imovel.tipo}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold sm:font-extrabold text-[14px]">
                                                            SubTipo
                                                        </p>
                                                        <p className="text-[10px]">
                                                            {imovel.subtipo ? imovel.subtipo : imovel.tipo}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-[14px]">
                                                            Proprietário
                                                        </p>
                                                        <p className="text-[10px]">
                                                            {pegarPrimeiroUltimoNome(imovel.proprietario)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                <div className="flex justify-center ">
                                    {imoveis && skip + 10 < imoveis.total && (
                                        <button
                                            onClick={() => {
                                                setSkip(skip + 10);
                                            }}
                                            className="bg-verde text-white mt-2 px-6 py-2 rounded-md"
                                        >
                                            Ver mais imóveis
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <LoadingScreen heigth="600px" />
                        )}
                    </div>
                    <div
                        style={{ height: (tela - 180) + "px" }}
                        className="px-2 py-2 space-y-2 md:hidden block  overflow-y-auto custom-scrollbar"
                    >
                        {loadingImoveis === false ? (
                            <>
                                {imoveis &&
                                    imoveis.imoveis.map((imovel) => (
                                        <button
                                            key={imovel.id}
                                            onClick={() => onChange(imovel.id)}
                                            className={`w-full text-start shadow-md border-verde rounded-md  border-[1px] hover:bg-verde/10 ${imovel.id === imovelId ? "bg-verde/10" : ""
                                                }`}
                                        >
                                            <div
                                                key={imovel.id}
                                                className="border-[1px] border-verde rounded-md w-full pb-4"
                                            >
                                                <div className="flex gap-3 w-full">
                                                    <div className="w-48 h-32">
                                                        <img
                                                            className="w-full h-full rounded-br-md rounded-tl-md"
                                                            src={
                                                                imovel.foto
                                                                    ? imovel.foto
                                                                    : "img/imovel_sem_foto.webp"
                                                            }
                                                            alt="foto do imovel"
                                                        />
                                                    </div>

                                                    <div className="mt-2 w-full pr-4">
                                                        <div className="flex justify-between">
                                                            <p className="font-bold text-sm text-verde">
                                                                {imovel.tipo} {imovel.bairro}
                                                            </p>
                                                            <div className="h-6">
                                                                <Tag
                                                                    className={` py-1  ${imovel.status === "ATIVO"
                                                                        ? "bg-verde text-white"
                                                                        : "bg-red-500 text-white"
                                                                        }`}
                                                                >
                                                                    {imovel.status}
                                                                </Tag>
                                                            </div>

                                                        </div>
                                                        <p className="font-bold text-sm">
                                                            Código: {imovel.idInterno}
                                                        </p>
                                                        <div className="mt-2 flex text-[10px] items-center gap-2">
                                                            <FaLocationDot className="text-verde" />
                                                            <p>
                                                                {imovel.logradouro}
                                                                {imovel.numero && (
                                                                    <span>, {imovel.numero}</span>
                                                                )}
                                                                {imovel.bairro && (
                                                                    <span>, {imovel.bairro}</span>
                                                                )}
                                                                {imovel.cidade && (
                                                                    <span>, {imovel.cidade}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex justify-between mt-2 w-full">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                {imovel.camas && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <IoIosBed />
                                                                        <p>{imovel.camas}</p>
                                                                    </div>
                                                                )}
                                                                {imovel.garagens && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <FaCar />
                                                                        {imovel.garagens}
                                                                    </div>
                                                                )}
                                                                {imovel.banheiros && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <GiBathtub />
                                                                        {imovel.banheiros}
                                                                    </div>
                                                                )}
                                                                {imovel.areaTerreno && (
                                                                    <div className="flex gap-1 items-center">
                                                                        <FaVectorSquare />
                                                                        {imovel.areaTerreno}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-orange-400 font-extrabold text-md">
                                                                    {imovel.valor.toLocaleString("pt-BR", {
                                                                        style: "currency",
                                                                        currency: "BRL",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between px-4 mt-2">
                                                    <div>
                                                        <p className="font-bold sm:text-[14px] text-[12px]">
                                                            Modalidade
                                                        </p>
                                                        <p className="text-[10px]">{imovel.modalidade}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold sm:text-[14px] text-[12px]">
                                                            Captador
                                                        </p>
                                                        <p className="text-[10px]">
                                                            {imovel.captadorPrincipal}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-boldsm:text-[14px] text-[12px]">
                                                            SubTipo
                                                        </p>
                                                        <p className="text-[10px]">
                                                            {imovel.subtipo ? imovel.subtipo : imovel.tipo}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold sm:text-[14px] text-[12px]">
                                                            Proprietário
                                                        </p>
                                                        <p className="text-[10px]">
                                                            {imovel.proprietario}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                <div className="flex justify-center ">
                                    {imoveis && skip + 10 < imoveis.total && (
                                        <button
                                            onClick={() => {
                                                setSkip(skip + 10);
                                            }}
                                            className="bg-verde text-white mt-2 px-6 py-2 rounded-md"
                                        >
                                            Ver mais imóveis
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <LoadingScreen heigth="600px" />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Filtros */}
            {open === true && (
                <Modal
                    centered
                    width={1000}
                    open={open}
                    onCancel={() => setOpen(false)}
                    footer={false}
                    title={
                        <p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">
                            Filtros
                        </p>
                    }
                    closeIcon={<IoMdClose size={24} color="white" className="" />}
                >
                    <Form
                        form={form}
                        onFinish={onFinish}
                        layout="vertical"
                        className="px-6 mt-6"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
                            <Form.Item
                                name="status"
                                label={<p className="text-lg font-bold">Status</p>}
                            >
                                <Select
                                    options={[
                                        { label: "Todos", value: "TODOS" },
                                        { label: "Ativo", value: "ATIVO" },
                                        { label: "Inativo", value: "INATIVO" },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item
                                name="modalidade"
                                label={<p className="text-lg font-bold">Modalidade</p>}
                            >
                                <Select
                                    options={[
                                        { label: "Todas", value: "TODOS" },
                                        { label: "Venda", value: "VENDA" },
                                        { label: "Aluguel", value: "ALUGUEL" },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item
                                name="tipo"
                                className="col-span-2"
                                label={<p className="text-lg font-bold">Tipo</p>}
                            >
                                <Cascader
                                    options={tipos}
                                    multiple
                                    onChange={onChangeTipo}
                                    maxTagCount="responsive"
                                />
                            </Form.Item>
                        </div>
                        <div>
                            <p className="text-center text-lg sm:text-2xl font-bold">Valor</p>
                            <div className="sm:px-10 sm:mt-6">
                                <div className="flex justify-center items-center gap-x-4">
                                    <Form.Item
                                        initialValue={min}
                                        name="minimo"
                                        label={<p className="text-lg font-bold">Minimo</p>}
                                    >
                                        <InputNumber
                                            className="w-full"
                                            formatter={(value) =>
                                                `R$ ${Number(value).toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`
                                            }
                                            parser={(value) => {
                                                if (!value) return 0;
                                                const numericValue = value.replace(/\D/g, "");
                                                return Number(numericValue) / 100;
                                            }}
                                        />
                                    </Form.Item>
                                    <p className="text-6xl text-gray-400">-</p>
                                    <Form.Item
                                        initialValue={max}
                                        name="maximo"
                                        label={<p className="text-lg font-bold">Máximo</p>}
                                    >
                                        <InputNumber
                                            className="w-full"
                                            formatter={(value) =>
                                                `R$ ${Number(value).toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`
                                            }
                                            parser={(value) => {
                                                if (!value) return 0;
                                                const numericValue = value.replace(/\D/g, "");
                                                return Number(numericValue) / 100;
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-col-2 gap-x-6">
                            <Form.Item
                                name="rua"
                                label={<p className="text-lg font-bold">Rua</p>}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item label={<p className="text-lg font-bold">Captador</p>}>
                                <Select
                                    mode="multiple"
                                    value={captadoresFiltro}
                                    onChange={(e) => onChangeCaptadoresFiltro(e)}
                                    options={[
                                        {
                                            label: "Todos",
                                            value: "Todos",
                                        },
                                        ...captadores.map((captador) => {
                                            return {
                                                label: captador.nome,
                                                value: captador.id,
                                            };
                                        }),
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item
                                name="propietario"
                                label={<p className="text-lg font-bold">Propriétario</p>}
                            >
                                <Select
                                    mode="multiple"
                                    options={optionsClientes}
                                    showSearch
                                    onSearch={(e) => onChangeSearchCliente(e)}
                                    filterOption={(input, option) =>
                                        filterOption(input, option as { label: string; value: string })
                                    }
                                />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
                            <Form.Item
                                name="estado"
                                label={<p className="font-bold text-base">Estado</p>}
                            >
                                <Select
                                    onChange={(e, option) => onChangeEstado(e, option)}
                                    options={optionsEstado}
                                    showSearch
                                    filterOption={(input, option) =>
                                        filterOption(input, option as { label: string; value: string })
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                name="cidade"
                                label={<p className="font-bold text-base">Cidade</p>}
                            >
                                <Select
                                    disabled={estado === undefined ? true : false}
                                    onChange={(e, option) => onChangeCidade(e, option)}
                                    options={optionsCidade}
                                    showSearch
                                    filterOption={(input, option) =>
                                        filterOption(input, option as { label: string; value: string })
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                className="col-span-2"
                                name="bairro"
                                label={<p className="font-bold text-base">Bairro</p>}
                            >
                                <Select
                                    disabled={
                                        estado === undefined || cidade === undefined ? true : false
                                    }
                                    options={optionsBairro}
                                    mode="multiple"
                                    onChange={(e, option) => onChangeBairro(e, option)}
                                    showSearch
                                    filterOption={(input, option) =>
                                        filterOption(input, option as { label: string; value: string })
                                    }
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-between gap-4 pb-3  mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    form.setFieldsValue({
                                        status: null,
                                        modalidade: null,
                                        captador: null,
                                        propietario: null,
                                        tipo: null,
                                        estado: null,
                                        bairro: null,
                                        cidade: null,
                                    });
                                    setEstado(undefined);
                                    setBairro(undefined);
                                    setEstado(undefined);
                                }}
                                className="text-lg font-bold "
                            >
                                Remover filtros
                            </button>
                            <button className="shadow-md bg-verde text-lg font-bold text-white py-1.5 px-12 rounded-xl">
                                filtrar
                            </button>
                        </div>
                    </Form>
                </Modal>
            )}
        </Layout>
    );
}