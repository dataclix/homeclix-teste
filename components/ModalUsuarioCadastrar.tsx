import {
    atualizarGerenciarAtom,
    openCadastrar,
  } from "@/pages/painel-administrativo/configuracoes/usuarios/gerenciar";
  import { api } from "@/services/apiClient";
  import { Form, Input, Modal, Slider } from "antd";
  import { useAtom } from "jotai";
  import Image from "next/image";
  import { useRef, useState } from "react";
  import AvatarEditor from "react-avatar-editor";
  import { FcAddImage } from "react-icons/fc";
  import { IoMdClose } from "react-icons/io";
  import { toast } from "react-toastify";
  
  interface Dados {
    nome: string;
    email: string;
    senha: string;
    comfirmar: string;
  }
  
  const CropperModal = ({
    src,
    modalOpen,
    setModalOpen,
    setPreview,
    setImageAvatar,
  }: any) => {
    const [slideValue, setSlideValue] = useState(10);
    const cropRef = useRef<any>(null);
  
    //handle save
    const handleSave = async () => {
      if (cropRef.current) {
        const dataUrl = cropRef.current.getImage().toDataURL();
        const result = await fetch(dataUrl);
        const blob = await result.blob();
        setPreview(URL.createObjectURL(blob));
        setImageAvatar(blob);
        setModalOpen(false);
      }
    };
  
    return (
      <Modal
        width={400}
        open={modalOpen}
        footer={false}
        onCancel={() => setModalOpen(false)}
        closable={false}
      >
        <div className="">
          <AvatarEditor
            ref={cropRef}
            image={src}
            style={{ width: "100%", height: "100%" }}
            border={50}
            borderRadius={150}
            color={[0, 0, 0, 0.72]}
            scale={slideValue / 10}
            rotate={0}
          />
          <p className="absolute text-white/70 top-0 mt-4 font-libre text-lg w-full text-center">
            Arraste a foto para reajustar
          </p>
          <div className="bg-black/70 pt-2 pb-4">
            <Slider
              min={10}
              max={50}
              tooltipVisible={false}
              className="w-[80%]  mx-auto   "
              value={slideValue}
              onChange={(e) => setSlideValue(e)}
            />
            <p className="text-white font-libre text-center -mt-2">Zoom</p>
          </div>
          <div className="flex justify-center gap-4 bg-black/70 py-3 rounded-b-xl ">
            <button
              onClick={() => setModalOpen(false)}
              className=" bg-[#E97451] text-white font-libre rounded-lg w-24 py-1.5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-[#9DBE72] text-white font-libre rounded-lg w-24 py-1.5"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>
    );
  };
  
  export default function ModalUsuarioCadastrar() {
    const [open, setOpen] = useAtom<boolean>(openCadastrar);
    const [atualizar, setAtualizar] = useAtom(atualizarGerenciarAtom);
    const [src, setSrc] = useState<string | null>(null);
    const [preview, setPreview] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [imageAvatar, setImageAvatar] = useState<string | Blob | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
  
    const handleInputClick = (e: any) => {
      e.preventDefault();
      if (inputRef.current !== null) {
        inputRef.current.click();
      }
    };
  
    // handle Change
    const handleImgChange = (e: any) => {
      if (e.target.files[0]) {
        setSrc(URL.createObjectURL(e.target.files[0]));
        setModalOpen(true);
      }
    };
  
    const onFinish = (values: Dados) => {
      api
        .post("usuarios/create/user", {
          nome: values.nome,
          email: values.email,
          senha: values.senha,
          mostrarDestaque: false,
        })
        .then((resposta) => {
          if (imageAvatar !== null) {
            const data = new FormData();
            data.append("file", imageAvatar);
            api.post(`usuarios/create/user/image/${resposta.data.id}`, data);
            setOpen(false);
            setAtualizar(!atualizar);
            toast.success("Usuario cadastrado com sucesso!");
          } else {
            setOpen(false);
            setAtualizar(!atualizar);
            toast.success("Usuario cadastrado com sucesso!");
          }
        })
        .catch((err: any) => {
          toast.error(err.response.data.message);
        });
    };
  
    return (
      <div>
        {/* Modal do Cropper */}
        <CropperModal
          modalOpen={modalOpen}
          src={src}
          setPreview={setPreview}
          setModalOpen={setModalOpen}
          setImageAvatar={setImageAvatar}
        />
  
        {/* Modal principal - Cadastro de Usuário */}
        <Modal
          className=""
          centered
          width={900}
          closeIcon={<IoMdClose size={24} color="white" className="" />}
          open={open}
          onCancel={() => setOpen(false)}
          title={
            <p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">
              Cadastrar Usuário
            </p>
          }
          footer={false}
        >
          <div className="bg-white pb-5 rounded-b-lg pt-6">
            <Form onFinish={onFinish} className="px-6" layout="vertical">
              {/* Estrutura responsiva - Web: 2 colunas, Mobile: 1 coluna */}
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                {/* Seção da Imagem de Perfil */}
                <div className="mx-auto">
                  <Image
                    src={preview || "/img/icones/profile.webp"}
                    width={250}
                    height={250}
                    alt="imagem de profile"
                    className="rounded-full mx-auto border-2 border-black"
                  />
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="bg-verde text-white text-xl font-libre rounded-lg px-6 py-1.5 mt-6 mx-auto"
                      onClick={handleInputClick}
                    >
                      Carregar Imagem
                    </button>
                  </div>
  
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    className="invisible"
                    onChange={handleImgChange}
                  />
                </div>
  
                {/* Seção do Formulário */}
                <div>
                  <Form.Item
                    name="nome"
                    rules={[{ required: true, message: "Por favor insira seu nome" }]}
                    label={
                      <p className="text-md font-bold font-libre uppercase ">
                        Nome
                      </p>
                    }
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    hasFeedback
                    rules={[
                      { required: true, message: "Por favor insira seu email" },
                      { type: "email", message: "Email invalido" },
                    ]}
                    label={
                      <p className="text-md font-bold font-libre uppercase ">
                        Email
                      </p>
                    }
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="senha"
                    hasFeedback
                    rules={[{ required: true, message: "Por favor insira a senha" }]}
                    label={
                      <p className="text-md font-bold font-libre uppercase ">
                        Senha
                      </p>
                    }
                  >
                    <Input.Password className="custom-password-icon" />
                  </Form.Item>
                  <Form.Item
                    name="confirmar"
                    hasFeedback
                    dependencies={["senha"]}
                    rules={[
                      {
                        required: true,
                        message: "Por favor confirme a senha",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("senha") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("As senhas não conrrespondem!")
                          );
                        },
                      }),
                    ]}
                    label={
                      <p className="text-md font-bold font-libre uppercase ">
                        Confirmar senha
                      </p>
                    }
                  >
                    <Input.Password className="custom-password-icon"/>
                  </Form.Item>
                </div>
              </div>
  
              <div className="flex justify-end mt-4 gap-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border-2 border-verde text-verde font-libre rounded-lg w-32 py-1.5"
                >
                  Cancelar
                </button>
                <button className="bg-verde text-white font-libre rounded-lg w-32 py-1.5">
                  Salvar
                </button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }