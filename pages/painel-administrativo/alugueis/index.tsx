import Layout from "@/components/Layout";
import { ConfigProvider, DatePicker, Form, Select, SelectProps, Tooltip } from "antd";
import locale from 'antd/locale/pt_BR';
import { FaEdit, FaFilter, FaPrint } from "react-icons/fa";
import dayjs from "dayjs";
import { MdOutlineBedroomParent } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import ModalAdicionarAluguel from "@/components/Alugueis/ModalAdicionarAluguel";
import { api } from "@/services/apiClient";
import ModalLiquidarPagamento from "@/components/Alugueis/ModalLiquidarPagamento";
import ModalEditarParcela from "@/components/Alugueis/ModalEditarParcela";
import ModalLiquidarRepasse from "@/components/Alugueis/ModalLiquidarRepasse";
import { atom, useAtom } from "jotai";
import { removeAccents } from "@/global/TratamentosDeStrings";
import _ from "lodash";


interface Filtro {
    vencimentoDe: Date
    vencimentoAte: Date
    statusPago: string
    repassePago: string
    imovel: string | null
    locador: string | null
    locatario: string | null
}

interface Parcela {
    idParcela: number
    idAluguel: number
    valorIptu: number | null
    valorCondominio: number | null
    idLocador: string
    nomeLocador: string
    idLocatario: string
    nomeLocatario: string
    telefoneLocatario: string
    idImovel: string
    idInterno: string
    logradouro: string
    numero: string
    mesAno: string
    dataVencimento: Date
    dataPagamento: Date | null
    dataRepasse: Date | null
    parcela: number
    valorBase: number
    valorAcrescimoTotal: number
    valorDecrescimoTotal: number
    total: number
}

interface Locador {
    id: string
    nome: string
}

interface Locatario {
    id: string
    nome: string
}

