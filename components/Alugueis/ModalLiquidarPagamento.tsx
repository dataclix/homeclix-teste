import { api } from "@/services/apiClient";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Dados, ValorExtra } from "./ModalEditarParcela";
import dayjs from "dayjs";
import { result } from "lodash";
import { useAtom } from "jotai";
import { atualizarAlugel } from "@/pages/painel-administrativo/alugueis";
import { toast } from "react-toastify";
const { TextArea } = Input;

interface Props {
    open: boolean
    setOpen: (value: boolean) => void;
    idParcela: number
}
export default function ModalLiquidarPagamento({ open, setOpen, idParcela }: Props) {

    const [dados, setDados] = useState<Dados>()
    const [atualizar, setAtualizar] = useAtom(atualizarAlugel)
    const [diasAtrasados, setDiasAtrasados] = useState<number>(0)
    const [valorTotal, setValorTotal] = useState<number>(0)
    const [form] = Form.useForm()
    useEffect(() => {

        async function fetchData() {
            const resposta = await api.get('alugueis/parcela/' + idParcela)

            console.log(resposta.data)

            setDados(resposta.data)

            let valor = resposta.data.valor

            for (let i = 0; i < resposta.data.valoresExtras.length; i++) {
                if (resposta.data.valoresExtras[i].descricao !== 'MULTA' && resposta.data.valoresExtras[i].descricao !== 'JUROS') {
                    if (resposta.data.valoresExtras[i].tipo === 'ACRESCIMO') {
                        valor = valor + resposta.data.valoresExtras[i].valor
                    } else {
                        valor = valor - resposta.data.valoresExtras[i].valor
                    }
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
                observacoes: resposta.data.observacaoPagamento,
                tipo: resposta.data.tipoPagamento,
                dataPagamento: resposta.data.dataPagamento ? dayjs(resposta.data.dataPagamento).add(3, 'hours') : dayjs().add(3, 'hours'),

            })

            const data1 = dayjs(resposta.data.dataVencimento).add(3, 'hours').startOf('day');
            const data2 = resposta.data.dataPagamento ? dayjs(resposta.data.dataPagamento).add(3, 'hours').startOf('day') : dayjs(new Date()).startOf('day');

            const diferenca = data2.diff(data1, 'day');

            if (diferenca > 0) {

                const multa = ((resposta.data.valor / 100) * resposta.data.multaPerc).toFixed(2)
                const juros = (((resposta.data.valor / 100) * resposta.data.jurosPerc) * diferenca).toFixed(2)
                const valorTotal = (valor + parseFloat(multa) + parseFloat(juros))

                setDiasAtrasados(diferenca)

                form.setFieldsValue({
                    multa: multa,
                    juros: juros,
                    valorTotal: valorTotal
                })
            }

        }

        fetchData()

    }, [idParcela])

    const onChangeDataPagamento = (e: any) => {

        if (dados) {
            const data1 = dayjs(dados.dataVencimento).add(3, 'hours').startOf('day');
            const data2 = dayjs(e).startOf('day');

            const diferenca = data2.diff(data1, 'day');

            if (diferenca > 0) {

                const multa = ((dados.valor / 100) * dados.multaPerc).toFixed(2)
                const juros = (((dados.valor / 100) * dados.jurosPerc) * diferenca).toFixed(2)
                const valorTotalDif = (valorTotal + parseFloat(multa) + parseFloat(juros))

                setDiasAtrasados(diferenca)

                form.setFieldsValue({
                    multa: multa,
                    juros: juros,
                    valorTotal: valorTotalDif
                })
            }
            else {
                setDiasAtrasados(0)

                form.setFieldsValue({
                    multa: 0,
                    juros: 0,
                    valorTotal: valorTotal
                })
            }
        }
    }

    async function removeValorExtraBanco(id: number | undefined) {
        const resultado = await api.delete('alugueis/parcela/valor-extra/' + id)
    }

    async function updateValorExtraBanco(valores: Partial<ValorExtra>) {
        console.log(valores)
        const resultado = await api.patch('alugueis/parcela/valor-extra/' + valores.id, {
            descricao: valores.descricao,
            tipo: valores.tipo,
            destinatario: valores.destinatario,
            valor: valores.valor
        })
    }

    const onBlurMulta = (e: any) => {
        if(dados){
            const juros = form.getFieldValue('juros')
            const total = parseFloat(e.replace('.', '').replace(',', '.')) + parseFloat(juros) + valorTotal
            form.setFieldValue('valorTotal', total)
        }
        
    }

    const onBlurJuros = (e: any) => {
        if(dados){
            const multa = form.getFieldValue('multa')
            const total = parseFloat(e.replace('.', '').replace(',', '.')) + parseFloat(multa) + valorTotal
            form.setFieldValue('valorTotal', total)
        }
        
    }

    const onFinish = (valor: any) => {

        if (dados?.dataPagamento) {
            dados.valoresExtras.map((teste) => {
                if (teste.descricao === 'MULTA') {
                    if (parseFloat(valor.multa) === 0) {
                        removeValorExtraBanco(teste.id)
                    }else if (parseFloat(valor.multa) !== teste.valor) {
                        
                        const valorUpdate: Partial<ValorExtra> = {
                            descricao: undefined,
                            valor: parseFloat(valor.multa),
                            destinatario: undefined,
                            tipo: undefined,
                            id: teste.id
                        }
                        updateValorExtraBanco(valorUpdate)
                    }
                }
                if (teste.descricao === 'JUROS') {
                    if (parseFloat(valor.juros) === 0) {
                        removeValorExtraBanco(teste.id)
                    }else if (parseFloat(valor.juros) !== teste.valor) {
                        const valorUpdate: Partial<ValorExtra> = {
                            descricao: undefined,
                            valor: parseFloat(valor.juros),
                            destinatario: undefined,
                            tipo: undefined,
                            id: teste.id
                        }
                        updateValorExtraBanco(valorUpdate)
                    }
                }
            })

            let changes: Partial<Dados> = {}

            const data1 = dayjs(valor.dataPagamento).startOf('day');
            const data2 = dayjs(dados.dataPagamento).add(3, 'hours').startOf('day');

            let controle = false

            if (valor.tipo !== dados.tipoPagamento) {
                changes.tipoPagamento = valor.tipo
                controle = true
            }
            if (valor.observacoes !== dados.observacaoPagamento && !(valor.observacoes === '' && dados.observacaoPagamento === null)) {
                changes.observacaoPagamento = valor.observacoes
                controle = true
            }
            if (data2.diff(data1, 'day') !== 0) {
                changes.dataPagamento = valor.dataPagamento
                controle = true
            }


            if (controle === true) {

                api.patch('alugueis/parcela/' + dados.id, {
                    dataPagamento: changes.dataPagamento ? new Date(changes.dataPagamento) : undefined,
                    observacaoPagamento: changes.observacaoPagamento,
                    tipoPagamento: changes.tipoPagamento
                }).then((resultado) => { 
                    setOpen(false)
                    toast.success('Atualizado pagamento liquidado!')
                    setAtualizar(!atualizar)
                })
            } else {
                setOpen(false)
                toast.success('Atualizado pagamento liquidado!')
                setAtualizar(!atualizar)
            }



        } else {
            if (valor.multa > 0 && valor.multa) {
                api.post('alugueis/parcela/valor-extra/' + idParcela, {
                    descricao: "MULTA",
                    tipo: "ACRESCIMO",
                    destinatario: "IMOBILIARIA",
                    valor: parseFloat(valor.multa)
                })
            }
            if (valor.juros > 0 && valor.juros) {
                api.post('alugueis/parcela/valor-extra/' + idParcela, {
                    descricao: "JUROS",
                    tipo: "ACRESCIMO",
                    destinatario: "IMOBILIARIA",
                    valor: parseFloat(valor.juros)
                })
            }


            api.post('alugueis/liquidar/' + idParcela, {
                dataPagamento: new Date(valor.dataPagamento),
                observacaoPagamento: valor.observacoes ? valor.observacoes : undefined,
                tipoPagamento: valor.tipo ? valor.tipo : undefined
            }).then((resposta) => {
                setOpen(false)
                setAtualizar(!atualizar)
                toast.success('Pagamento liquidado!')

            })
        }

    }

    return (
        <Modal centered width={800} open={open} onCancel={() => setOpen(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Efetuar Pagamento</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
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
                    <div className="grid grid-cols-3 gap-x-4 pt-4">
                        <Form.Item name='vencimento' className="mb-0 min-w-32" label={<p className="font-bold">Vencimento</p>}>
                            <Input className="w-full" disabled={true} />
                        </Form.Item>
                        <Form.Item name={'parcela'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Parcela</p>} >
                            <Input disabled={true} />
                        </Form.Item>
                        <Form.Item name={'referencia'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Referência</p>} >
                            <Input disabled={true} />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 mt-4">
                        <div>
                            <div className="border-2 border-verde/40 rounded-md ">
                                <div className="grid grid-cols-2 border-b-2 border-verde/40 px-4 ">
                                    <p className="py-0.5">Aluguel</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">+ {dados.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                </div>
                                {dados.valoresExtras.map((valor, index) => {
                                    if (valor.descricao !== 'JUROS' && valor.descricao !== 'MULTA') {
                                        return (
                                            <div key={index} className="grid grid-cols-2 border-b-2 border-verde/40 px-4 ">
                                                <p className="py-0.5">{valor.descricao}</p>
                                                <p className="border-l-2 px-4 border-verde/40 py-0.5">{valor.tipo === 'ACRESCIMO' ? '+ ' : '- '} {valor.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                            </div>
                                        )
                                    }
                                })}
                                <div className="grid grid-cols-2 bg-verde/70 rounded-b-md text-white px-4 ">
                                    <p className="py-0.5">Total</p>
                                    <p className="border-l-2 px-4 border-verde/40 py-0.5">+ {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                </div>
                            </div>
                            <Form.Item name='observacoes'  className="mb-0 min-w-32 pt-2" label={<p className="font-bold">Observações</p>}>
                                <TextArea
                                    showCount
                                    maxLength={250}
                                    rows={2}
                                />
                            </Form.Item>
                        </div>

                        <div className="px-6">
                            <div className="grid grid-cols-2 gap-x-4">
                                <Form.Item name='tipo'  className="mb-0 min-w-32" label={<p className="font-bold">Tipo</p>}>
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
                                <div>
                                    <Form.Item name='dataPagamento' rules={[{ required: true, message: 'Insira a data!' }]} className="mb-0 min-w-32" label={<p className="font-bold">Data Pagamento</p>}>
                                        <DatePicker onChange={(e) => onChangeDataPagamento(e)} className="w-full" format='DD/MM/YYYY' />
                                    </Form.Item>
                                    {diasAtrasados > 0 && (<p className="text-[11px] text-red-500">({diasAtrasados} dias atrasados)</p>)}
                                </div>

                            </div>
                            <div className="grid grid-cols-2 gap-x-2">
                                <Form.Item name='multa' className="mb-0 min-w-32 mt-2" label={<p className="font-bold">Multa</p>}>
                                    <InputNumber
                                        className="w-full"
                                        decimalSeparator=","
                                        precision={2}
                                        prefix="R$"
                                        onBlur={(e) => onBlurMulta(e.target.value)}
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
                                <Form.Item name='juros' className="mb-0 min-w-32 mt-2" label={<p className="font-bold">Juros</p>}>
                                    <InputNumber
                                        className="w-full"
                                        decimalSeparator=","
                                        precision={2}
                                        prefix="R$"
                                        onBlur={(e) => onBlurJuros(e.target.value)}
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

                            <Form.Item name='valorTotal' className="mb-0 min-w-32 mt-2" label={<p className="font-bold">Valor Total</p>}>
                                <InputNumber
                                    disabled={true}
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
                        </div>
                    </div>
                    <div className="flex justify-center items-center gap-x-4 mt-10">
                        <button type="button" onClick={() => setOpen(false)} className="px-6 py-1 text-base rounded-md font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            Cancelar
                        </button>
                        <button className="px-8 py-1 text-base rounded-md font-bold border-2 bg-verde text-white border-verde">
                            Liquidar
                        </button>

                    </div>
                </Form>
            )}

        </Modal>
    )
}
