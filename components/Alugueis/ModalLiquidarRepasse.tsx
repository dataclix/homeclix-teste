import { api } from "@/services/apiClient";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Dados } from "./ModalEditarParcela";
import dayjs from "dayjs";
import { result } from "lodash";
const { TextArea } = Input;

interface Props {
    open: boolean
    setOpen: (value: boolean) => void;
    idParcela: number
}
export default function ModalLiquidarRepasse({ open, setOpen, idParcela }: Props) {

    const [dados, setDados] = useState<Dados>()
    const [diasAtrasados, setDiasAtrasados] = useState<number>(0)
    const [valorTotal, setValorTotal] = useState<number>(0)
    const [valorImobiliaria, setValorImobiliaria] = useState<number>(0)
    const [valorPropietario, setValorPropietario] = useState<number>(0)

    const [form] = Form.useForm()

    useEffect(() => {

        async function fetchData() {
            const resposta = await api.get('alugueis/parcela/' + idParcela)
            console.log(resposta.data)

            setDados(resposta.data)

            let valor = resposta.data.valor

            for (let i = 0; i < resposta.data.valoresExtras.length; i++) {
                if (resposta.data.valoresExtras[i].tipo === 'ACRESCIMO') {
                    valor = valor + resposta.data.valoresExtras[i].valor
                } else {
                    valor = valor - resposta.data.valoresExtras[i].valor
                }
            }

            setValorTotal(valor)

            form.setFieldsValue({
                imovel: resposta.data.imovel.idInterno + ' - ' + resposta.data.imovel.logradouro,
                locador: resposta.data.locador.nome + (resposta.data.locador.celular ? ' - ' + resposta.data.locador.celular : ''),
                locatario: resposta.data.locatario.nome + (resposta.data.locatario.celular ? ' - ' + resposta.data.locatario.celular : ''),
                vencimento: dayjs(resposta.data.dataVencimento).add(3, 'hours').format('DD/MM/YYYY'),
                valorAluguel: resposta.data.valor,
                parcela: resposta.data.parcela,
                referencia: resposta.data.mesAno,
            })

            if (resposta.data.dataPagamento) {
                const data1 = dayjs(resposta.data.dataVencimento).add(3, 'hours').startOf('day');
                const data2 = dayjs(resposta.data.dataPagamento).add(3, 'hours').startOf('day');

                const diferenca = data2.diff(data1, 'day');
                if (diferenca > 0) {
                    setDiasAtrasados(diferenca)
                }

                form.setFieldValue('dataPagamento', dayjs(resposta.data.dataPagamento).add(3, 'hours').format('DD/MM/YYYY'))
            }

            const aluguelImobiliaria = ((resposta.data.valor / 100) * resposta.data.taxaAdministrativaPerc)
            const aluguelProprietario = (resposta.data.valor - aluguelImobiliaria)


            let valorImobiliaria = aluguelImobiliaria

            for (let i = 0; i < resposta.data.valoresExtras.length; i++) {
                if (resposta.data.valoresExtras[i].destinatario === 'IMOBILIARIA') {
                    if (resposta.data.valoresExtras[i].tipo === 'ACRESCIMO') {
                        valorImobiliaria = valorImobiliaria + resposta.data.valoresExtras[i].valor
                    } else {
                        valorImobiliaria = valorImobiliaria - resposta.data.valoresExtras[i].valor
                    }
                }

            }

            setValorImobiliaria(valorImobiliaria)

            let valorPropietario = aluguelProprietario

            for (let i = 0; i < resposta.data.valoresExtras.length; i++) {
                if (resposta.data.valoresExtras[i].destinatario === 'LOCADOR') {
                    if (resposta.data.valoresExtras[i].tipo === 'ACRESCIMO') {
                        valorPropietario = valorPropietario + resposta.data.valoresExtras[i].valor
                    } else {
                        valorPropietario = valorPropietario - resposta.data.valoresExtras[i].valor
                    }
                }
            }

            setValorPropietario(valorPropietario)

            form.setFieldsValue({
                aluguelImobiliaria: aluguelImobiliaria,
                aluguelProprietario: aluguelProprietario
            })
            resposta.data.valoresExtras.map((extra: any) => {
                if (extra.id) {
                    if (extra.destinatario === 'LOCADOR') {
                        form.setFieldsValue({
                            [extra.id]: {
                                imobiliaria: 0,
                                propietario: extra.valor
                            }
                        })
                    } else {
                        form.setFieldsValue({
                            [extra.id]: {
                                imobiliaria: extra.valor,
                                propietario: 0
                            }
                        })
                    }

                }

            })



        }

        fetchData()

    }, [idParcela])



    const onFinish = (valor: any) => {
        console.log(valor)
        if (dados) {
            const valores = dados.valoresExtras.map((extra) => {
                if (extra.id) {
                    const imobiliaria = valor[extra.id].imobiliaria ? valor[extra.id].imobiliaria : 0
                    const proprietario = valor[extra.id].proprietario ? valor[extra.id].proprietario : 0

                    return {
                        idValorExtra: extra.id,
                        repasseImobiliaria: imobiliaria,
                        repasseLocador: proprietario
                    }
                }

            })

            api.post('alugueis/liquidar/repasse/' + dados.id, {
                dataRepasse: new Date(valor.dataRepasse),
                observacaoRepasse: valor.observacoes,
                tipoRepasse: valor.tipo,
                valorRepasseImobiliaria: valor.aluguelImobiliaria,
                valorRepasseLocador: valor.aluguelProprietario ,
                valores: valores
            }).then((resposta) => { console.log(resposta) }).catch((err) => { console.log(err) })
        }


    }

    const onBlurValor = (valor: any, id: number, tipo: string) => {
        if (dados) {
            if (tipo === 'imobiliaria') {
                if (id === 0) {
                    let valorTotal = parseFloat(valor.replace('.', '').replace(',', '.'))
                    dados.valoresExtras.map((extra) => {
                        if (extra.tipo === 'ACRESCIMO') {
                            const valor = form.getFieldValue([extra.id, 'imobiliaria'])
                            valorTotal = valorTotal + (valor ? valor : 0)
                        } else {
                            const valor = form.getFieldValue([extra.id, 'imobiliaria'])
                            valorTotal = valorTotal - (valor ? valor : 0)
                        }
                    })

                    setValorImobiliaria(valorTotal)
                } else {
                    let valorTotal = form.getFieldValue('aluguelImobiliaria')
                    dados.valoresExtras.map((extra) => {
                        if (extra.tipo === 'ACRESCIMO') {
                            if (extra.id === id) {
                                const teste = parseFloat(valor.replace('.', '').replace(',', '.'))
                                valorTotal = valorTotal + (teste ? teste : 0)
                            } else {
                                const valor = form.getFieldValue([extra.id, 'imobiliaria'])
                                valorTotal = valorTotal + (valor ? valor : 0)
                            }

                        } else {
                            if (extra.id === id) {
                                const teste = parseFloat(valor.replace('.', '').replace(',', '.'))
                                valorTotal = valorTotal - (teste ? teste : 0)
                            } else {
                                const valor = form.getFieldValue([extra.id, 'imobiliaria'])
                                valorTotal = valorTotal - (valor ? valor : 0)
                            }
                        }
                    })

                    setValorImobiliaria(valorTotal)
                }
            } else {
                if (id === 0) {
                    let valorTotal = parseFloat(valor.replace('.', '').replace(',', '.'))
                    dados?.valoresExtras.map((extra) => {
                        if (extra.tipo === 'ACRESCIMO') {
                            const valor = form.getFieldValue([extra.id, 'proprietario'])
                            valorTotal = valorTotal + (valor ? valor : 0)
                        } else {
                            const valor = form.getFieldValue([extra.id, 'proprietario'])
                            valorTotal = valorTotal + (valor ? valor : 0)
                        }
                    })

                    setValorPropietario(valorTotal)
                } else {
                    let valorTotal = form.getFieldValue('aluguelProprietario')
                    dados.valoresExtras.map((extra) => {
                        if (extra.tipo === 'ACRESCIMO') {
                            if (extra.id === id) {
                                const teste = parseFloat(valor.replace('.', '').replace(',', '.'))
                                valorTotal = valorTotal + (teste ? teste : 0)
                            } else {
                                const valor = form.getFieldValue([extra.id, 'proprietario'])
                                valorTotal = valorTotal + (valor ? valor : 0)
                            }

                        } else {
                            if (extra.id === id) {
                                const teste = parseFloat(valor.replace('.', '').replace(',', '.'))
                                valorTotal = valorTotal - (teste ? teste : 0)
                            } else {
                                const valor = form.getFieldValue([extra.id, 'proprietario'])
                                valorTotal = valorTotal - (valor ? valor : 0)
                            }
                        }
                    })

                    setValorPropietario(valorTotal)
                }
            }
        }

    }
    return (
        <Modal centered width={800} open={open} onCancel={() => setOpen(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Efetuar Repasse</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
            {dados && (
                <Form form={form} onFinish={onFinish} layout="vertical" className="px-6 pb-6 max-h-[550px] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-x-4" >

                        <Form.Item name={'locador'} className="mb-0 " label={<p className="font-bold flex gap-x-1 items-center">Locador</p>} >
                            <Input className="" disabled={true} />
                        </Form.Item>
                        <Form.Item name={'locatario'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Locatário</p>} >
                            <Input className="" disabled={true} />
                        </Form.Item>



                    </div>
                    <div className="pt-4">
                        <Form.Item name={'imovel'} className="mb-0 " label={<p className="font-bold flex gap-x-1 items-center">Imóvel</p>} >
                            <Input className="" disabled={true} />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-4 gap-x-4 pt-4">
                        <Form.Item name='vencimento' className="mb-0 min-w-32" label={<p className="font-bold">Vencimento</p>}>
                            <Input className="w-full" disabled={true} />
                        </Form.Item>
                        <Form.Item name={'parcela'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Parcela</p>} >
                            <Input disabled={true} />
                        </Form.Item>
                        <Form.Item name={'referencia'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Referência</p>} >
                            <Input disabled={true} />
                        </Form.Item>
                        <div>
                            <Form.Item name='dataPagamento' className="mb-0 min-w-32" label={<p className="font-bold">Data Pagamento</p>}>
                                <Input className="w-full" disabled={true} />
                            </Form.Item>
                            {diasAtrasados > 0 && (<p className="text-[11px] text-red-500">({diasAtrasados} dias atrasados)</p>)}
                        </div>
                    </div>
                    <div className=" mt-4">
                        <div>
                            <div className="border-2 border-verde/40 rounded-md ">
                                <div className="grid grid-cols-4 bg-verde/70 text-white pl-4">
                                    <p>Descrição</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">Valor</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">Imobiliária</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">Propriétario</p>
                                </div>
                                <div className="grid grid-cols-4 border-b-2 border-verde/40 pl-4 ">
                                    <p className="py-0.5">Aluguel</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">+ {dados.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                    <Form.Item name='aluguelImobiliaria' className="mb-0 border-l-2  border-verde/40 " >
                                        <InputNumber
                                            className="w-full"
                                            decimalSeparator=","
                                            precision={2}
                                            prefix="R$"
                                            onBlur={(e) => onBlurValor(e.target.value, 0, 'imobiliaria')}
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
                                    <Form.Item name='aluguelProprietario' className="mb-0 border-l-2  border-verde/40 ">
                                        <InputNumber
                                            className="w-full"
                                            decimalSeparator=","
                                            precision={2}
                                            onBlur={(e) => onBlurValor(e.target.value, 0, 'proprietario')}
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
                                </div>
                                {dados.valoresExtras.map((valor, index) => (
                                    <div key={index} className="grid grid-cols-4 border-b-2 border-verde/40 pl-4 ">
                                        <p className="py-0.5">{valor.descricao}</p>
                                        <p className="border-l-2 px-4 border-verde/40 py-0.5">{valor.tipo === 'ACRESCIMO' ? '+ ' : '- '} {valor.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                        <Form.Item name={[(valor.id ? valor.id : index), 'imobiliaria']} className="mb-0 border-l-2  border-verde/40 " >
                                            <InputNumber
                                                className="w-full"
                                                decimalSeparator=","
                                                onBlur={(e) => onBlurValor(e.target.value, (valor.id ? valor.id : index), 'imobiliaria')}
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
                                        <Form.Item name={[(valor.id ? valor.id : index), 'proprietario']} className="mb-0 border-l-2  border-verde/40 ">
                                            <InputNumber
                                                className="w-full"
                                                decimalSeparator=","
                                                precision={2}
                                                onBlur={(e) => onBlurValor(e.target.value, (valor.id ? valor.id : index), 'proprietario')}
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
                                    </div>
                                ))}
                                <div className="grid grid-cols-4 bg-verde/70 rounded-b-md text-white pl-4 ">
                                    <p className="py-0.5 col-span-1">Total</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">+ {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">+ {valorImobiliaria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">+ {valorPropietario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                </div>
                            </div>

                        </div>


                    </div>
                    <div className="grid grid-cols-2 gap-x-6 pt-4">
                        <div>
                            <Form.Item name='observacoes' initialValue={null} className="mb-0 min-w-32 " label={<p className="font-bold">Observações</p>}>
                                <TextArea
                                    showCount
                                    maxLength={250}
                                    rows={4}
                                />
                            </Form.Item>
                        </div>
                        <div>
                            <Form.Item name='tipo' initialValue={null} className="mb-0 min-w-32" label={<p className="font-bold">Tipo</p>}>
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
                            <Form.Item name='dataRepasse' rules={[{ required: true, message: 'Insira a data!' }]} initialValue={dayjs()} className="mb-0 min-w-32 pt-2" label={<p className="font-bold">Data Repasse</p>}>
                                <DatePicker className="w-full" format='DD/MM/YYYY' />
                            </Form.Item>
                        </div>
                    </div>
                    <div className="flex justify-center items-center gap-x-4 mt-10">
                        <button type="button" onClick={() => setOpen(false)} className="px-6 py-1 text-base rounded-md font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            Cancelar
                        </button>
                        <button className="px-8 py-1 text-base rounded-md font-bold border-2 bg-verde text-white border-verde">
                            Liquidar Repasse
                        </button>

                    </div>
                </Form>
            )}

        </Modal>
    )
}
