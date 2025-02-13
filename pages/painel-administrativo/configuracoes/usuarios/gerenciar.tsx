import { removeAccents } from "@/global/TratamentosDeStrings";
import diacritics from "diacritics";
import { Suspense, lazy, useEffect } from "react";
import { Avatar, Popconfirm, Select, SelectProps } from "antd";
import Link from "next/link";
import { useState } from "react";
import { MdDelete, MdOutlineKeyboardBackspace } from "react-icons/md";
import { atom, useAtom } from "jotai";
import { api } from "@/services/apiClient";
import { toast } from "react-toastify";
import Router from "next/router";
import { UsuarioGlobal } from "@/global/usuario";
import Layout from "@/components/Layout";
import { FaLongArrowAltRight } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";

interface Usuario {
  id: string;
  nome: string;
  foto?: string;
  email: string;
  celular: string;
  cpf: string;
  perfil?: Perfil;
  role?: string;
  ultimaInteracao?: string;
}
interface Perfil {
  id: number;
  nome: string;
}

const ModalCadastrar = lazy(() =>
  import("../../../../components/ModalUsuarioCadastrar")
);
export const openCadastrar = atom<boolean>(false);
export const atualizarGerenciarAtom = atom<boolean>(false);
export default function Gerenciar() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useAtom<boolean>(openCadastrar);
  const [atualizar, setAtualizar] = useAtom(atualizarGerenciarAtom);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [profile, setProfile] = useState<UsuarioGlobal>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    api
      .get("/usuarios")
      .then((resposta) => {
        setUsuarios(resposta.data);
        console.log(resposta.data);
      });
    api
      .get("perfis")
      .then((resposta) => {
        setPerfis(resposta.data);
      });
    api
      .get("usuarios/profile")
      .then((resposta) => {
        setProfile(resposta.data);

        if (
          resposta.data.perfil?.permissoesPerfis.filter((modulo: any) => {
            if (modulo.nome === "Usuários") {
              return modulo;
            }
          }).length === 0
        ) {
          Router.push("/painel-administrativo/configuracoes");
        } else {
          setLoading(true);
        }
      });
  }, [atualizar]);
  function removeAccentsAndLowercase(str: string): string {
    if (!str) {
      return "";
    }
    return diacritics.remove(str.toLowerCase());
  }

  function highlightSearchTerm(
    text: string,
    searchTerm: string
  ): React.ReactNode {
    if (
      !text ||
      !searchTerm ||
      typeof text !== "string" ||
      typeof searchTerm !== "string"
    ) {
      return text;
    }

    const normalizedText = removeAccentsAndLowercase(text); // Remover acentos e converter para minúsculas
    const normalizedSearchTerm = removeAccentsAndLowercase(
      searchTerm
    ); // Remover acentos do termo de busca e converter para minúsculas
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      const matchIndex = normalizedText.indexOf(
        normalizedSearchTerm,
        currentIndex
      );

      if (matchIndex === -1) {
        parts.push(
          <span key={currentIndex}>{text.substring(currentIndex)}</span>
        );
        break;
      }

      parts.push(
        <span key={currentIndex}>
          {text.substring(currentIndex, matchIndex)}
        </span>
      );
      parts.push(
        <mark key={matchIndex}>
          {text.substring(matchIndex, matchIndex + searchTerm.length)}
        </mark>
      );

      currentIndex = matchIndex + searchTerm.length;
    }

    return parts;
  }
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(removeAccents(term));
  };
  const optionsPerfis: SelectProps["options"] = [
    { label: "Nenhum", value: 0 },
    ...(perfis?.map((perfil) => ({
      label: perfil.nome,
      value: perfil.id,
    })) || []),

    // Adicione mais opções conforme necessário
  ];
  function updatePerfil(id: string, opcao: number) {
    let id_perfil: number | null = opcao;
    if (opcao === 0) {
      id_perfil = null;
    }
    api
      .patch(`usuarios/${id}`, {
        idPerfil: id_perfil,
      })
      .then((resposta) => {
        toast.success("Perfil trocado com sucesso!");
      });
  }
  function deleteAdmin(id: string) {
    console.log(id);
    api
      .delete(`usuarios/${id}`)
      .then((resposta) => {
        toast.success("Usuario deletado com sucesso!");
      });
  }
  const filteredData = usuarios.filter((usuario) => {
    const searchRegex = new RegExp(searchTerm, "i"); // 'i' faz a busca ser case insensitive

    // Se o nome da configuração não for compatível, filtra as opções
    return (
      (searchRegex.test(removeAccents(usuario.nome)) ||
        searchRegex.test(removeAccents(usuario.email))) &&
      usuario.role !== "ROOT" &&
      usuario.role !== "DONO"
      // Adicione mais campos conforme necessário
    );
  });
  console.log(filteredData);
  return (
    <Layout>
      {loading === true ? (
        <div className="w-full h-full ">
          {open && (
            <Suspense>
              <ModalCadastrar />
            </Suspense>
          )}
          <div className="mx-6 pt-6 pb-2 border-gray-300 border-b-2 flex flex-col sm:flex-row justify-between ">
            <div className="flex items-center gap-2 py-2 justify-center">
              <Link
                href="/painel-administrativo/configuracoes"
                className="underline-offset-4 no-underline hover:underline "
              >
                <p className="sm:text-2xl   font-bold">Configurações</p>
              </Link>
              <FaLongArrowAltRight />
              <p className="sm:text-2xl   font-bold">Gerenciar Usuários</p>
            </div>
            <div className="flex justify-center items-center bg-white px-2 border-2 rounded-lg focus-within:border-azul-evler">
              <input
                onChange={handleSearch}
                className="w-full sm:w-[500px] focus:outline-none"
                placeholder="Busque por nome ou email do usuário"
              />
              <IoMdSearch size={20} />
            </div>
            <div>
              {profile &&
              profile.perfil &&
              profile?.perfil?.permissoesPerfis.filter((modulo) => {
                if (modulo.nome === "Usuários") {
                  const valor = modulo.permissoes.filter((permissao) => {
                    if (permissao.nome === "Cadastrar Usuário") {
                      return true;
                    }
                  });
                  if (valor.length > 0) {
                    return true;
                  }
                }
              }).length > 0 ||
              profile?.role === "ROOT" ||
              profile?.role === "DONO" ? (
                <button
                  onClick={() => setOpen(true)}
                  className="bg-verde text-white px-8 py-1 sm:py-2 rounded-xl mt-2 mx-auto flex justify-center "
                >
                  Cadastrar Usuário
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className=" h-[calc(100vh-170px)] overflow-y-auto custom-scrollbar mx-4">
            <table className="w-full  ">
              <thead className="rounded-xl bg-verde sticky-header !z-0 ">
                <tr className="">
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none w-20 ">
                      Foto
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      Nome
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      Email
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      Telefone
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      CPF
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      Perfil
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      Ultimo Acesso
                    </p>
                  </th>
                  <th className="py-4 text-left px-2 sm:px-4">
                    <p className="font-bold text-start text-base text-white leading-none ">
                      Ações
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody className="rounded-b-xl">
                {filteredData.map((usuario: Usuario, index) => (
                  <tr
                    key={index}
                    className={`border-2 ${
                      index % 2 === 0 ? "bg-white" : "bg-verde/15"
                    } group hover:bg-verde/30`}
                  >
                    <td className="px-2 sm:px-4 py-3 w-20">
                      {usuario.foto ? (
                        <Avatar src={usuario.foto} alt="imagem" size={60} />
                      ) : (
                        <Avatar
                          src="/img/icones/profile.webp"
                          alt="imagem"
                          size={60}
                        />
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {highlightSearchTerm(usuario.nome, searchTerm)}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      {highlightSearchTerm(usuario.email, searchTerm)}
                    </td>
                    <td className="px-2 sm:px-4 py-3">{usuario.celular}</td>
                    <td className="px-2 sm:px-4 py-3">{usuario.cpf}</td>
                    <td className="px-2 sm:px-4 py-3">
                      {profile &&
                      profile.perfil &&
                      profile?.perfil?.permissoesPerfis.filter((modulo) => {
                        if (modulo.nome === "Usuários") {
                          const valor = modulo.permissoes.filter(
                            (permissao) => {
                              if (permissao.nome === "Atualizar Usuário") {
                                return true;
                              }
                            }
                          );
                          if (valor.length > 0) {
                            return true;
                          }
                        }
                      }).length > 0 ||
                      profile?.role === "ROOT" ||
                      profile?.role === "DONO" ? (
                        <Select
                          defaultValue={usuario.perfil?.id || 0}
                          onChange={(e) => updatePerfil(usuario.id, e)}
                          className="w-full sm:w-40"
                          options={optionsPerfis}
                        />
                      ) : (
                        <p>{usuario.perfil?.nome}</p>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <p className="text-base ">{usuario.ultimaInteracao}</p>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex gap-2 items-center">
                        {profile &&
                        profile.perfil &&
                        profile?.perfil?.permissoesPerfis.filter((modulo) => {
                          if (modulo.nome === "Usuários") {
                            const valor = modulo.permissoes.filter(
                              (permissao) => {
                                if (permissao.nome === "Deletar Usuário") {
                                  return true;
                                }
                              }
                            );
                            if (valor.length > 0) {
                              return true;
                            }
                          }
                        }).length > 0 || profile?.role === "ROOT" ? (
                          <Popconfirm
                            title="Deletar Usuario"
                            description="Tem certeza que deseja deletar este usuario?"
                            onConfirm={() => deleteAdmin(usuario.id)}
                            okText="Sim"
                            cancelText="Não"
                          >
                            <button>
                              <MdDelete className="text-red-500" size={28} />
                            </button>
                          </Popconfirm>
                        ) : (
                          <></>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <></>
      )}
    </Layout>
  );
}