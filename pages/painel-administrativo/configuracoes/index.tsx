import { ReactNode, useEffect, useState } from "react";
import { BiSolidUserRectangle } from "react-icons/bi";
import {
  FaCodeBranch,
  FaHouseUser,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import diacritics from "diacritics";
import { IoMdSearch } from "react-icons/io";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { removeAccents } from "@/global/TratamentosDeStrings";
import Layout from "@/components/Layout";
import { BsFillHouseGearFill } from "react-icons/bs";
import { api } from "@/services/apiClient";
import { UsuarioGlobal } from "@/global/usuario";
import LoadingScreen from "@/components/LoadingScreen";
import { useAtom } from "jotai";
import { telaTamanho } from "@/pages/_app";

export type Configuracoes = Configuracao[];
export interface Configuracao {
  id: string;
  icone: ReactNode;
  nome: string;
  opcao: Opcao[];
}
export interface Opcao {
  id: string;
  nome: string;
  rota: string;
  descricao: string;
  modulo: string;
  icone: ReactNode;
}
interface Modulo {
  id: number;
  nome: string;
}

const configuracoes: Configuracoes = [
  {
    id: "1",
    icone: <FaUsers size={30} />,
    nome: "Usuários",
    opcao: [
      {
        id: "11",
        descricao:
          "Cadastre ou remova os usuários que poderão acessar o HomeClix",
        icone: <FaUserPlus size={30} />,
        nome: "Gerenciar Usuários",
        modulo: "Usuários",
        rota: "/painel-administrativo/configuracoes/usuarios/gerenciar",
      },
      {
        id: "13",
        descricao:
          "Crie e manipule perfis de usuário para distinguir o que cada um pode acessar no sistema.",
        icone: <BiSolidUserRectangle size={30} />,
        nome: "Perfil do usuário",
        modulo: "Perfis",
        rota: "/painel-administrativo/configuracoes/usuarios/perfil",
      },
    ],
  },
  {
    id: "3",
    icone: <BsFillHouseGearFill size={30} />,
    nome: "Imobiliária",
    opcao: [
      {
        id: "31",
        descricao: "Crie e manipule os dados da imobiliária",
        icone: <BiSolidUserRectangle size={30} />,
        nome: "Minha Imobiliária",
        modulo: "Imobiliária",
        rota: "/painel-administrativo/configuracoes/imobiliaria/minha-imobiliaria",
      },
      {
        id: "32",
        descricao:
          "Cadastre, edite ou remova as filiais que poderão ser registrado nos imóveis",
        icone: <FaCodeBranch size={30} />,
        nome: "Filial",
        modulo: "Filiais",
        rota: "/painel-administrativo/configuracoes/imobiliaria/filiais",
      },
    ],
  },
  {
    id: "3",
    icone: <FaHouseUser size={30} />,
    nome: "Imovéis",
    opcao: [
      {
        id: "31",
        descricao:
          "Cadastre, edite ou remova os atributos que poderão ser regristrado nos imóveis.",
        icone: <FaUserPlus size={30} />,
        nome: "Atributos",
        modulo: "Atributos Imóveis",
        rota: "/painel-administrativo/configuracoes/imoveis/atributos",
      },
      {
        id: "32",
        descricao:
          "Cadastre, edite ou remova os Categorias que poderão ser regristrado nos imóveis",
        icone: <BiSolidUserRectangle size={30} />,
        nome: "Categorias",
        modulo: "Categorias Imóveis",
        rota: "/painel-administrativo/configuracoes/imoveis/categorias",
      },
    ],
  },
];

export default function Configuracoes() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [tela, setTela] = useAtom(telaTamanho);
  function highlightSearchTerm(
    text: string,
    searchTerm: string
  ): React.ReactNode {
    if (!searchTerm.trim()) {
      return text;
    }

    const normalizedText = diacritics.remove(text.toLowerCase()); // Remover acentos e converter para minúsculas
    const normalizedSearchTerm = diacritics.remove(
      searchTerm.toLowerCase()
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
          <span key={currentIndex}>{text.substr(currentIndex)}</span>
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
          {text.substr(matchIndex, searchTerm.length)}
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

  const [profile, setProfile] = useState<Modulo[]>([]);
  useEffect(() => {
    async function fetchData() {
      const modulos = await api.get("modulos/listar");
      setProfile(modulos.data);
    }

    fetchData();
  }, []);
  const filteredData = configuracoes
    .map((config) => {
      const valor = config.opcao.filter((opcao) => {
        const valores = profile.filter((modulos) => {
          if (opcao.modulo === modulos.nome) {
            return true;
          }
        });
        if (valores && valores.length > 0) {
          return true;
        }
      });
      if (valor && valor.length > 0) {
        return {
          ...config,
          opcao: valor,
        };
      }
    })
    .map((configuracao) => {
      const searchRegex = new RegExp(searchTerm, "i");
      if (configuracao) {
        if (searchRegex.test(removeAccents(configuracao.nome))) {
          return configuracao; // Retorna toda a configuração
        }

        // Se o nome da configuração não for compatível, filtra as opções
        const filteredOpcoes = configuracao.opcao.filter((opcao) => {
          return (
            searchRegex.test(removeAccents(opcao.nome)) ||
            searchRegex.test(removeAccents(opcao.descricao))
            // Adicione mais campos conforme necessário
          );
        });

        // Retorna apenas a configuração com as opções relevantes

        return {
          ...configuracao,
          opcao: filteredOpcoes,
        };
      } else {
        return configuracao;
      }
    });

  const filteredDataWithoutEmptyConfigurations =
    filteredData.filter((config) => config && config.opcao.length > 0);
  if (
    filteredDataWithoutEmptyConfigurations.length > 0 &&
    loading !== true
  ) {
    setLoading(true);
  }

  return (
    <Layout>
      <NextSeo title="Configurações" description="configurar o CRM" />
      <div className="w-[calc(100%-64px) h-[calc(100vh-68px)] custom-scrollbar">
        <div className="mx-6 pt-4 pb-2 h-16 border-gray-300 border-b-2 flex justify-between ">
          <p className="sm:text-3xl font-bold my-auto">Configurações</p>
          <div className="flex justify-center items-center bg-white px-2 border-2 rounded-lg focus-within:border-azul-evler">
            <input
              onChange={handleSearch}
              className="w-full sm:w-[500px] focus:outline-none"
              placeholder="Busque por título,grupo ou descrição da configuração"
            />
            <IoMdSearch size={20} />
          </div>
        </div>
        <div
          className={` overflow-y-auto custom-scrollbar sm:px-6`}
          style={{ height: `${tela - 121}px` }}
        >
          {loading === true ? (
            <>
              {filteredDataWithoutEmptyConfigurations.length > 0 ? (
                <>
                  {filteredDataWithoutEmptyConfigurations.map((config) => (
                    <div key={config?.id}>
                      <div className="mt-4 sm:mt-10 mx-6 flex items-center gap-2 ">
                        {config?.icone}
                        <p className="sm:text-3xl text-xl font-bold">
                          {highlightSearchTerm(
                            config?.nome ? config?.nome : "",
                            searchTerm
                          )}
                        </p>
                      </div>
                      <div className="bg-white mx-6 py-2 sm:py-8 px-6 rounded-xl mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {config?.opcao.map((item) => (
                            <Link key={item.id} href={item.rota} className="group">
                              <div className="px-6 py-6 rounded-xl h-full  group-hover:bg-verde bg-[#E0EDF6]  ">
                                <div className="flex items-center gap-2 text-azul-evler group-hover:text-white">
                                  {item.icone}
                                  <p className="text-md sm:text-xl font-bold">
                                    {highlightSearchTerm(item.nome, searchTerm)}
                                  </p>
                                </div>
                                <p className="text-azul-evler group-hover:text-white text-sm sm:text-base mt-4">
                                  {highlightSearchTerm(
                                    item.descricao,
                                    searchTerm
                                  )}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex justify-center items-center h-full">
                  Nenhuma configuração foi localizada com o filtro informado.
                </div>
              )}
            </>
          ) : (
            <LoadingScreen heigth="480px" />
          )}
        </div>
      </div>
    </Layout>
  );
}