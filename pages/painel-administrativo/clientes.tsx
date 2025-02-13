import Layout from "@/components/Layout";
import ModalCreateCliente from "@/components/ModalCreateCliente";
import UpdateCliente from "@/components/UpdateCliente";
import { removeAccents } from "@/global/TratamentosDeStrings";
import { api } from "@/services/apiClient";
import { atom, useAtom } from "jotai";
import { Suspense, useCallback, useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import diacritics from "diacritics";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Spinner } from "@material-tailwind/react";
import { UsuarioGlobal } from "@/global/usuario";
import { telaTamanho } from "../_app";
import _ from "lodash";

export const openCreateClienteAtom = atom(false);
export const clienteIdAtom = atom("");
export const atualizarAtom = atom(false);
export const atualizarEditarAtom = atom(false);
interface Clientes {
  total: number;
  clientes: Cliente[];
}
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  celular: string;
  cpfCnpj: string;
  tipoPessoa: string;
}
export const skipClienteAtom = atom(0);
export const takeClienteAtom = atom(10);

export default function Clientes() {
  const [openCreateCliente, setOpenCreateCliente] = useAtom(
    openCreateClienteAtom
  );
  const [atualizar, setAtualizar] = useAtom(atualizarAtom);
  const [atualizarEditar, setAtualizarEditar] = useAtom(atualizarEditarAtom);
  const [clienteId, setClienteId] = useAtom(clienteIdAtom);
  const [clientes, setClientes] = useState<Clientes>({
    total: 0,
    clientes: [],
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<Cliente[]>([]);
  const [profile, setProfile] = useState<UsuarioGlobal>();
  const [height, setHeight] = useAtom(telaTamanho);
  const [skip, setSkip] = useAtom(skipClienteAtom);
  const [take, setTake] = useAtom(takeClienteAtom);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    api
      .post("clientes/filtrar/skip/0/take/10", { palavra: searchTerm })
      .then((resposta) => {
        console.log(resposta.data);
        setClientes(resposta.data);
        if (resposta.data.clientes.length > 0) {
          setClienteId(resposta.data.clientes[0].id);
        }

        setLoading(true);
      });
    api
      .get("usuarios/profile")
      .then((resposta) => {
        setProfile(resposta.data);
      });
  }, [atualizar]);
  useEffect(() => {
    api
      .post("clientes/filtrar/skip/" + 0 + "/take/" + (take + skip), {
        palavra: searchTerm,
      })
      .then((resposta) => {
        setClientes(resposta.data);
        setLoading(true);
      });
  }, [atualizarEditar]);

  useEffect(() => {
    console.log("entrou");
    api
      .post("clientes/filtrar/skip/" + skip + "/take/" + take, {
        palavra: searchTerm,
      })
      .then((resposta) => {
        console.log(resposta.data);
        setClientes((prevClientes) => ({
          ...prevClientes,
          clientes: [
            ...(prevClientes.clientes || []),
            ...resposta.data.clientes,
          ],
        }));
      });
  }, [skip]);
  function onChange(id: string) {
    if (window.innerWidth < 768) {
      setShowDetails(true);
    }
    setLoading(false);
    console.log(id);
    setTimeout(() => {
      setClienteId(id);
      setLoading(true);
    }, 1000);
  }
  const [controle, setControle] = useState<boolean>(false);
  const [loadingClientes, setLoadingClientes] = useState<boolean>(false);
  const debouncedSearch = useCallback(
    _.debounce((searchTerm) => {
      setSearchTerm(searchTerm);
      setControle((prevControle) => !prevControle);
    }, 300),
    []
  );
  useEffect(() => {
    setLoadingClientes(true);
    console.log("entrou");
    console.log(searchTerm);
    api
      .post("clientes/filtrar/skip/" + skip + "/take/" + take, {
        palavra: searchTerm,
      })
      .then((resposta) => {
        setClientes(resposta.data);
        console.log(resposta.data);
        if (resposta.data.clientes.length > 0) {
          setClienteId(resposta.data.clientes[0].id);
        }
        setLoadingClientes(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [controle]);
  useEffect(() => {
    debouncedSearch(searchTerm);
    // Cancelar debounce na desmontagem do componente
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  console.log(clientes);
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

  return (
    <Layout>
      {openCreateCliente === true && (
        <Suspense>
          <ModalCreateCliente />
        </Suspense>
      )}
      <div className="mx-4 sm:mx-12 pt-4 pb-2 border-gray-300 border-b-2 flex justify-between ">
        <p className="text-xl font-bold">
          <span className="text-verde font-extrabold text-lg">
            {clientes.total}
          </span>{" "}
          clientes{" "}
        </p>
        <div className="flex justify-center items-center bg-white px-2 border-2 rounded-lg focus-within:border-azul-evler">
          <input
            className="w-full sm:w-[500px] focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busque por nome,cpf,cnpj,email e telefone do cliente"
          />
          <IoMdSearch size={20} />
        </div>
        {profile &&
        profile.perfil &&
        profile?.perfil?.permissoesPerfis.filter((modulo) => {
          if (modulo.nome === "Clientes") {
            const valor = modulo.permissoes.filter((permissao) => {
              if (permissao.nome === "Cadastrar Cliente") {
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
          <div>
            <button
              onClick={() => setOpenCreateCliente(true)}
              className="bg-verde px-6 py-2 text-white rounded-md"
            >
              Adicionar Cliente
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex flex-col md:flex-row">
        <div
          className={`w-full md:w-[30vw] border-r-2 space-y-2 px-2 pt-2  h-[calc(100vh-122px)] overflow-y-auto custom-scrollbar pb-4 ${
            showDetails ? "hidden md:block" : "block"
          }`}
        >
          {clientes.clientes.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => onChange(cliente.id)}
              className={`w-full text-start shadow-md border-verde rounded-md  border-[1px] hover:bg-verde/10 ${
                cliente.id === clienteId ? "bg-verde/10" : ""
              }`}
            >
              <div className=" py-4 px-6 w-full ">
                <p className="text-lg font-bold">
                  {highlightSearchTerm(cliente.nome, searchTerm)}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold">E-mail: </span>
                  {cliente.email
                    ? highlightSearchTerm(cliente.email, searchTerm)
                    : <span className="text-gray-400">exemplo@gmail.com</span>}
                </p>
                <div className="flex justify-between text-sm mt-1">
                  <p>
                    <span className="font-bold">Telefone Fixo: </span>
                    {cliente.telefone
                      ? highlightSearchTerm(cliente.telefone, searchTerm)
                      : <span className="text-gray-400">(32) 0000-0000</span>}
                  </p>
                  <p>
                    <span className="font-bold">Celular: </span>
                    {cliente.celular
                      ? highlightSearchTerm(cliente.celular, searchTerm)
                      : <span className="text-gray-400">
                          (32) 00000-0000
                        </span>}
                  </p>
                </div>

                <div className="flex justify-between mt-1">
                  <p className="lowercase text-sm first-letter:uppercase">
                    <span className="font-bold">Tipo:</span>{" "}
                    {cliente.tipoPessoa
                      ? highlightSearchTerm(cliente.tipoPessoa, searchTerm)
                      : <span className="text-gray-400">indefinido</span>}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold">CPF/CNPJ: </span>
                    {cliente.cpfCnpj
                      ? highlightSearchTerm(cliente.cpfCnpj, searchTerm)
                      : <span className="text-gray-400">
                          000.000.000-00
                        </span>}
                  </p>
                </div>
              </div>
            </button>
          ))}
          <div className="flex justify-center ">
            {clientes && skip + 10 < clientes.total && (
              <button
                onClick={() => {
                  setSkip(skip + 10);
                }}
                className="bg-verde text-white mt-2 px-6 py-2 rounded-md"
              >
                Ver mais clientes
              </button>
            )}
          </div>
        </div>
        <div
          className={`w-full md:w-[70vw]  md:h-[calc(100vh-160px)] ${
            showDetails ? "block" : "hidden md:block"
          }`}
        >
          {clienteId !== "" && loading === true ? (
            <Suspense>
              <UpdateCliente />
            </Suspense>
          ) : filteredData.length > 0 && (
            <div className="flex justify-center h-[calc(100vh-122px)] items-center">
              <div>
                <Spinner color="green" className="mx-auto w-16 h-16" />
                <p className="text-center font-bold text-lg">Carregando</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}