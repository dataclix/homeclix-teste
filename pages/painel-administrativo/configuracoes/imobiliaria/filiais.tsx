import Layout from "@/components/Layout";
import { removeAccents } from "@/global/TratamentosDeStrings";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight, FaRegEdit } from "react-icons/fa";
import diacritics from "diacritics";
import {
  IoMdClose,
  IoMdCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { api } from "@/services/apiClient";
import { UsuarioGlobal } from "@/global/usuario";
import Router from "next/router";
import {
  Dropdown,
  Form,
  Input,
  MenuProps,
  Modal,
  Space,
} from "antd";
import { toast } from "react-toastify";
import { SlOptionsVertical } from "react-icons/sl";
import { GiConfirmed } from "react-icons/gi";

interface Atributo {
  id: string;
  nome: string;
}

interface Letra {
  letra: string;
  atributos: Atributo[];
}

export default function Filiais() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [profile, setProfile] = useState<UsuarioGlobal>();
  const [atualizar, setAtualizar] = useState<boolean>(false);
  const [openCreateAtributo, setOpenCreateAtributo] = useState<boolean>(false);
  const [atributos, setAtributos] = useState<Letra[]>([]);
  const [idAtributo, setIdAtributo] = useState<string>("");
  const [nomeAtributo, setNomeAtributo] = useState<string>("");
  const [openExcluir, setOpenExcluir] = useState<boolean>(false);
  const [editarAtributo, setEditarAtributo] = useState<string>("");
  useEffect(() => {
    api
      .get("usuarios/profile")
      .then((resposta) => {
        setProfile(resposta.data);

        if (
          resposta.data.perfil?.permissoesPerfis.filter((modulo: any) => {
            if (modulo.nome === "Filiais") {
              return modulo;
            }
          }).length === 0
        ) {
          Router.push("/painel-administrativo/configuracoes");
        } else {
        }
      });
    api
      .get("filiais/all")
      .then((resposta) => {
        const valor = resposta.data.sort((a: Atributo, b: Atributo) => {
          if (a.nome < b.nome) {
            return -1;
          }
          if (a.nome > b.nome) {
            return 1;
          }
          return 0;
        });

        setAtributos(
          valor.reduce((result: Letra[], atributo: Atributo) => {
            const letraInicial = removeAccents(
              atributo.nome.charAt(0).toUpperCase()
            );
            let letraGroup = result.find(
              (group) => group.letra === letraInicial
            );
            if (!letraGroup) {
              letraGroup = { letra: letraInicial, atributos: [] };
              result.push(letraGroup);
            }
            letraGroup.atributos.push(atributo);
            return result;
          }, [])
        );
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
  const filteredData = atributos.map((atributo) => {
    const searchRegex = new RegExp(searchTerm, "i"); // 'i' faz a busca ser case insensitive

    // Verifica o nome da configuração
    if (searchRegex.test(removeAccents(atributo.letra))) {
      return atributo; // Retorna toda a configuração
    }

    // Se o nome da configuração não for compatível, filtra as opções
    const filteredOpcoes = atributo.atributos.filter((valor) => {
      return (
        searchRegex.test(removeAccents(valor.nome))
        // Adicione mais campos conforme necessário
      );
    });

    // Retorna apenas a configuração com as opções relevantes
    return {
      ...atributo,
      atributos: filteredOpcoes,
    };
  });
  const filteredDataWithoutEmptyConfigurations = filteredData.filter(
    (config) => config.atributos.length > 0
  );
  const onFinishCreate = (values: any) => {
    api
      .post("filiais", {
        nome: values.atributo,
      })
      .then((resposta) => {
        toast.success("Filial criado com sucesso");
        setOpenCreateAtributo(false);
        setAtualizar(!atualizar);
      });
  };
  const onFinishDelete = (values: any) => {
    api
      .delete("filiais/" + idAtributo)
      .then((resposta) => {
        toast.success("Filial excluido com sucesso!");
        setOpenExcluir(false);
        setAtualizar(!atualizar);
      });
  };
  const onFinishUpdate = (values: any) => {
    api
      .patch("filiais/" + idAtributo, {
        nome: values.atributo,
      })
      .then((resposta) => {
        toast.success("Filial atualizado com sucesso!");
        setEditarAtributo("");
        setAtualizar(!atualizar);
      });
  };
  function handleMenuClick(e: string, id: string, nome: string) {
    if (e === "1") {
      setIdAtributo(id);
      setEditarAtributo(id);
    } else if (e === "2") {
      setOpenExcluir(true);
      setIdAtributo(id);
      setNomeAtributo(nome);
    }
  }
  const items: MenuProps["items"] =
    profile &&
    profile.perfil &&
    profile?.perfil?.permissoesPerfis.filter((modulo) => {
      if (modulo.nome === "Filiais") {
        const valor = modulo.permissoes.filter((permissao) => {
          if (
            permissao.nome === "Atualizar Filial" ||
            permissao.nome === "Deletar Filial"
          ) {
            return true;
          }
        });

        if (valor.length > 1) {
          return true;
        }
      }
    }).length > 0 ||
    profile?.role === "ROOT" ||
    profile?.role === "DONO"
      ? [
          {
            label: <p className="px-2 font-bold">Editar</p>,
            key: "1",
          },
          {
            label: <p className="px-2 font-bold">Excluir</p>,
            key: "2",
          },
        ]
      : profile &&
        profile.perfil &&
        profile?.perfil?.permissoesPerfis.filter((modulo) => {
          if (modulo.nome === "Filiais") {
            const valor = modulo.permissoes.filter((permissao) => {
              if (permissao.nome === "Atualizar Filial") {
                return true;
              }
            });
            if (valor.length > 0) {
              return true;
            }
          }
        }).length > 0 ||
        profile?.role === "ROOT" ||
        profile?.role === "DONO"
      ? [
          {
            label: <p className="px-2 font-bold">Editar</p>,
            key: "1",
          },
        ]
      : profile &&
        profile.perfil &&
        profile?.perfil?.permissoesPerfis.filter((modulo) => {
          if (modulo.nome === "Filiais") {
            const valor = modulo.permissoes.filter((permissao) => {
              if (permissao.nome === "Deletar Filial") {
                return true;
              }
            });
            if (valor.length > 0) {
              return true;
            }
          }
        }).length > 0 ||
        profile?.role === "ROOT" ||
        profile?.role === "DONO"
      ? [
          {
            label: <p className="px-2 font-bold">Excluir</p>,
            key: "2",
          },
        ]
      : [];

  return (
    <Layout>
      {openExcluir === true && (
        <Modal
          width={400}
          centered
          open={openExcluir}
          onCancel={() => setOpenExcluir(false)}
          footer={false}
          title={
            <p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">
              Excluir Filial
            </p>
          }
          closeIcon={<IoMdClose size={24} color="white" className="" />}
        >
          <Form
            layout="vertical"
            className="px-10 mt-6"
            onFinish={onFinishDelete}
          >
            <p>
              Tem certeza que quer apagar a filial:{" "}
              <span className="font-bold">{nomeAtributo}</span> ?
            </p>
            <div className="flex justify-center gap-4 pb-4 mt-8">
              <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                Sim
              </button>
              <button
                type="button"
                onClick={() => setOpenExcluir(false)}
                className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10"
              >
                Não
              </button>
            </div>
          </Form>
        </Modal>
      )}
      {openCreateAtributo === true && (
        <Modal
          width={400}
          centered
          open={openCreateAtributo}
          onCancel={() => setOpenCreateAtributo(false)}
          footer={false}
          title={
            <p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">
              Criar Filial
            </p>
          }
          closeIcon={<IoMdClose size={24} color="white" className="" />}
        >
          <Form
            layout="vertical"
            className="px-10 mt-6"
            onFinish={onFinishCreate}
          >
            <Form.Item
              name="atributo"
              rules={[{ required: true, message: "Por favor insira o nome da filial" }]}
              label={<p className="font-bold text-md">Nome da Filial</p>}
            >
              <Input />
            </Form.Item>
            <div className="flex justify-center gap-4 pb-4 mt-8">
              <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                Criar Filial
              </button>
              <button
                type="button"
                onClick={() => setOpenCreateAtributo(false)}
                className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10"
              >
                Cancelar
              </button>
            </div>
          </Form>
        </Modal>
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
          <p className="sm:text-2xl   font-bold">Filiais</p>
        </div>
        <div className="flex justify-center items-center bg-white px-2 border-2 rounded-lg focus-within:border-azul-evler">
          <input
            onChange={handleSearch}
            className="w-full sm:w-[500px] focus:outline-none"
            placeholder="Busque por filial"
          />
          <IoMdSearch size={20} />
        </div>
        <div>
          {profile &&
          profile.perfil &&
          profile?.perfil?.permissoesPerfis.filter((modulo) => {
            if (modulo.nome === "Filiais") {
              const valor = modulo.permissoes.filter((permissao) => {
                if (permissao.nome === "Cadastrar Filial") {
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
              onClick={() => setOpenCreateAtributo(true)}
              className="bg-verde text-white px-8 py-1 sm:py-2 rounded-xl mt-2 mx-auto flex justify-center "
            >
              Cadastrar Filial
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="px-6 mt-4 space-y-6 h-[calc(100vh-170px)] overflow-y-auto custom-scrollbar">
        {filteredDataWithoutEmptyConfigurations.length > 0 ? (
          filteredDataWithoutEmptyConfigurations.map((letra) => (
            <div key={letra.letra}>
              <div className="border-b-2 border-b-gray-300">
                <p className="font-bold text-xl">
                  {highlightSearchTerm(letra.letra, searchTerm)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 ">
                {letra.atributos.map((atributo) => (
                  <div
                    key={atributo.id}
                    className="bg-gray-300 font-bold py-2 px-4  text-black rounded-md "
                  >
                    {editarAtributo === atributo.id ? (
                      <Form
                        onFinish={onFinishUpdate}
                        className="flex justify-between items-center gap-2 "
                      >
                        <Form.Item
                          name="atributo"
                          initialValue={atributo.nome}
                          className="mb-0 w-full sm:w-40"
                        >
                          <Input required />
                        </Form.Item>
                        <div className="flex gap-1">
                          <button>
                            <GiConfirmed size={24} className="text-green-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditarAtributo("")}
                          >
                            <IoMdCloseCircle
                              size={24}
                              className="text-red-500"
                            />
                          </button>
                        </div>
                      </Form>
                    ) : (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-lg">
                          {highlightSearchTerm(atributo.nome, searchTerm)}
                        </p>
                        <div>
                          <Dropdown
                            menu={{
                              items,
                              onClick: (e) =>
                                handleMenuClick(
                                  e.key,
                                  atributo.id,
                                  atributo.nome
                                ),
                            }}
                          >
                            <SlOptionsVertical size={18} />
                          </Dropdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xl font-bold">Nenhum filial localizado</p>
        )}
      </div>
    </Layout>
  );
}