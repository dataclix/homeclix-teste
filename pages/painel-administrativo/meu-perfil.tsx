import AlterarSenhaUsuario from "@/components/AlterarSenhaUsuario";
import DadosBancariosUsuario from "@/components/DadosBancariosUsuario";
import EnderecoUsuario from "@/components/EnderecoUsuario";
import Layout from "@/components/Layout";
import { formatCEP, formatCPFCNPJ } from "@/global/TratamentoDeDados";
import { removeAccents } from "@/global/TratamentosDeStrings";
import { apiKey, url } from "@/global/variaveis";
import { api } from "@/services/apiClient";
import {
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  SelectProps,
  Slider,
  Switch,
} from "antd";
import axios from "axios";
import { atom, useAtom } from "jotai";
import moment from "moment";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { IoMdClose } from "react-icons/io";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { toast } from "react-toastify";

interface Image {
  src: string;
}
interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  role: string;
  foto: string;
  perfil: string;
}
interface Props {
  usuario: Usuario;
}
interface Perfil {
  id: number;
  nome: string;
  permissoesPerfis: [];
}
interface DadosBancarios {
  id: string;
  banco: string;
  agencia: string;
  operacao: string;
  conta: string;
  tipoConta: string;
  cpfcnpjConta: string;
  tipoChavePix: string;
  chavePix: string;
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
}
interface UsuarioConta {
  id: string;
  nome: string;
  email: string;
  creci: string;
  foto: string;
  celular: string;
  cpf: string;
  endereco: string;
  dataNascimento: Date;
  ultimoAcesso: Date;
  mostrarSite: boolean;
  mostrarDestaque: boolean;
  role: string;
  status: string;
  perfil: Perfil;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: Bairro;
  cidade: Cidade;
  estado: Estado;
  usuarioFinanceiro: DadosBancarios[];
}
const CropperModal = ({
  src,
  modalOpen,
  setModalOpen,
  nomeOriginal,
  usuarioId,
  setPreview,
}: any) => {
  const [slideValue, setSlideValue] = useState(10);
  const cropRef = useRef<any>(null);

  //handle save
  const handleSave = async () => {
    if (cropRef.current) {
      const dataUrl = cropRef.current.getImage().toDataURL();
      console.log(nomeOriginal.name);
      const result = await fetch(dataUrl);
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);
      setPreview({ src: url });
      const data = new FormData();
      data.append("file", blob);
      console.log(usuarioId);
      api
        .post("usuarios/create/user/image/" + usuarioId, data)
        .then((response) => {
          toast.success("Imagem trocada com sucesso!");
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
      setModalOpen(false);
      setSlideValue(10);
    }
  };

  return (
    <Modal
      width={450}
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
          border={20}
          borderRadius={0}
          color={[0, 0, 0, 0.72]}
          scale={slideValue / 10}
          rotate={0}
        />
        <p className="absolute text-white/70 top-0 mt-2 font-libre text-lg w-full text-center">
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

export const atualizarUsuarioPerfilAtom = atom(false);
export const modalSenhaUsuarioPerfilAtom = atom(false);
export default function MeuPerfil({ usuario }: Props) {
  const [telefone, setTelefone] = useState<string>("");
  const [telefoneError, setTelefoneError] = useState<boolean>(false);
  const [telefoneNull, setTelefoneNull] = useState<boolean>(false);
  const [cpf, setCpf] = useState<string>("");
  const [cpfError, setCpfError] = useState<boolean>(false);
  const [cpfNull, setCpfNull] = useState<boolean>(false);
  const [modalSenha, setModalSenha] = useAtom(modalSenhaUsuarioPerfilAtom);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<Image>();
  const [src, setSrc] = useState<string | null>(null);
  const [nomeOriginal, setNomeOriginal] = useState<string>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [contaUsuario, setContaUsuario] = useState<UsuarioConta>();
  const [form] = Form.useForm();

  const [atualizar, setAtualizar] = useAtom(atualizarUsuarioPerfilAtom);
  useEffect(() => {
    api
      .get("usuarios/profile/" + usuario.id)
      .then((response) => {
        setContaUsuario(response.data);
        if (response.data.foto === null) {
          setPreview({ src: "/img/icones/profile.webp" });
        } else {
          setPreview({ src: response.data.foto });
        }

        setCpf(response.data.cpf);
        setTelefone(response.data.celular);
      })
      .catch((error) => {});
  }, [atualizar]);

  function formatCPF(value: string) {
    // Remove todos os caracteres não numéricos
    const val = value.replace(/\D/g, "");

    // Aplica a formatação de acordo com o comprimento do valor
    if (val.length <= 3) {
      return val;
    } else if (val.length <= 6) {
      return `${val.substring(0, 3)}.${val.substring(3)}`;
    } else if (val.length <= 9) {
      return `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(
        6
      )}`;
    } else {
      return `${val.substring(0, 3)}.${val.substring(
        3,
        6
      )}.${val.substring(6, 9)}-${val.substring(9, 11)}`;
    }
  }

  function handleCPFChange(event: React.ChangeEvent<HTMLInputElement>) {
    const formattedCPF = formatCPF(event.target.value);
    setCpf(formattedCPF);
    setCpfError(false);
  }
  function formatPhoneNumber(value: string) {
    // Remove todos os caracteres não numéricos
    const val = value.replace(/\D/g, "");

    // Verifica se o valor possui o DDD e formata de acordo
    if (val.length <= 2) {
      return val;
    } else if (val.length <= 6) {
      return `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length <= 10) {
      return `(${val.substring(0, 2)}) ${val.substring(
        2,
        6
      )}-${val.substring(6)}`;
    } else {
      return `(${val.substring(0, 2)}) ${val.substring(
        2,
        7
      )}-${val.substring(7, 11)}`;
    }
  }
  function handleTelefoneChange(event: React.ChangeEvent<HTMLInputElement>) {
    const formattedTelefone = formatPhoneNumber(event.target.value);
    setTelefone(formattedTelefone);
    setTelefoneError(false);
  }
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
      setNomeOriginal(e.target.files[0]);
      setModalOpen(true);
    }
  };
  function deleteImage(usuarioId: string) {
    api
      .delete("usuarios/delete/user/image/" + usuarioId)
      .then((resposta) => {
        setPreview({ src: "/img/icones/profile.webp" });
      });
  }
  const onFinishBasico = (valores: any) => {
    api
      .patch("usuarios/" + usuario.id, {
        nome: valores.nome,
        dataNascimento: valores.dataNascimento,
        creci: valores.creci,
        cpf: cpf,
        celular: telefone,
      })
      .then((resposta) => {
        toast.success("Informações Básicas alterado com sucesso!");
      })
  };

  return (
    <Layout>
      <div className="custom-scrollbar h-[calc(100vh-56px)] overflow-y-auto">
        <div className="mx-6 pt-8 pb-2 border-gray-300 border-b-2 flex justify-between ">
          <div className="flex items-center gap-6 px-6">
            <p className="text-3xl font-bold">Meu Perfil</p>
          </div>
        </div>
        <CropperModal
          modalOpen={modalOpen}
          src={src}
          nomeOriginal={nomeOriginal}
          setModalOpen={setModalOpen}
          usuarioId={usuario.id}
          setPreview={setPreview}
        />

        {modalSenha && <AlterarSenhaUsuario idUsuario={usuario.id} />}
        {contaUsuario && (
          <div className="sm:px-[6%] px-6 mt-4 pb-6">
            <div className="grid sm:grid-cols-3 gap-6">
              {preview && (
                <div className="my-auto sm:col-span-1">
                  {preview && preview.src !== "/img/icones/profile.webp" && (
                    <div className="relative h-0 sm:w-full w-0 flex justify-center top-4 left-[94px]">
                      <button
                        type="button"
                        onClick={() => deleteImage(usuario.id)}
                      >
                        <IoMdClose
                          size={32}
                          className="text-red-500 bg-white rounded-full"
                        />
                      </button>
                    </div>
                  )}

                  <img
                    src={preview?.src}
                    className="rounded-md w-[250px] mx-auto"
                  />

                  <div className="mt-6 w-full flex justify-center bg-white">
                    <button
                      type="button"
                      onClick={handleInputClick}
                      className="bg-[#ff9933] text-white  py-2 px-6 rounded-lg"
                    >
                      Carregar foto
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    className="invisible h-0"
                    onChange={handleImgChange}
                  />
                </div>
              )}

              <Form
                className="col-span-2"
                form={form}
                onFinish={onFinishBasico}
                layout="vertical"
              >
                <div className="col-span-2">
                  <div className="border-[1px] border-verde rounded-lg pb-4">
                    <div className="text-white bg-verde text-xl font-bold rounded-t-lg py-2">
                      <p className="text-center">Informações Básicas</p>
                    </div>

                    <div className="flex justify-end mb-4 px-4 mt-2">
                      <Switch
                        className="mt-2 w-40"
                        checked={contaUsuario.status === "ATIVO"}
                        disabled={true}
                        checkedChildren={<p className="text-md font-bold">ATIVO</p>}
                        unCheckedChildren={
                          <p className="text-md font-bold">INATIVO</p>
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 px-4">
                      <Form.Item
                        initialValue={contaUsuario.email}
                        rules={[
                          { required: true, message: "Por favor insira o email" },
                          { type: "email", message: "Email inválido!" },
                        ]}
                        name="email"
                        label={
                          <p className="text-[#1F1509] font-alumni text-xl font-bold">
                            Email
                          </p>
                        }
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        initialValue={
                          contaUsuario.perfil
                            ? contaUsuario.perfil.nome
                            : contaUsuario.role
                        }
                        name="Perfil"
                        label={
                          <p className="text-[#1F1509] font-alumni text-xl font-bold">
                            Perfil
                          </p>
                        }
                      >
                        <Input disabled />
                      </Form.Item>
                    </div>

                    <div className="grid  grid-cols-2 sm:grid-cols-3 gap-x-6 px-4">
                      <Form.Item
                        className="col-span-2"
                        initialValue={contaUsuario.nome}
                        rules={[
                          { required: true, message: "Por favor insira o nome!" },
                        ]}
                        name="nome"
                        label={
                          <p className="text-[#1F1509] font-alumni text-xl font-bold">
                            Nome Completo
                          </p>
                        }
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        initialValue={
                          moment(contaUsuario.dataNascimento).isValid()
                            ? moment(contaUsuario.dataNascimento)
                            : null
                        }
                        name="dataNascimento"
                        label={
                          <p className="font-bold text-base">
                            Data de Nasci.
                          </p>
                        }
                      >
                        <DatePicker format="DD/MM/YYYY" className="w-full" />
                      </Form.Item>
                      <Form.Item
                        initialValue={contaUsuario.creci}
                        name="creci"
                        label={
                          <p className="text-[#1F1509] font-alumni text-xl font-bold">
                            CRECI
                          </p>
                        }
                      >
                        <Input />
                      </Form.Item>
                      <div className="mb-4 ">
                        <label
                          className="text-[#1F1509] font-alumni text-xl font-bold "
                          htmlFor="cpf"
                        >
                          CPF
                        </label>
                        <input
                          placeholder="111.111.111-11"
                          className="border-[1px] border-gray-300 w-full rounded-md h-8 px-3 mt-2"
                          value={cpf}
                          name="cpf"
                          onChange={handleCPFChange}
                        />
                        {cpfError === true ? (
                          <p className="text-red-500 text-[10px] mt-1">
                            CPF Invalido!
                          </p>
                        ) : (
                          <></>
                        )}
                        {cpfNull === true ? (
                          <p className="text-red-500 text-[10px] mt-1">
                            Por favor digite o CPF!
                          </p>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          className="text-[#1F1509] font-alumni text-xl font-bold "
                          htmlFor="telefone"
                        >
                          Telefone{" "}
                        </label>
                        <input
                          placeholder="(32) 99999 9999"
                          className="border-[1px] border-gray-300 w-full rounded-md h-8 px-3 mt-2"
                          name="telefone"
                          value={telefone}
                          onChange={handleTelefoneChange}
                        />
                        {telefoneError === true ? (
                          <p className="text-red-500 text-[10px] mt-1">
                            Telefone Invalido!
                          </p>
                        ) : (
                          <></>
                        )}
                        {telefoneNull === true ? (
                          <p className="text-red-500 text-[10px] mt-1">
                            Por favor digite o telefone!
                          </p>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center items-center gap-6 mt-4">
                      <button
                        onClick={() => setModalSenha(true)}
                        type="button"
                        className="bg-verde text-white py-2 px-6 rounded-md"
                      >
                        Alterar Senha
                      </button>
                      <button className="bg-verde text-white py-2 px-6 rounded-md">
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <EnderecoUsuario
                idUsuario={usuario.id}
                cepEntrada={contaUsuario.cep}
                logradouro={contaUsuario.logradouro}
                numero={contaUsuario.numero}
                complemento={contaUsuario.complemento}
                estadoEntrada={contaUsuario.estado}
                cidadeEntrada={contaUsuario.cidade}
                bairroEntrada={contaUsuario.bairro}
              />
              <DadosBancariosUsuario
                idUsuario={usuario.id}
                id={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].id
                    : null
                }
                banco={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].banco
                    : null
                }
                agencia={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].agencia
                    : null
                }
                operacao={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].operacao
                    : null
                }
                conta={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].conta
                    : null
                }
                tipoConta={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].tipoConta
                    : null
                }
                cpfcnpjConta={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].cpfcnpjConta
                    : null
                }
                tipoChavePix={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].tipoChavePix
                    : null
                }
                chavePix={
                  contaUsuario.usuarioFinanceiro[0]
                    ? contaUsuario.usuarioFinanceiro[0].chavePix
                    : null
                }
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
export async function getServerSideProps({ query, req }: any) {
  if (req.cookies.PLSYNsSrVpa2uh) {
    const resposta = await axios.post(url + "auth/refresh", undefined, {
      headers: {
        Authorization: `Bearer ${req.cookies.PLSYNsSrVpa2uh}`,
        "api-key": apiKey,
      },
    });
    const resposta2 = await axios.get(url + "usuarios/profile", {
      headers: {
        Authorization: `Bearer ${resposta.data.accessToken}`,
        "api-key": apiKey,
      },
    });
    if (resposta2.data) {
      return {
        props: {
          usuario: resposta2.data,
        },
      };
    } else {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
}