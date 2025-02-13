import { Form, Image, Input, Modal } from "antd";
import LoadingScreen from "./LoadingScreen";
import { useAtom } from "jotai";
import { atualizarVideoAtom, idMaterialUpdateAtom, openUpdateDocumentoAtom } from "./UpdateImovel";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { api } from "@/services/apiClient";
import UniversalUpdateFileViewer from "./UniversalUpdateFileViewer";
import { toast } from "react-toastify";

interface Documento {
    id: string;
    link: string;
    fileType: string;
    nome: string;
    descricao: string;
}

export default function UpdateDocumento() {
    const [openEditarMaterial, setOpenEditarMaterial] = useAtom(openUpdateDocumentoAtom)
    const [idDocumento, setIdDocumento] = useAtom(idMaterialUpdateAtom)
    const [atualizar, setAtualizar] = useAtom(atualizarVideoAtom)
    const [loading, setLoading] = useState<boolean>(false)
    const [documento, setDocumento] = useState<Documento>()
    const [form] = Form.useForm();

    useEffect(() => {
        api.get('imoveis/documentos/download/' + idDocumento).then((resposta) => {
            setDocumento(resposta.data)
            form.setFieldsValue({
                materialEditar: resposta.data.nome,
                descricaoEditar: resposta.data.descricao
            })
        })
    }, [idDocumento])
    const onFinishCreateMaterial = (values: any) => {
        console.log(values)
        api.patch('imoveis/documentos/' + idDocumento, {
            nome: values.materialEditar,
            descricao: values.descricaoEditar
        }).then((resposta) => {
            toast.success("Documento atualizado com sucesso!")
            setAtualizar(!atualizar)
            setOpenEditarMaterial(false)
        })
    }
    return (
        <Modal width={1000} centered open={openEditarMaterial} onCancel={() => setOpenEditarMaterial(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Editar Documento</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
            {loading === false ? <Form form={form} layout="vertical" className="px-10 mt-4" onFinish={onFinishCreateMaterial}>
                <div className="grid grid-cols-5">
                    <div className="col-span-2 my-auto">
                        {documento && (
                            <UniversalUpdateFileViewer fileUrl={documento.link} fileType={documento.fileType} />
                        )}

                    </div>
                    <div className="col-span-3">
                        <Form.Item initialValue={documento && documento.nome} name='materialEditar' required rules={[{ required: true, message: "Por favor insira o nome do material" }]} label={<p className="font-bold text-md">Nome Material</p>}>
                            <Input />
                        </Form.Item>
                        <Form.Item initialValue={documento && documento.descricao} name='descricaoEditar' label={<p className="font-bold text-md">Descrição</p>}>
                            <Input.TextArea rows={4} showCount maxLength={100} />
                        </Form.Item>
                    </div>
                </div>



                <div className="flex justify-center gap-4 pb-4 mt-8">
                    <button className="w-40 shadow-md bg-verde text-white py-1.5 rounded-xl">
                        Atualizar Documento
                    </button>
                    <button type="button" onClick={() => setOpenEditarMaterial(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                        Cancelar
                    </button>
                </div>
            </Form>
                :
                <LoadingScreen heigth="500px" message="subindo arquivos" />
            }

        </Modal>
    )
}