import { formatCPFCNPJ } from "@/global/TratamentoDeDados";
import { atualizarUsuarioPerfilAtom } from "@/pages/painel-administrativo/meu-perfil";
import { api } from "@/services/apiClient";
import { Form, Input, Select } from "antd";
import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "react-toastify";

interface DadosBancarios {
    idUsuario: string;
    id: string | null
    banco: string | null
    agencia: string | null
    operacao: string | null
    conta: string | null
    tipoConta: string | null
    cpfcnpjConta: string | null
    tipoChavePix: string | null
    chavePix: string | null
}
export default function DadosBancariosUsuario({ idUsuario,id, banco, agencia, operacao, conta, tipoConta, cpfcnpjConta, tipoChavePix, chavePix }: DadosBancarios) {
    const [form] = Form.useForm();
    const [atualizar, setAtualizar] = useAtom(atualizarUsuarioPerfilAtom)
    const [cpfCnpjBancario, setCpfCnpjBancario] = useState<string>(cpfcnpjConta ? cpfcnpjConta : '')
    function handleCPFCNPJBancarioChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;

        // Limita o tamanho máximo para CPF (11 caracteres) e CNPJ (14 caracteres)
        const maxLength = value.length <= 14 ? 14 : 18;
        const formattedValue = formatCPFCNPJ(value.slice(0, maxLength));
        setCpfCnpjBancario(formattedValue);
    }
    const onFinishBancario = (valores: any) => {

        if (id) {
            api.patch('usuarios/financeiro/' + id, {
                idUsuario: idUsuario,
                banco: valores.banco,
                agencia: valores.agencia,
                operacao: valores.operacao,
                conta: valores.conta,
                tipoConta: valores.tipoConta,
                cpfcnpjConta: cpfCnpjBancario,
                tipoChavePix: valores.tipoChavePix,
                chavePix: valores.chavePix,
            }).then((resposta) => {
                toast.success('Dados Bancários alterado com sucesso!')
                setAtualizar(!atualizar)
            })
        } else {
            api.post('usuarios/financeiro', {
                idUsuario: idUsuario,
                banco: valores.banco,
                agencia: valores.agencia,
                operacao: valores.operacao,
                conta: valores.conta,
                tipoConta: valores.tipoConta,
                cpfcnpjConta: cpfCnpjBancario,
                tipoChavePix: valores.tipoChavePix,
                chavePix: valores.chavePix,
            }).then((resposta) => {
                toast.success('Dados Bancários alterado com sucesso!')
                setAtualizar(!atualizar)
            })
        }

    }
    return (
        <div className="border-[1px] border-verde rounded-lg pb-4">
            <div className="text-white bg-verde text-xl font-bold rounded-t-lg py-2">
                <p className="text-center">Dados Bancários</p>
            </div>
            <Form form={form} onFinish={onFinishBancario} layout="vertical">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 px-4 mt-4">
                    <Form.Item initialValue={banco } name='banco' label={<p className="font-bold text-base">Banco</p>}>
                        <Input />
                    </Form.Item>
                    <Form.Item initialValue={agencia } name='agencia' label={<p className="font-bold text-base">Agência</p>}>
                        <Input />
                    </Form.Item>
                    <Form.Item initialValue={conta } name='conta' label={<p className="font-bold text-base">Conta</p>}>
                        <Input />
                    </Form.Item>
                    <Form.Item initialValue={operacao} name='operacao' label={<p className="font-bold text-base">Operação</p>}>
                        <Input />
                    </Form.Item>
                    <Form.Item initialValue={tipoConta} name='tipoConta' label={<p className="font-bold text-base">Tipo de Conta</p>}>
                        <Select options={[{ label: 'Corrente', value: 'CORRENTE' }, { label: 'Poupança', value: 'POUPANCA' }]} />
                    </Form.Item>
                    <div>
                        <p className="font-bold text-base">CPF/CNPJ da Conta</p>
                        <input placeholder="cpf ou cnpj " value={cpfCnpjBancario} onChange={handleCPFCNPJBancarioChange} className="border-[1px] border-gray-300 rounded-md w-full h-8 px-2 mt-2" />
                    </div>

                </div>
                <div className="grid grid-cols-3 gap-x-4 px-4">

                    <Form.Item initialValue={chavePix} name='chavePix' className="col-span-2" label={<p className="font-bold text-base  mt-6 sm:mt-0">Chave PIX</p>}>
                        <Input />
                    </Form.Item>
                    <Form.Item initialValue={tipoChavePix} name='tipoChavePix' label={<p className="font-bold text-base">Tipo de chave PIX</p>}>
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
                <div className="flex justify-center items-center gap-6 ">
                    <button className="bg-verde text-white py-2 px-6 rounded-md">Salvar Dados Bancários</button>
                </div>
            </Form>

        </div>
    )
}