interface Imovel {
    id: string
    numero: string | null
    idInterno: string
    logradouro: string | null
}
export const atualizarAlugel = atom(false)
export default function Alugueis() {

    const [openAdicionar, setOpenAdicionar] = useState<boolean>(false)
    const [parcelas, setParcelas] = useState<Parcela[]>([])
    const [atualizar, setAtualizar] = useAtom(atualizarAlugel)
    const [filtro, setFiltro] = useState<Filtro>({
        vencimentoDe: new Date(dayjs().startOf("month").toString()),
        vencimentoAte: new Date(dayjs().endOf("month").toString()),
        statusPago: 'TODOS',
        repassePago: 'TODOS',
        imovel: null,
        locador: null,
        locatario: null,
    })
    const [openLiquidarPagamento, setOpenLiquidarPagamento] = useState<boolean>(false)
    const [openLiquidarRepasse, setOpenLiquidarRepasse] = useState<boolean>(false)
    const [editarParcela, setEditarParcela] = useState<boolean>(false)
    const [idParcela, setIdParcela] = useState<number>(0)


    useEffect(() => {
        api.post('alugueis/parcelas/filtro', {
            vencimentoDe: new Date(filtro.vencimentoDe),
            vencimentoAte: new Date(filtro.vencimentoAte),
            statusPagamento: filtro.statusPago ? filtro.statusPago : undefined,
            statusRepasse: filtro.repassePago ? filtro.repassePago : undefined,
            imovel: filtro.imovel ? filtro.imovel : undefined,
            locador: filtro.locador ? filtro.locador : undefined,
            locatario: filtro.locatario ? filtro.locatario : undefined,
        }).then((resposta) => {
            setParcelas(resposta.data);
            console.log(resposta.data)
        })
    }, [atualizar])

    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) {
            return false; // ou true, dependendo do seu requisito para opções indefinidas
        }

        const optionLabel = removeAccents(option.label);
        return optionLabel.toLowerCase().includes(removeAccents(input.toLowerCase()));
    };

    const [locatarios, setLocatarios] = useState<Locatario[]>([])
    const [locadores, setLocadores] = useState<Locador[]>([])
    const [imoveis, setImoveis] = useState<Imovel[]>([])
    useEffect(() => {
        api.post('alugueis/locadores', { texto: ' ' }).then((resposta) => {
            setLocadores(resposta.data)
        }).catch((error) => {
            console.log('Error fetching data:', error);
        });

        api.post('alugueis/locatarios', { texto: ' ' }).then((resposta) => {
            setLocatarios(resposta.data)
        }).catch((error) => {
            console.log('Error fetching data:', error);
        });

        api.post('alugueis/imoveis-alugados', { texto: ' ' }).then((resposta) => {
            setImoveis(resposta.data)
        }).catch((error) => {
            console.log('Error fetching data:', error);
        });

    }, [])


    const [valueLocador, setValueLocador] = useState<string>('')
    const [controleLocador, setControleLocador] = useState<boolean>(false)


    function onChangeSearchLocador(e: string) {
        setValueLocador(e)
    }
    const debouncedSearch = useCallback(
        _.debounce((value) => {
            setValueLocador(value)
            setControleLocador((prevControle) => !prevControle);
        }, 300),
        []
    );
    useEffect(() => {
        api.post('alugueis/locadores', { texto: valueLocador }).then((resposta) => {
            setLocadores(resposta.data)
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }, [controleLocador]);
    useEffect(() => {
        debouncedSearch(valueLocador);
        // Cancel debounce on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [valueLocador, debouncedSearch]);
    const optionsLocadores: SelectProps['options'] = locadores?.map(locador => ({
        label: locador.nome,
        value: locador.id,
        id: locador.id
    })) || [];


    const [valueLocatario, setValueLocatario] = useState<string>('')
    const [controleLocatario, setControleLocatario] = useState<boolean>(false)


    function onChangeSearchLocatario(e: string) {
        setValueLocatario(e)
    }
    const debouncedSearchLocatario = useCallback(
        _.debounce((value) => {
            setValueLocatario(value)
            setControleLocatario((prevControle) => !prevControle);
        }, 300),
        []
    );
    useEffect(() => {
        api.post('alugueis/locatarios', { texto: valueLocatario }).then((resposta) => {
            setLocatarios(resposta.data)
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }, [controleLocatario]);
    useEffect(() => {
        debouncedSearchLocatario(valueLocatario);
        // Cancel debounce on unmount
        return () => {
            debouncedSearchLocatario.cancel();
        };
    }, [valueLocatario, debouncedSearchLocatario]);
    const optionsLocatarios: SelectProps['options'] = locatarios?.map(locatario => ({
        label: locatario.nome,
        value: locatario.id,
        id: locatario.id
    })) || [];


    const [valueImovel, setValueImovel] = useState<string>('')
    const [controleImovel, setControleImovel] = useState<boolean>(false)


    function onChangeSearchImovel(e: string) {
        setValueImovel(e)
    }
    const debouncedSearchImovel = useCallback(
        _.debounce((value) => {
            setValueImovel(value)
            setControleImovel((prevControle) => !prevControle);
        }, 300),
        []
    );
    useEffect(() => {
        api.post('alugueis/imoveis-alugados', { texto: valueImovel }).then((resposta) => {
            setImoveis(resposta.data)
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }, [controleImovel]);
    useEffect(() => {
        debouncedSearchImovel(valueImovel);
        // Cancel debounce on unmount
        return () => {
            debouncedSearchImovel.cancel();
        };
    }, [valueImovel, debouncedSearchImovel]);
    const optionsImoveis: SelectProps['options'] = imoveis?.map(imovel => ({
        label: imovel.idInterno + (imovel.logradouro ? ' - ' + imovel.logradouro + (imovel.numero ? ', ' + imovel.numero : '') : ''),
        value: imovel.id,
        id: imovel.id
    })) || [];


    const onFinish = (valor: Filtro) => {

        setFiltro(valor);

        api.post('alugueis/parcelas/filtro', {
            vencimentoDe: new Date(valor.vencimentoDe),
            vencimentoAte: new Date(valor.vencimentoAte),
            statusPagamento: valor.statusPago ? valor.statusPago : undefined,
            statusRepasse: valor.repassePago ? valor.repassePago : undefined,
            imovel: valor.imovel ? valor.imovel : undefined,
            locador: valor.locador ? valor.locador : undefined,
            locatario: valor.locatario ? valor.locatario : undefined,
        }).then((resposta) => {
            setParcelas(resposta.data);
            console.log(resposta.data)
        })
    }
    return (
        <Layout>
            <div className="pt-2 px-6 overflow-y-auto custom-scrollbar h-[calc(100dvh-60px)]">
                {openAdicionar && (
                    <ModalAdicionarAluguel open={openAdicionar} setOpen={setOpenAdicionar} />
                )}
                {openLiquidarPagamento && (
                    <ModalLiquidarPagamento open={openLiquidarPagamento} setOpen={setOpenLiquidarPagamento} idParcela={idParcela} />
                )}
                {openLiquidarRepasse && (
                    <ModalLiquidarRepasse open={openLiquidarRepasse} setOpen={setOpenLiquidarRepasse} idParcela={idParcela} />
                )}
                {editarParcela && (
                    <ModalEditarParcela open={editarParcela} setOpen={setEditarParcela} idParcela={idParcela} />
                )}
                <div className="h-[200px]">
                    <div className="">
                        <button onClick={() => setOpenAdicionar(true)} className="px-6 py-2 bg-verde rounded-md text-white">Adicionar Aluguel</button>
                    </div>
                    <div className="border-2 border-verde rounded-md mt-3 ">
                        <div className="bg-verde text-white px-4 py-2 flex gap-x-2 items-center">
                            <FaFilter />
                            <p className="font-bold text-lg">Filtros</p>
                        </div>
                        <ConfigProvider locale={locale}>
                            <Form onFinish={onFinish} layout="vertical" className="mt-3 px-4">
                                <div className="flex items-end gap-x-4 pb-4 ">
                                    <Form.Item name='vencimentoDe' rules={[{ required: true, message: 'Insira a data!' }]} initialValue={dayjs().startOf("month")} className="mb-0 min-w-32" label={<p className="font-bold">Vencimento de</p>}>
                                        <DatePicker format='DD/MM/YYYY' />
                                    </Form.Item>
                                    <Form.Item name='vencimentoAte' rules={[{ required: true, message: 'Insira a data!' }]} initialValue={dayjs().endOf("month")} className="mb-0 min-w-32" label={<p className="font-bold">Vencimento até</p>}>
                                        <DatePicker format='DD/MM/YYYY' />
                                    </Form.Item>
                                    <Form.Item name='statusPago' initialValue={"TODOS"} className="mb-0 min-w-32" label={<p className="font-bold">Pagamento</p>}>
                                        <Select options={[
                                            {
                                                label: 'Todos',
                                                value: 'TODOS'
                                            },
                                            {
                                                label: 'Em Aberto',
                                                value: 'EM_ABERTO'
                                            },
                                            {
                                                label: 'Pago',
                                                value: 'PAGO'
                                            }
                                        ]} />
                                    </Form.Item>
                                    <Form.Item name='repassePago' initialValue={"TODOS"} className="mb-0 min-w-32" label={<p className="font-bold">Repasse</p>}>
                                        <Select options={[
                                            {
                                                label: 'Todos',
                                                value: 'TODOS'
                                            },
                                            {
                                                label: 'Em Aberto',
                                                value: 'EM_ABERTO'
                                            },
                                            {
                                                label: 'Pago',
                                                value: 'PAGO'
                                            }
                                        ]} />
                                    </Form.Item>
                                    <Form.Item name='imovel' className="mb-0 w-full" label={<p className="font-bold">Imóvel</p>}>
                                        <Select
                                            allowClear
                                            popupMatchSelectWidth={false}
                                            placeholder='informe um caractere'
                                            options={optionsImoveis}
                                            showSearch
                                            onSearch={(e) => onChangeSearchImovel(e)}
                                            onChange={(e, option) => onChangeSearchImovel(e)}
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                        />
                                    </Form.Item>
                                    <Form.Item name='locador' className="mb-0 w-full" label={<p className="font-bold">Locador</p>}>
                                        <Select
                                            allowClear
                                            popupMatchSelectWidth={false}
                                            placeholder='informe um caractere'
                                            options={optionsLocadores}
                                            showSearch
                                            onSearch={(e) => onChangeSearchLocador(e)}
                                            onChange={(e, option) => onChangeSearchLocador(e)}
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                        />
                                    </Form.Item>
                                    <Form.Item name='locatario' className="mb-0 w-full" label={<p className="font-bold">Locátario</p>}>
                                        <Select
                                            allowClear
                                            popupMatchSelectWidth={false}
                                            placeholder='informe um caractere'
                                            options={optionsLocatarios}
                                            showSearch
                                            onSearch={(e) => onChangeSearchLocatario(e)}
                                            onChange={(e, option) => onChangeSearchLocatario(e)}
                                            filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                        />
                                    </Form.Item>
                                    <button className="px-6 py-1.5 rounded-md bg-verde text-white">
                                        Filtrar
                                    </button>
                                </div>


                            </Form>
                        </ConfigProvider>
                    </div>
                </div>

                <div className="border-2 border-verde rounded-md mt-3 mb-6">
                    <div className="bg-verde text-white px-4 py-2 flex gap-x-2 items-center">
                        <MdOutlineBedroomParent size={16} />
                        <p className="font-bold text-lg">Aluguéis</p>
                    </div>
                    <div>
                        <table className="w-full">
                            <thead className="rounded-xl bg-white ">
                                <tr className="">
                                    <th className="py-1 px-4 w-28">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Vencimento
                                        </p>
                                    </th>


                                    <th className="py-1 px-4 w-28">
                                        <p className="font-bold text-start text-md text-wblackleading-none ">
                                            Referência
                                        </p>
                                    </th>
                                    <th className="py-1 px-4 w-28">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Parcela
                                        </p>
                                    </th>
                                    <th className="py-1 px-2">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Locatário
                                        </p>

                                    </th>
                                    <th className="py-1 px-2">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Imóvel
                                        </p>
                                    </th>
                                    <th className="py-1 px-2 w-40">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Valor
                                        </p>
                                    </th>
                                    <th className="py-1 px-2 w-[200px]">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Pagamento
                                        </p>
                                    </th>
                                    <th className="py-1 px-2 w-[200px]">
                                        <p className="font-bold text-start text-md text-black leading-none ">
                                            Repasse
                                        </p>
                                    </th>
                                    <th className="px-4">
                                        <p className="font-bold text-start text-md text-black leading-none ">Ação</p>
                                    </th>

                                </tr>
                            </thead>
                            <tbody>
                                {parcelas.length > 0 ?
                                    parcelas.map((parcela) => (
                                        <tr key={parcela.idParcela} className="border-t-2 border-verde/30 py-2">
                                            <td className="px-4 py-2">
                                                <p className="text-sm text-center ">{dayjs(parcela.dataVencimento).add(3, 'hour').format('DD/MM/YYYY')}</p>
                                            </td>
                                            <td className="px-4 py-2">
                                                <p className="text-sm text-center">{parcela.mesAno}</p>
                                            </td>
                                            <td className="px-4 py-2">
                                                <p className="text-sm text-center">{parcela.parcela}</p>
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <div>
                                                    <p className="text-[13px] ">{parcela.nomeLocatario}</p>
                                                    {parcela.telefoneLocatario &&
                                                        <p className="text-[13px] ">{parcela.telefoneLocatario}</p>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <div>
                                                    <p className="text-[13px]">{parcela.idInterno} - {parcela.logradouro}<span>{parcela.numero ? ', ' + parcela.numero : ''}</span></p>
                                                    {parcela.nomeLocador && (
                                                        <p className="text-[13px] text-green-900">{parcela.nomeLocador}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-sm">{(parcela.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                            </td>
                                            <td className="px-2">
                                                <div>
                                                    {parcela.dataPagamento ?
                                                        <div className="flex gap-x-2 items-center">
                                                            <Tooltip title={<p>Pagamento em {dayjs(parcela.dataPagamento).add(3, 'hour').format('DD/MM/YYYY')}</p>}>
                                                                <button onClick={() => { setOpenLiquidarPagamento(true), setIdParcela(parcela.idParcela) }} className="bg-green-500 border-2 text-sm text-white px-2 py-0.5 rounded-md">
                                                                    Liquidado
                                                                </button>
                                                            </Tooltip>

                                                            {/*<Tooltip title='Imprimir recibo do pagamento'>
                                                                <button>
                                                                    <FaPrint size={18} />
                                                                </button>
                                                            </Tooltip>*/}
                                                        </div>
                                                        : <div>
                                                            <Tooltip title='Efetuar o pagamento'>
                                                                <button onClick={() => { setOpenLiquidarPagamento(true), setIdParcela(parcela.idParcela) }} className="text-sm px-2 py-0.5  border-2 border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white">
                                                                    Liquidar
                                                                </button>
                                                            </Tooltip>

                                                        </div>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-2">
                                                <div>
                                                    {parcela.dataRepasse ?
                                                        <div className="flex gap-x-2 items-center">
                                                            <Tooltip title={<p>Repasse em {dayjs(parcela.dataRepasse).add(3, 'hour').format('DD/MM/YYYY')}</p>}>
                                                                <button className="bg-green-500 border-2 text-sm text-white px-2 py-0.5 rounded-md">
                                                                    Liquidado
                                                                </button>
                                                            </Tooltip>

                                                            {/*<Tooltip title='Imprimir recibo do repasse'>
                                                                <button>
                                                                    <FaPrint size={18} />
                                                                </button>
                                                            </Tooltip>*/}

                                                        </div>
                                                        : <div>
                                                            <Tooltip title='Efetuar o repasse'>
                                                                <button onClick={() => { setOpenLiquidarRepasse(true), setIdParcela(parcela.idParcela) }} className="text-sm px-2 py-0.5  border-2 border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white">
                                                                    Liquidar
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 mx-auto ">
                                                <button onClick={() => { setIdParcela(parcela.idParcela), setEditarParcela(true) }} type="button" className="" >
                                                    <Tooltip title='Editar parcela'>
                                                        <FaEdit size={20} />
                                                    </Tooltip>
                                                </button>

                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr className="">
                                        <td className="text-center pt-4 pb-4 border-t-2 border-verde/30" colSpan={9}>Nenhuma Parcela para este filtro</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </Layout>
    )
}