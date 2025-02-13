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
  ColorPicker,
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

interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

interface Letra {
  letra: string;
  categorias: Categoria[];
}
interface Permissoes {
  id: number;
  nome: string;
}
export default function Categorias() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cor, setCor] = useState<string>("#124B51");
  const [corEdit, setCorEdit] = useState<string>("");
  const [permissoes, setPermissoes] = useState<Permissoes[]>();
  const [atualizar, setAtualizar] = useState<boolean>(false);
  const [openCreateCategoria, setOpenCreateCategoria] =
    useState<boolean>(false);
  const [categorias, setCategorias] = useState<Letra[]>([]);
  const [idCategoria, setIdCategoria] = useState<string>("");
  const [nomeCategoria, setNomeCategoria] = useState<string>("");
  const [openExcluir, setOpenExcluir] = useState<boolean>(false);
  const [editarCategoria, setEditarCategoria] = useState<string>("");
  useEffect(() => {
    api
      .get("modulos/permissoes/13")
      .then((resposta) => {
        setPermissoes(resposta.data);
      });
    api
      .get("categorias/all")
      .then((resposta) => {
        console.log(resposta.data);
        const valor = resposta.data.sort((a: Categoria, b: Categoria) => {
          if (a.nome < b.nome) {
            return -1;
          }
          if (a.nome > b.nome) {
            return 1;
          }
          return 0;
        });

        setCategorias(
          valor.reduce((result: Letra[], atributo: Categoria) => {
            const letraInicial = atributo.nome.charAt(0).toUpperCase();
            let letraGroup = result.find(
              (group) => group.letra === letraInicial
            );
            if (!letraGroup) {
              letraGroup = { letra: letraInicial, categorias: [] };
              result.push(letraGroup);
            }
            letraGroup.categorias.push(atributo);
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
  const filteredData = categorias.map((categoria) => {
    const searchRegex = new RegExp(searchTerm, "i"); // 'i' faz a busca ser case insensitive

    // Verifica o nome da configuração
    if (searchRegex.test(removeAccents(categoria.letra))) {
      return categoria; // Retorna toda a configuração
    }

    // Se o nome da configuração não for compatível, filtra as opções
    const filteredOpcoes = categoria.categorias.filter((valor) => {
      return (
        searchRegex.test(removeAccents(valor.nome))
        // Adicione mais campos conforme necessário
      );
    });

    // Retorna apenas a configuração com as opções relevantes
    return {
      ...categoria,
      atributos: filteredOpcoes,
    };
  });
  const filteredDataWithoutEmptyConfigurations = filteredData.filter(
    (config) => config.categorias.length > 0
  );
  const onFinishCreate = (values: any) => {
    console.log(values);
    console.log(cor);

    api
      .post("categorias", {
        nome: values.categoria,
        cor: cor,
      })
      .then((resposta) => {
        toast.success("Categoria criado com sucesso");
        setOpenCreateCategoria(false);
        setAtualizar(!atualizar);
      });
  };
  const onFinishDelete = (values: any) => {
    api
      .delete("categorias/" + idCategoria)
      .then((resposta) => {
        toast.success("Categoria excluido com sucesso!");
        setOpenExcluir(false);
        setAtualizar(!atualizar);
      });
  };
  const onFinishUpdate = (values: any) => {
    api
      .patch("categorias/" + idCategoria, {
        nome: values.categoria,
        cor: corEdit,
      })
      .then((resposta) => {
        toast.success("Categoria atualizado com sucesso!");
        setEditarCategoria("");
        setAtualizar(!atualizar);
      });
  };
  function handleMenuClick(
    e: string,
    id: string,
    nome: string,
    cor: string
  ) {
    if (e === "1") {
      setIdCategoria(id);
      setEditarCategoria(id);
      setCorEdit(cor);
    } else if (e === "2") {
      setOpenExcluir(true);
      setIdCategoria(id);
      setNomeCategoria(nome);
    }
  }
  const items: MenuProps["items"] =
    permissoes &&
    permissoes.filter((permissao) => {
      if (
        permissao.nome === "Atualizar Categoria" ||
        permissao.nome === "Deletar Categoria"
      ) {
        return permissao;
      }
    }).length > 1
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
      : permissoes &&
        permissoes.filter((permissao) => {
          if (permissao.nome === "Atualizar Categoria") {
            return permissao;
          }
        }).length > 0
      ? [
          {
            label: <p className="px-2 font-bold">Editar</p>,
            key: "1",
          },
        ]
      : permissoes &&
        permissoes.filter((permissao) => {
          if (permissao.nome === "Deletar Categoria") {
            return permissao;
          }
        }).length > 0
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
              Excluir Atributo
            </p>
          }
          closeIcon={<IoMdClose size={24} color="white" className="" />}
        >
          <Form layout="vertical" className="px-10 mt-6" onFinish={onFinishDelete}>
            <p>
              Tem certeza que quer apagar a categoria:{" "}
              <span className="font-bold">{nomeCategoria}</span> ?
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
      {openCreateCategoria === true && (
        <Modal
          width={400}
          centered
          open={openCreateCategoria}
          onCancel={() => setOpenCreateCategoria(false)}
          footer={false}
          title={
            <p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">
              Criar Categoria
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
              name="categoria"
              rules={[{ required: true, message: "Por favor insira o nome da categoria" }]}
              label={<p className="font-bold text-md">Nome da Categoria</p>}
            >
              <Input />
            </Form.Item>
            <Form.Item name="cor" label={<p className="font-bold text-md">Cor</p>}>
              <ColorPicker
                defaultValue={cor}
                value={cor}
                onChange={(value, hex) => setCor(hex)}
              />
            </Form.Item>
            <div className="flex justify-center gap-4 pb-4 mt-8">
              <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                Criar Categoria
              </button>
              <button
                type="button"
                onClick={() => setOpenCreateCategoria(false)}
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
          <p className="sm:text-2xl   font-bold">Categoria Imóveis</p>
        </div>
        <div className="flex justify-center items-center bg-white px-2 border-2 rounded-lg focus-within:border-azul-evler">
          <input
            onChange={handleSearch}
            className="w-full sm:w-[500px] focus:outline-none"
            placeholder="Busque por categorias de imóveis"
          />
          <IoMdSearch size={20} />
        </div>
        <div>
          {permissoes &&
          permissoes.filter((modulo) => {
            if (modulo.nome === "Cadastrar Categoria") {
              return modulo;
            }
          }).length > 0 ? (
            <button
              onClick={() => setOpenCreateCategoria(true)}
              className="bg-verde text-white px-8 py-1 sm:py-2 rounded-xl mt-2 mx-auto flex justify-center "
            >
              Cadastrar Categoria
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="px-6 mt-4 space-y-6 h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
        {filteredDataWithoutEmptyConfigurations.length > 0 ? (
          filteredDataWithoutEmptyConfigurations.map((letra) => (
            <div key={letra.letra}>
              <div className="border-b-2 border-b-gray-300">
                <p className="font-bold text-xl">
                  {highlightSearchTerm(letra.letra, searchTerm)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 ">
                {letra.categorias.map((atributo) => (
                  <div
                    key={atributo.id}
                    className={` font-bold shadow-2xl   rounded-md`}
                    style={{ backgroundColor: atributo.cor, color: "#fff" }}
                  >
                    {editarCategoria === atributo.id ? (
                      <Form
                        onFinish={onFinishUpdate}
                        className="flex justify-between items-center gap-2 bg-gray-300 rounded-md py-2 px-4  "
                      >
                        <Form.Item name="cor" className="mb-0">
                          <ColorPicker
                            defaultValue={atributo.cor}
                            value={corEdit}
                            onChange={(value, hex) => setCorEdit(hex)}
                          />
                        </Form.Item>
                        <Form.Item
                          name="categoria"
                          initialValue={atributo.nome}
                          className="mb-0 w-full sm:w-40"
                        >
                          <Input required />
                        </Form.Item>
                        <div className="flex gap-1 ">
                          <button>
                            <GiConfirmed size={28} className="text-green-500  " />
                          </button>
                          <button type="button" onClick={() => setEditarCategoria("")}>
                            <IoMdCloseCircle
                              size={28}
                              className="text-red-500  "
                            />
                          </button>
                        </div>
                      </Form>
                    ) : (
                      <div className="flex justify-between py-2 px-4  items-center gap-4">
                        <p className="text-lg">
                          {highlightSearchTerm(atributo.nome, searchTerm)}
                        </p>
                        <div>
                          {permissoes &&
                          permissoes.filter((permissao) => {
                            if (
                              permissao.nome === "Atualizar Categoria" ||
                              permissao.nome === "Deletar Categoria"
                            ) {
                              return permissao;
                            }
                          }).length > 0 ? (
                            <Dropdown
                              menu={{
                                items,
                                onClick: (e) =>
                                  handleMenuClick(
                                    e.key,
                                    atributo.id,
                                    atributo.nome,
                                    atributo.cor
                                  ),
                              }}
                            >
                              <SlOptionsVertical size={18} />
                            </Dropdown>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xl font-bold">Nenhuma categoria localizada</p>
        )}
      </div>
    </Layout>
  );
}