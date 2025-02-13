import Layout from "@/components/Layout";
import ModalCreatePerfil from "@/components/ModalCreatePerfil";
import ModalUpdatePerfil from "@/components/ModalUpdatePerfil";
import { UsuarioGlobal } from "@/global/usuario";
import { telaTamanho } from "@/pages/_app";
import { api } from "@/services/apiClient";
import { Popconfirm } from "antd";
import { atom, useAtom } from "jotai";
import Link from "next/link";
import Router from "next/router";
import { Suspense, useEffect, useState } from "react";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaLongArrowAltRight } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { IoMdClose } from "react-icons/io";

import { toast } from "react-toastify";

type Sistemas = Sistema[];
interface Sistema {
  id: string;
  nome: string;
  tag: string;
  cargos: Cargo[];
}
interface Cargo {
  id: string;
  nome: string;
  padrao: boolean;
  role: string;
}
interface Perfil {
  id: number;
  nome: string;
}
export const openCreatePerfilAtom = atom<boolean>(false);
export const openUpdatePerfilAtom = atom<boolean>(false);
export const idPerfilAtom = atom<number>(0);
export const atualizarAtom = atom<boolean>(false);

export default function Perfil() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [idPerfil, setIdPerfil] = useAtom(idPerfilAtom);
  const [profile, setProfile] = useState<UsuarioGlobal>();
  const [openCreatePerfil, setOpenCreatePerfil] = useAtom(
    openCreatePerfilAtom
  );
  const [openUpdatePerfil, setOpenUpdatePerfil] = useAtom(
    openUpdatePerfilAtom
  );
  const [atualizar, setAtualizar] = useAtom(atualizarAtom);
  const [tela, setTela] = useAtom(telaTamanho);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    api
      .get("/perfis")
      .then((resposta) => {
        setPerfis(resposta.data);
      })
      .catch((err) => {
        console.log(err);
      });
    api
      .get("usuarios/profile")
      .then((resposta) => {
        setProfile(resposta.data);

        if (
          resposta.data.perfil?.permissoesPerfis.filter((modulo: any) => {
            if (modulo.nome === "Perfis") {
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
  async function deletePerfil(id: number) {
    api
      .delete(`/perfis/${id}`)
      .then((resposta) => {
        toast.success("Perfil deletetado com sucesso!");
        setAtualizar(!atualizar);
      });
  }
  return (
    <Layout>
      {loading === true ? (
        <div className="w-full  pl-6 ">
          {openCreatePerfil && (
            <Suspense>
              <ModalCreatePerfil />
            </Suspense>
          )}
          {openUpdatePerfil && (
            <Suspense>
              <ModalUpdatePerfil
                perfil={
                  profile?.perfil?.permissoesPerfis.filter(
                    (modulo) => modulo.nome === "Perfis"
                  ) === undefined
                    ? []
                    : profile?.perfil?.permissoesPerfis.filter(
                        (modulo) => modulo.nome === "Perfis"
                      )
                }
              />
            </Suspense>
          )}

          <div className="mx-6 pt-4 pb-2 border-gray-300 border-b-2 flex justify-between ">
            <div className="flex items-center gap-2">
              <Link
                href="/painel-administrativo/configuracoes"
                className="underline-offset-4 no-underline hover:underline "
              >
                <p className="sm:text-2xl text-lg  font-bold">Configurações</p>
              </Link>
              <FaLongArrowAltRight />
              <p className="sm:text-2xl text-lg font-bold">Perfis de Usuários</p>
            </div>
          </div>
          <div
            className="sm:pt-2  overflow-y-auto custom-scrollbar"
            style={{ height: `${tela - 114}px` }}
          >
            <div className="bg-white grid grid-cols-1 sm:grid-cols-4 gap-4 sm:py-4 mt-2 sm:mt-4 px-4">
              {perfis &&
                perfis.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="shadow-lg  pt-2 rounded-xl border-2 border-gray-200"
                  >
                    {profile &&
                    profile.perfil &&
                    profile?.perfil?.permissoesPerfis.filter((modulo) => {
                      if (modulo.nome === "Perfis") {
                        const valor = modulo.permissoes.filter(
                          (permissao) => {
                            if (permissao.nome === "Deletar Perfil") {
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
                      <div className="flex justify-end px-4">
                        <Popconfirm
                          title="Deletar Perfil"
                          description="Tem certeza que deseja deletar este perfil?"
                          onConfirm={() => deletePerfil(cargo.id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <button>
                            <IoMdClose size={24} className="text-verde" />
                          </button>
                        </Popconfirm>
                      </div>
                    ) : (
                      <div className="h-6"></div>
                    )}

                    <ImProfile
                      className="mx-auto pt-6 text-verde"
                      size={80}
                    />
                    <p className="text-2xl font-bold text-center mt-4">
                      {cargo.nome}
                    </p>
                    {profile &&
                    profile.perfil &&
                    profile?.perfil?.permissoesPerfis.filter((modulo) => {
                      if (modulo.nome === "Perfis") {
                        const valor = modulo.permissoes.filter(
                          (permissao) => {
                            if (permissao.nome === "Atualizar Perfil") {
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
                      <div className="flex justify-center items-end mt-4 ">
                        <button
                          onClick={() => {
                            setOpenUpdatePerfil(true);
                            setIdPerfil(cargo.id);
                          }}
                          className="bg-verde text-white font-libre font-bold w-full py-3 mt-4 rounded-b-xl "
                        >
                          Ver/Editar
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center items-end mt-4 ">
                        <button
                          onClick={() => {
                            setOpenUpdatePerfil(true);
                            setIdPerfil(cargo.id);
                          }}
                          className="bg-verde text-white font-libre font-bold w-full py-3 mt-4 rounded-b-xl "
                        >
                          Ver
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              {profile &&
              profile.perfil &&
              profile?.perfil?.permissoesPerfis.filter((modulo) => {
                if (modulo.nome === "Perfis") {
                  const valor = modulo.permissoes.filter((permissao) => {
                    if (permissao.nome === "Cadastrar Perfil") {
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
                  onClick={() => setOpenCreatePerfil(true)}
                  className="bg-[white] shadow-lg border-2 border-gray-200 p-6 min-h-[210px] rounded-xl flex justify-center items-center"
                >
                  <div className="text-verde">
                    <BsPlusCircleFill size={32} className="mx-auto " />
                    <p className="mt-2 font-bold font-libre text-2xl">
                      Adicionar perfil
                    </p>
                  </div>
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </Layout>
  );
}