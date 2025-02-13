import { ConfigProvider, DatePicker, Form, Input, InputNumber, Modal, Select, SelectProps, Tooltip } from "antd";
import { IoMdClose } from "react-icons/io";
import locale from 'antd/locale/pt_BR';
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { api } from "@/services/apiClient";
import { removeAccents } from "@/global/TratamentosDeStrings";
import { FaPlus, FaRegQuestionCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useAtom } from "jotai";
import { atualizarAlugel } from "@/pages/painel-administrativo/alugueis";
const { TextArea } = Input;

interface Props {
    open: boolean
    setOpen: (value: boolean) => void;
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
interface Imovel {
    id: string
    idInterno: string
    numero: string
    logradouro: string
    valor: number | null
    valorCondominio: number | null,
    valorIptu: number | null,
}

interface Finish {
    imovel: string
    locatario: string
    dataContrato: Date
    dataContratoFim: Date
    tempoContrato: number
    proporcional: boolean
    diaVencimento: number
    observacoes: string | null
    tipoRepasse: string | null
    contasApresentar: string[]
    valorAluguel: number
    multaPerc: number
    jurosPerc: number
    taxaAdministrativaPerc: number
    valorAdministracao: number
}


interface ValorExtra {
    descricao: string
    tipo: string
    destinatario: string
    valor: number
}

export default function ModalAdicionarAluguel({ open, setOpen }: Props) {

    const [atualizar,setAtualizar] = useAtom(atualizarAlugel)
    const [form] = Form.useForm()

    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) {
            return false; // ou true, dependendo do seu requisito para opções indefinidas
        }

