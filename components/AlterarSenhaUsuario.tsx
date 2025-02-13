import { modalSenhaUsuarioPerfilAtom } from "@/pages/painel-administrativo/meu-perfil";
import { api } from "@/services/apiClient";
import { Form, Input, Modal } from "antd";
import { useAtom } from "jotai";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";

interface Senha{
    idUsuario: string;
}
export default function AlterarSenhaUsuario({idUsuario}: Senha){
    const [form] = Form.useForm();
    const [modalSenha, setModalSenha] = useAtom(modalSenhaUsuarioPerfilAtom)
    const onFinishSenha = (valores: any) => {
        api.post('usuarios/trocar-senha', {
            id_usuario: idUsuario,
            senhaAntiga: valores.senhaAtual,
            senhaNova: valores.senhaNova
        }).then((resposta) => {
            toast.success('Senha trocada com sucesso!')
            setModalSenha(false)
            
        }).catch((err) => {
            toast.error('Senha atual incorreta!')
        })
    }
    return(
        <Modal open={modalSenha} width={600} title={<p className="text-2xl text-white rounded-t-lg font-bold px-4 py-2 bg-verde">Trocar senha</p>} onCancel={() => setModalSenha(false)} footer={false} closeIcon={<IoMdClose size={24} color="white" className="" />}>
                    <Form form={form}  onFinish={onFinishSenha} className="px-6 mt-6" layout="vertical">
                        <Form.Item
                             name='senhaAtual' rules={[{ required: true, message: 'Por favor insira a senha' }]} label={<p className="text-[#1F1509] font-alumni text-xl font-bold">Senha atual</p>}>
                            <Input.Password className="bg-verde text-white hover:bg-verde custom-password-input"
                                style={{
                                    backgroundColor: '#124B51',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                }} />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-6">
                            <Form.Item
                                 hasFeedback rules={[{ required: true, message: 'Por favor insira a senha' }]} name='senhaNova' label={<p className="text-[#1F1509] font-alumni text-xl font-bold">Senha nova</p>}>
                                <Input.Password 
                                
                                className="bg-verde text-white hover:bg-verde custom-password-input"
                                style={{
                                  backgroundColor: '#124B51',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                }}/>
                            </Form.Item>
                            <Form.Item
                               
                                dependencies={['senhaNova']}
                                name='confirm'
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor digite a senha novamente!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('senhaNova') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('As senhas não se correspondem!'));
                                        },
                                    }),
                                ]}
                                label={<p className="text-[#1F1509] font-alumni text-xl font-bold">Confirmar senha nova</p>}>
                                <Input.Password 
                                className="bg-verde text-white hover:bg-verde custom-password-input"
                                style={{
                                  backgroundColor: '#124B51',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                }}/>
                            </Form.Item>
                        </div>
                        <div className="flex justify-center pb-6 mt-4 gap-4">
                            <button type="button" onClick={() => setModalSenha(false)} className="border-2 border-[#E97451] text-[#E97451] font-libre rounded-lg w-40 py-1.5">Cancelar</button>
                            <button className="bg-verde text-white font-libre rounded-lg w-40 py-1.5">Trocar Senha</button>
                        </div>
                    </Form>
                </Modal>
    )
}