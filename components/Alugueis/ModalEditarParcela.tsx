import { api } from "@/services/apiClient";
import { DatePicker, Form, Input, InputNumber, Modal, Select, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaPlus, FaRegQuestionCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdClose } from "react-icons/md";
import LoadingScreen from "../LoadingScreen";
import { useAtom } from "jotai";
import { atualizarAlugel } from "@/pages/painel-administrativo/alugueis";
import { toast } from "react-toastify";
const { TextArea } = Input;

interface Props {
    open: boolean
    setOpen: (value: boolean) => void;
    idParcela: number
}

interface Cliente {
    id: string
    nome: string
    celular: string | null
}

interface Imovel {
    id: string
    numero: string
    logradouro: string
    idInterno: string
    cliente: Cliente
}

interface Locador {
    id: string
    nome: string
    celular: string | null
}

interface Locatario {
    id: string
    nome: string
    celular: string | null
}
export interface ValorExtra {
    id?: number
    descricao: string
    destinatario: string
    tipo: string
    valor: number
}

interface ValorExtraSaida {
    id?: number
    descricao?: string
    destinatario?: string
    tipo?: string
    valor?: number
}

export interface Dados {
    id: number
    parcela: string
    mesAno: string
    dataVencimento: Date
    dataPagamento: Date | null
    dataRepasse: Date | null
    observacaoPagamento: string | null,
    tipoPagamento: string | null,
    observacaoRepasse: string | null,
    tipoRepasse: string | null
    valor: number
    multaPerc: number
    jurosPerc: number
    locador: Locador
    locatario: Locatario
    imovel: Imovel
    valoresExtras: ValorExtra[]
    observacoes: string | null
    taxaAdministrativaPerc: number
}
export default function ModalEditarParcela({ open, setOpen, idParcela }: Props) {

    const [dados, setDados] = useState<Dados>()
    const [atualizar, setAtualizar] = useAtom(atualizarAlugel)
    const [valoresExtraOriginal, setValoresExtraOriginal] = useState<ValorExtra[]>([])
    const [form] = Form.useForm()
    useEffect(() => {

        async function fetchData() {
            const resposta = await api.get('alugueis/parcela/' + idParcela)

            setDados(resposta.data)
            setValoresExtraOriginal(resposta.data.valoresExtras)
            form.setFieldsValue({
                imovel: resposta.data.imovel.idInterno + ' - ' + resposta.data.imovel.logradouro,
                locador: resposta.data.locador.nome + (resposta.data.locador.celular ? ' - ' + resposta.data.locador.celular : ''),
                locatario: resposta.data.locatario.nome + (resposta.data.locatario.celular ? ' - ' + resposta.data.locatario.celular : ''),
                vencimento: dayjs(resposta.data.dataVencimento).add(3, 'hours'),
                valorAluguel: resposta.data.valor,
                observacoes: resposta.data.observacoes,
                parcela: resposta.data.parcela,
                referencia: resposta.data.mesAno,
            })
        }

        fetchData()

    }, [idParcela])

    const addValorExtra = () => {

        if (dados) {
            const valor = dados.valoresExtras.length

            setDados({
                ...dados, valoresExtras: [...dados.valoresExtras, {
                    descricao: '',
                    tipo: 'ACRESCIMO',
                    destinatario: 'LOCADOR',
                    valor: 0
                }]
            })

            form.setFieldsValue({
                [valor]: {
                    descricao: '',
                    valor: 0,
                    destinatario: 'LOCADOR',
                    tipo: 'ACRESCIMO',
                }
            })
        }
    }

    const removeValorExtra = (index: number) => {


        if (dados) {
            const valores = dados.valoresExtras.filter((valor, numero) => {
                if (numero !== index) {
                    return valor
                } else {

                }
            })

            setDados({ ...dados, valoresExtras: valores })

            valores.map((valor, numero) => {
                if (numero < index) {
                    form.setFieldsValue({
                        [numero]: {
                            id: valor.id,
                            descricao: form.getFieldValue([numero, 'descricao']),
                            valor: form.getFieldValue([numero, 'valor']),
                            destinatario: form.getFieldValue([numero, 'destinatario']),
                            tipo: form.getFieldValue([numero, 'tipo'])
                        }
                    })
                } else {
                    form.setFieldsValue({
                        [numero]: {
                            id: dados.valoresExtras[numero + 1].id,
                            descricao: form.getFieldValue([numero + 1, 'descricao']),
                            valor: form.getFieldValue([numero + 1, 'valor']),
                            destinatario: form.getFieldValue([numero + 1, 'destinatario']),
                            tipo: form.getFieldValue([numero + 1, 'tipo'])
                        }
                    })
                }

            })
        }


    }

    async function addValorExtraBanco(valores: ValorExtraSaida | undefined) {
        if (dados && valores) {
            const resultado = await api.post('alugueis/parcela/valor-extra/' + dados.id, {
                descricao: valores.descricao,
                tipo: valores.tipo,
                destinatario: valores.destinatario,
                valor: valores.valor
            })
        }
    }

    async function removeValorExtraBanco(id: number | undefined) {
        const resultado = await api.delete('alugueis/parcela/valor-extra/' + id)
    }

    async function updateValorExtraBanco(valores: Partial<ValorExtra>) {
        const resultado = await api.patch('alugueis/parcela/valor-extra/' + valores.id, {
            descricao: valores.descricao,
            tipo: valores.tipo,
            destinatario: valores.destinatario,
            valor: valores.valor
        })
    }
    
    const onFinish = (valor: any) => {

        console.log('onFinish', valor)
        if (dados) {
            let changes: Partial<Dados> = {}

            

            const data1 = dayjs(valor.vencimento).startOf('day');
            const data2 = dayjs(dados.dataVencimento).add(3, 'hours').startOf('day');
            


            let controle = false
            if (valor.valorAluguel !== dados.valor) {
                changes.valor = valor.valorAluguel
                controle = true
            }
            if (valor.observacoes !== dados.observacoes && !(valor.observacoes === '' && dados.observacoes === null)) {
                changes.observacoes = valor.observacoes
                controle = true
            }
            if (data2.diff(data1, 'day') !== 0) {
                changes.dataVencimento = valor.vencimento
                controle = true
            }
            if (valoresExtraOriginal.length !== dados.valoresExtras.length) {
                controle = true
            }
            if (dados.valoresExtras.filter((valor) => valor.id !== undefined).length !== dados.valoresExtras.length) {
                controle = true
            }
            let valoresExtra: Partial<ValorExtra>[] = []; // Corrigido a tipagem

            for (let i = 0; i < dados.valoresExtras.length; i++) {
                if (
                    dados.valoresExtras[i].descricao !== 'JUROS' &&
                    dados.valoresExtras[i].descricao !== 'MULTA' &&
                    dados.valoresExtras[i].id
                ) {
                    let valorExtra: Partial<ValorExtra> = {};
                    const valorAntigo = valoresExtraOriginal.filter((aux) => aux.id === dados.valoresExtras[i].id);
                    if (valorAntigo.length > 0) { // Verifica se valorAntigo existe
                        if (valorAntigo[0].descricao !== valor[i].descricao) {
                            controle = true;
                            valorExtra.descricao = valor[i].descricao;
                        }
                        if (valorAntigo[0].valor !== valor[i].valor) {
                            controle = true;
                            valorExtra.valor = valor[i].valor;
                        }
                        if (valorAntigo[0].destinatario !== valor[i].destinatario) {
                            controle = true;
                            valorExtra.destinatario = valor[i].destinatario;
                        }
                        if (valorAntigo[0].tipo !== valor[i].tipo) {
                            controle = true;
                            valorExtra.tipo = valor[i].tipo;
                        };
                        if (Object.keys(valorExtra).length > 0) {
                            console.log('entrou')
                            valorExtra.id = valorAntigo[0].id;
                            valoresExtra.push(valorExtra);
                        }
                    }
                }
            }

            if (controle) {

                console.log(controle)
                const excluidos =  valoresExtraOriginal.filter((valor)  => {
                    if(valor.descricao === 'MULTA' || valor.descricao === 'JUROS'){
                        return valor
                    }
                    else if(dados.valoresExtras.filter((aux) => aux.id === valor.id).length === 0){
                        return valor
                    }
                   
                })

                let adicionados: ValorExtraSaida[] = []

                for(let i = 0; i < dados.valoresExtras.length; i++){
                    if(dados.valoresExtras[i].id === undefined){
                        let adicionado: Partial<ValorExtraSaida> = {}
                        adicionado.descricao = valor[i].descricao 
                        adicionado.destinatario = valor[i].destinatario 
                        adicionado.tipo = valor[i].tipo
                        adicionado.valor = valor[i].valor

                        adicionados.push(adicionado)
                    }
                }


                if(excluidos.length > 0){
                    for(var i = 0; i < excluidos.length; i++){
                        if(excluidos[i].id){
                           removeValorExtraBanco(excluidos[i].id)
                        }
                        
                    }
                }

                if(adicionados.length > 0){
                    for(var i = 0; i < adicionados.length; i++){
                        if(adicionados[i]){
                          addValorExtraBanco(adicionados[i])
                        }
                        
                    }
                }

                if(valoresExtra.length > 0){
                    for(var i = 0; i < valoresExtra.length; i++){
                        if(valoresExtra[i]){
                          updateValorExtraBanco(valoresExtra[i])
                        }
                        
                    }
                }
                api.patch('alugueis/parcela/' + dados.id , {
                    dataVencimento: changes.dataVencimento ? new Date(changes.dataVencimento) : undefined,
                    dataPagamento: null,
                    dataRepasse: null,
                    observacoes: changes.observacoes,
                    valor: changes.valor,
                }).then((resposta) => {
                    setOpen(false)
                    setAtualizar(!atualizar)
                    toast.success('Parcela atualizada com sucesso!')
                }).catch((error) => {
                    console.log(error)
                })
            }

        }


    }

    return (
        <Modal centered width={1000} open={open} onCancel={() => setOpen(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Editar Parcela</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
            {dados ? (
                <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
                    <Form form={form} onFinish={onFinish} layout="vertical" className="px-6 pb-6">
                        <div className="grid grid-cols-3 gap-x-4" >
                            <Form.Item name={'imovel'} className="mb-0 " label={<p className="font-bold flex gap-x-1 items-center">Imóvel</p>} >
                                <Input className="" disabled={true} />
                            </Form.Item>
                            <Form.Item name={'locador'} className="mb-0 " label={<p className="font-bold flex gap-x-1 items-center">Locador</p>} >
                                <Input className="" disabled={true} />
                            </Form.Item>
                            <Form.Item name={'locatario'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Locatário</p>} >
                                <Input className="" disabled={true} />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-4 gap-x-4 pt-4">
                            <Form.Item name='vencimento' rules={[{ required: true, message: 'Insira a data!' }]} className="mb-0 min-w-32" label={<p className="font-bold">Vencimento</p>}>
                                <DatePicker className="w-full" format='DD/MM/YYYY' />
                            </Form.Item>
                            <Form.Item name='valorAluguel' rules={[{ required: true, message: 'Isira o valor do aluguel!' }]} className="mb-0 min-w-32" label={<p className="font-bold">Valor do Aluguel</p>}>
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
                            <Form.Item name={'parcela'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Parcela</p>} >
                                <Input disabled={true} />
                            </Form.Item>
                            <Form.Item name={'referencia'} className="mb-0" label={<p className="font-bold flex gap-x-1 items-center">Referência</p>} >
                                <Input disabled={true} />
                            </Form.Item>
                        </div>
                        <div className="pt-4">
                            <Form.Item name='observacoes' className="mb-0 min-w-32" label={<p className="font-bold">Observações</p>}>
                                <TextArea
                                    showCount
                                    maxLength={250}
                                    rows={2}
                                />
                            </Form.Item>
                        </div>

                        <div className="pt-3">
                            <p className="font-bold">Valores Extras</p>
                            <div className="space-y-3 mt-3">
                                {dados.valoresExtras.length > 0 &&
                                    dados.valoresExtras.map((valorExtra, index) => {
                                        if (valorExtra.descricao !== 'JUROS' && valorExtra.descricao !== 'MULTA') {
                                            return (
                                                <div key={index} className="grid grid-cols-9 gap-x-4 border-2 border-verde/40 px-6 pt-2 pb-4 rounded-md ">
                                                    <Form.Item name={[index, 'descricao']} rules={[{ required: true, message: 'Insira o nome' }]} initialValue={valorExtra.descricao} className="mb-0 col-span-2" label={<p className="font-bold flex gap-x-1 items-center">Nome <Tooltip title='Exemplos: Água, Energia, Condomínio'><FaRegQuestionCircle /></Tooltip></p>} >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item name={[index, 'valor']} rules={[{ required: true, message: 'Insira o valor' }]} initialValue={valorExtra.valor} className="mb-0 col-span-2" label={<p className="font-bold">Valor</p>}>
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
                                                    <Form.Item name={[index, 'tipo']} initialValue={valorExtra.tipo} className="mb-0 col-span-2" label={<p className="font-bold">Operação</p>}>
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
                                                    <Form.Item name={[index, 'destinatario']} initialValue={valorExtra.destinatario} className="mb-0 col-span-2" label={<p className="font-bold">Destinatário</p>}>
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
                                            )
                                        }
                                    })
                                }

                                <button onClick={() => addValorExtra()} type="button" className="flex mt-3 px-12 bg-verde text-white py-2 rounded-md items-center gap-x-2"><FaPlus /> Adicionar valor extra </button>

                            </div>
                        </div>
                        <div className="mt-4">
                            {(dados.dataPagamento || dados.dataRepasse) && (
                                <div className="mx-auto bg-red-500 px-6 py-2 rounded-md">
                                    <p className="text-white text-center text-base">Esta parcela já foi liquidado o {dados.dataPagamento && 'pagamento'}{dados.dataRepasse && ' e o repasse'} </p>
                                    <p className="text-white text-center text-base">Caso tenha alguma alteração, vai ser retirado o {dados.dataPagamento && 'pagamento'}{dados.dataRepasse && ' e o repasse'}</p>
                                </div>
                            )}
                            <p></p>
                        </div>
                        <div>
                            <div className="flex justify-center items-center gap-x-4 mt-8">
                                <button type="button" onClick={() => setOpen(false)} className="px-6 py-1 text-base rounded-md font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                    Cancelar
                                </button>
                                <button className="px-8 py-1 text-base rounded-md font-bold border-2 bg-verde text-white border-verde">
                                    Salvar
                                </button>
                            </div>
                        </div>

                    </Form>
                </div>
            ) : <LoadingScreen heigth="550px" />}


        </Modal>
    )
}