        const optionLabel = removeAccents(option.label);
        return optionLabel.toLowerCase().includes(removeAccents(input.toLowerCase()));
    };

    useEffect(() => {
        api.post('clientes/filtrar/palavra', { palavra: 'a' }).then((resposta) => {
            setClientes(resposta.data)
        }).catch((error) => {
            console.log('Error fetching data:', error);
        });

        api.post('alugueis/imoveis', { texto: '1' }).then((resposta) => {
            setImoveis(resposta.data)
        })
    }, [])

    const [clientes, setClientes] = useState<Cliente[]>([])
    const [cliente, setCliente] = useState<Cliente>()

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
    const optionsClientes: SelectProps['options'] = clientes?.map(cliente => ({
        label: cliente.nome + (cliente.celular ? ' - ' + cliente.celular : ''),
        value: cliente.id,
        id: cliente.id
    })) || [];



    const [imoveis, setImoveis] = useState<Imovel[]>([])
    const [imovel, setImovel] = useState<Imovel>()

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
        api.post('alugueis/imoveis', { texto: value }).then((resposta) => {
            setImoveis(resposta.data)
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }, [controleImovel]);
    useEffect(() => {
        debouncedSearchImovel(value);
        // Cancel debounce on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [valueImovel, debouncedSearchImovel]);

    const optionsImoveis: SelectProps['options'] = imoveis?.map(imovel => ({
        label: imovel.idInterno + (imovel.logradouro ? ' - ' + imovel.logradouro + (imovel.numero ? ', ' + imovel.numero : '') : ''),
        value: imovel.id,
        id: imovel.id,
        valor: imovel.valor,
        valorIptu: imovel.valorIptu,
        valorCondominio: imovel.valorCondominio
    })) || [];

    const onChangeImovel = (option: any) => {

        form.setFieldsValue({
            valorAluguel: option.valor ?? 0,
            valorCondominio: option.valorCondominio ?? 0,
            valorIptu: option.valorIptu ?? 0,
            taxaAdministrativaPerc: 0,
            valorAdministracao: 0
        });
    }

    const onBlurValor = (valor: string) => {


        const taxa = form.getFieldValue('taxaAdministrativaPerc')

        if (taxa) {
            const resposta = ((parseFloat(valor.replace('.', '').replace(',', '.'))) / 100) * taxa
            form.setFieldValue('valorAdministracao', resposta)
        } else {

        }
    }

    const onBlurTaxa = (valor: string) => {

        const valorAluguel = form.getFieldValue('valorAluguel')

        if (valorAluguel) {
            const resposta = (valorAluguel / 100) * parseFloat(valor.replace(',', '.'))

            form.setFieldValue('valorAdministracao', resposta)
        } else {
            form.setFieldValue('valorAdministracao', 0)
        }
    }

    const onBlurValorAdministracao = (valor: string) => {

        const valorAluguel = form.getFieldValue('valorAluguel')

        if (valorAluguel) {
            const resposta = ((parseFloat(valor.replace('.', '').replace(',', '.'))) / valorAluguel * 100).toFixed(8)

            form.setFieldValue('taxaAdministrativaPerc', resposta)
        } else {
            form.setFieldValue('taxaAdministrativaPerc', 0)
        }
    }


    const [valoresExtra, setValoresExtra] = useState<ValorExtra[]>([])

    const addValorExtra = () => {


        const valor = valoresExtra.length

        setValoresExtra([...valoresExtra, {
            descricao: '',
            tipo: 'ACRESCIMO',
            destinatario: 'LOCADOR',
            valor: 0
        }])

        form.setFieldsValue({
            [valor]: {
                descricao: '',
                valor: 0,
                destinatario: 'LOCADOR',
                operacao: 'ACRESCIMO',
            }
        })


    }

    const removeValorExtra = (index: number) => {


        console.log(index)

        const valor = valoresExtra.filter((valor, numero) => {
            if (numero !== index) {
                return valor
            } else {

            }
        })

        setValoresExtra(valor)

        valor.map((valor, numero) => {
            if (numero < index) {
                form.setFieldsValue({
                    [numero]: {
                        descricao: form.getFieldValue([numero, 'descricao']),
                        valor: form.getFieldValue([numero, 'valor']),
                        destinatario: form.getFieldValue([numero, 'destinatario']),
                        operacao: form.getFieldValue([numero, 'operacao'])
                    }
                })
            } else {
                form.setFieldsValue({
                    [numero]: {
                        descricao: form.getFieldValue([numero + 1, 'descricao']),
                        valor: form.getFieldValue([numero + 1, 'valor']),
                        destinatario: form.getFieldValue([numero + 1, 'destinatario']),
                        operacao: form.getFieldValue([numero + 1, 'operacao'])
                    }
                })
            }

        })
    }

    const onFinish = (valor: any) => {

        const valoresExtraSaida = valoresExtra.map((item, i) => {
            return {
                descricao: valor[i].descricao,
                valor: valor[i].valor,
                destinatario: valor[i].destinatario,
                tipo: valor[i].operacao
            }
        })

        api.post('alugueis', {
            idImovel: valor.imovel,
            idCliente: valor.locatario,
            dataContrato: new Date(valor.dataContrato),
            dataContratoFim: new Date(valor.dataContratoFim),
            tempoContrato: valor.tempoContrato,
            diaVencimento: valor.diaVencimento,
            venceDiaUtil: false,
            proporcional: valor.proporcional,
            contasApresentar: valor.contasApresentar,
            observacoes: valor.observacoes === '' ? null : valor.observacoes,
            valorAluguel: valor.valorAluguel,
            multaPerc: valor.multaPerc,
            jurosPerc: valor.jurosPerc,
            taxaAdministrativaPerc: valor.taxaAdministrativaPerc,
            tipoRepasse: valor.tipoRepasse,
            valoresExtras: valoresExtraSaida
        }).then((resposta) => {
            setOpen(false)
            setAtualizar(!atualizar)
        }).catch((err) => { console.log(err) });
    }

    return (
        <Modal centered width={1100} open={open} onCancel={() => setOpen(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Adicionar Aluguel</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
            <div className="pt-4 pb-6 px-6 h-[550px] overflow-y-auto custom-scrollbar">
                <ConfigProvider locale={locale}>
                    <Form onFinish={onFinish} form={form} layout="vertical" className="">
                        <div className="grid grid-cols-2 gap-x-6">
                            <Form.Item name='imovel' rules={[{ required: true, message: 'Insira o imóvel' }]} initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Imóvel</p>}>
                                <Select
                                    placeholder='informe um caractere'
                                    options={optionsImoveis}
                                    showSearch
                                    onSearch={(e) => onChangeSearchImovel(e)}
                                    onChange={(e, option) => onChangeImovel(option)}
                                    filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                />
                            </Form.Item>
                            <Form.Item name='locatario' rules={[{ required: true, message: 'Insira o locátario' }]} initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Locátario</p>}>
                                <Select
                                    placeholder='informe um caractere'
                                    options={optionsClientes}
                                    showSearch
                                    onSearch={(e) => onChangeSearchCliente(e)}
                                    filterOption={(input, option) => filterOption(input, option as { label: string; value: string })}
                                />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-4 gap-x-6 pt-4">
                            <Form.Item name='dataContrato' rules={[{ required: true, message: 'Insira a data!' }]} initialValue={dayjs()} className="mb-0 min-w-32" label={<p className="font-bold">Aluguél inicia em</p>}>
                                <DatePicker className="w-full" format='DD/MM/YYYY' />
                            </Form.Item>
                            <Form.Item name='dataContratoFim' rules={[{ required: true, message: 'Insira a data!' }]} initialValue={dayjs().add(1, 'year')} className="mb-0 min-w-32" label={<p className="font-bold">Aluguél termina em</p>}>
                                <DatePicker className="w-full" format='DD/MM/YYYY' />
                            </Form.Item>
                            <Form.Item name='tempoContrato' rules={[{ required: true, message: 'Insira o tempo de contrato!' }]} initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Termpo de Contrato (Mêses)</p>}>
                                <InputNumber type="number" className="w-full" />
                            </Form.Item>
                            <Form.Item name='proporcional' initialValue={true} className="mb-0 min-w-32" label={<p className="font-bold">1º aluguel proporcional</p>}>
                                <Select options={[
                                    {
                                        label: 'Sim',
                                        value: true
                                    },
                                    {
                                        label: 'Não',
                                        value: false
                                    }
                                ]} />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 pt-4">
                            <Form.Item name='diaVencimento' initialValue={null} rules={[{ required: true, message: 'Insira a dia!' }]} className="mb-0 min-w-32" label={<p className="font-bold">Dia do Vencimento (Dia do Mês)</p>}>
                                <InputNumber type="number" className="w-full" />
                            </Form.Item>
                            <Form.Item name='tipoRepasse' initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Proprietário deseja receber em</p>}>
                                <Select placeholder='Selecione' options={[
                                    {
                                        label: 'Dinheiro',
                                        value: 'DINHEIRO'
                                    },
                                    {
                                        label: 'Cheque',
                                        value: 'CHEQUE'
                                    },
                                    {
                                        label: 'Depósito',
                                        value: 'DEPOSITO'
                                    },
                                    {
                                        label: 'Boleto',
                                        value: 'BOLETO'
                                    },
                                    {
                                        label: 'PIX',
                                        value: 'PIX'
                                    }

                                ]} />
                            </Form.Item>
                            <Form.Item name='contasApresentar' initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Apresentar no ato do pagamento</p>}>
                                <Select mode="multiple" placeholder='Selecione' options={[
                                    {
                                        label: 'Água',
                                        value: 'AGUA'
                                    },
                                    {
                                        label: 'Energia',
                                        value: 'ENERGIA'
                                    },
                                    {
                                        label: 'Condominío',
                                        value: 'CONDOMINIO'
                                    },
                                ]} />
                            </Form.Item>
                        </div>
                        <div className="pt-4">
                            <Form.Item name='observacoes' initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Observações</p>}>
                                <TextArea
                                    showCount
                                    maxLength={250}
                                    rows={2}
                                />
                            </Form.Item>
                        </div>

                        <div className="pt-4 grid grid-cols-5 gap-x-3">
                            <Form.Item name='valorAluguel' rules={[{ required: true, message: 'Isira o valor do aluguel!' }]} className="mb-0 min-w-32" label={<p className="font-bold">Valor do Aluguel</p>}>
                                <InputNumber
                                    className="w-full"
                                    decimalSeparator=","
                                    precision={2}
                                    prefix="R$"
                                    onBlur={(e) => onBlurValor(e.target.value)}
                                    formatter={(value) =>
                                        value
                                            ? value
                                                .toString()
                                                .replace(/\./g, ",") // Troca ponto por vírgula para decimal
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".") // Adiciona ponto como separador de milhares
                                            : "0,00"
                                    }
                                    parser={(value) => {
                                        if (!value) return 0;
                                        return Number(
                                            value
                                                .replace(/R\$\s?/g, "") // Remove "R$"
                                                .replace(/\./g, "") // Remove separador de milhares
                                                .replace(",", ".") // Transforma vírgula decimal em ponto
                                        );
                                    }}

                                />
                            </Form.Item>
                            <Form.Item name='multaPerc' rules={[{ required: true, message: 'Insira a multa' }]} initialValue={0} className="mb-0 min-w-32" label={<p className="font-bold">Multa (%)</p>}>
                                <InputNumber
                                    className="w-full"
                                    decimalSeparator=","
                                />
                            </Form.Item>
                            <Form.Item name='jurosPerc' rules={[{ required: true, message: 'Insira o juros' }]} initialValue={0} className="mb-0 min-w-32" label={<p className="font-bold">Juros/Dia (%)</p>}>
                                <InputNumber
                                    className="w-full"
                                    decimalSeparator=","
                                />
                            </Form.Item>
                            <Form.Item name='taxaAdministrativaPerc' rules={[{ required: true, message: 'Insira a taxa' }]} initialValue={0} className="mb-0 min-w-32" label={<p className="font-bold">Taxa Administração (%)</p>}>
                                <InputNumber
                                    className="w-full"
                                    decimalSeparator=","
                                    onBlur={(e) => onBlurTaxa(e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item name='valorAdministracao' rules={[{ required: true, message: 'Insira o valor' }]} initialValue={'0'} className="mb-0 min-w-32" label={<p className="font-bold">Valor Administração</p>}>
                                <InputNumber
                                    className="w-full"
                                    decimalSeparator=","
                                    precision={2}
                                    prefix="R$"
                                    onBlur={(e) => onBlurValorAdministracao(e.target.value)}
                                    formatter={(value) =>
                                        value
                                            ? value
                                                .toString()
                                                .replace(/\./g, ",") // Troca ponto por vírgula para decimal
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".") // Adiciona ponto como separador de milhares
                                            : "0,00"
                                    }
                                    parser={(value) => {
                                        if (!value) return 0;
                                        return Number(
                                            value
                                                .replace(/R\$\s?/g, "") // Remove "R$"
                                                .replace(/\./g, "") // Remove separador de milhares
                                                .replace(",", ".") // Transforma vírgula decimal em ponto
                                        );
                                    }}

                                />
                            </Form.Item>
                        </div>
                        <div className="pt-4">
                            <p className="font-bold text-base">Valores extras</p>
                            <div className="space-y-3 mt-3">
                                {valoresExtra.length > 0 &&
                                    valoresExtra.map((valorExtra, index) => (
                                        <div key={index} className="grid grid-cols-9 gap-x-4 border-2 border-verde/40 px-6 pt-2 pb-4 rounded-md ">
                                            <Form.Item name={[index, 'descricao']} rules={[{ required: true, message: 'Insira o nome' }]} initialValue={''} className="mb-0 col-span-2" label={<p className="font-bold flex gap-x-1 items-center">Nome <Tooltip title='Exemplos: Água, Energia, Condomínio'><FaRegQuestionCircle /></Tooltip></p>} >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item name={[index, 'valor']} rules={[{ required: true, message: 'Insira o valor' }]} initialValue={0} className="mb-0 col-span-2" label={<p className="font-bold">Valor</p>}>
                                                <InputNumber
                                                    className="w-full"
                                                    decimalSeparator=","
                                                    precision={2}
                                                    prefix="R$"
                                                    formatter={(value) =>
                                                        value
                                                            ? value
                                                                .toString()
                                                                .replace(/\./g, ",") // Troca ponto por vírgula para decimal
                                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".") // Adiciona ponto como separador de milhares
                                                            : "0,00"
                                                    }
                                                    parser={(value) => {
                                                        if (!value) return 0;
                                                        return Number(
                                                            value
                                                                .replace(/R\$\s?/g, "") // Remove "R$"
                                                                .replace(/\./g, "") // Remove separador de milhares
                                                                .replace(",", ".") // Transforma vírgula decimal em ponto
                                                        );
                                                    }}
                                                />
                                            </Form.Item>
                                            <Form.Item name={[index, 'operacao']} initialValue={'ACRESCIMO'} className="mb-0 col-span-2" label={<p className="font-bold">Operação</p>}>
                                                <Select
                                                    options={[
                                                        {
                                                            label: 'Despesa',
                                                            value: 'ACRESCIMO'
                                                        },
                                                        {
                                                            label: 'Receita',
                                                            value: 'DECRESCIMO'
                                                        }
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item name={[index, 'destinatario']} initialValue={'LOCADOR'} className="mb-0 col-span-2" label={<p className="font-bold">Destinatário</p>}>
                                                <Select
                                                    options={[
                                                        {
                                                            label: 'Locador',
                                                            value: 'LOCADOR'
                                                        },
                                                        {
                                                            label: 'Imobiliaria',
                                                            value: 'IMOBILIARIA'
                                                        }
                                                    ]}
                                                />
                                            </Form.Item>
                                            
                                            <div className="flex justify-center items-center">
                                                <button onClick={() => removeValorExtra(index)} className="text-red-500" type="button"><MdClose size={28} /></button>
                                            </div>
                                        </div>
                                    ))
                                }

                                <button type="button" onClick={addValorExtra} className="flex mt-3 px-12 bg-verde text-white py-2 rounded-md items-center gap-x-2"><FaPlus /> Adicionar valor extra </button>

                            </div>

                        </div>
                        <div className="flex justify-center items-center gap-x-4 mt-8">
                            <button type="button" onClick={() => setOpen(false)} className="px-6 py-1 text-base rounded-md font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                Cancelar
                            </button>
                            <button className="px-8 py-1 text-base rounded-md font-bold border-2 bg-verde text-white border-verde">
                                Salvar
                            </button>
                        </div>
                    </Form>
                </ConfigProvider>
            </div>

        </Modal>
    )
}