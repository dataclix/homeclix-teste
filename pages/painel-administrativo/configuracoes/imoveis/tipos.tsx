import Layout from "@/components/Layout";
import { removeAccents } from "@/global/TratamentosDeStrings";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaLongArrowAltRight, FaRegEdit } from "react-icons/fa";
import diacritics from "diacritics"
import { IoMdClose, IoMdCloseCircle, IoMdSearch } from "react-icons/io";
import { api } from "@/services/apiClient";
import { UsuarioGlobal } from "@/global/usuario";
import Router from "next/router";
import { Dropdown, Form, Input, MenuProps, Modal, Space } from "antd";
import { toast } from "react-toastify";
import { SlOptionsVertical } from "react-icons/sl";
import { GiConfirmed } from "react-icons/gi";


interface Tipo {
    id: string;
    nome: string;
}

interface Letra {
    letra: string;
    tipos: Tipo[];
}

export default function Tipos() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [profile, setProfile] = useState<UsuarioGlobal>()
    const [atualizar, setAtualizar] = useState<boolean>(false)
    const [openCreateTipo, setOpenCreateTipo] = useState<boolean>(false)
    const [tipos, setTipos] = useState<Letra[]>([])
    const [idTipo, setIdTipo] = useState<string>('')
    const [nomeTipo, setNomeTipo] = useState<string>('')
    const [openExcluir, setOpenExcluir] = useState<boolean>(false)
    const [editarTipo, setEditarTipo] = useState<string>('')
    useEffect(() => {

        api.get('usuarios/profile').then((resposta) => {

            setProfile(resposta.data)

            if (resposta.data.perfil?.permissoesPerfis.filter((modulo: any) => {
                if (modulo.nome === 'Admins') {
                    return modulo
                }
            }).length === 0) {
                Router.push('/painel-administrativo/configuracoes')
            }
            else {

            }
        })
        api.get('tipos/all').then((resposta) => {
            const valor = resposta.data.sort((a: Tipo, b: Tipo) => {
                if (a.nome < b.nome) {
                    return -1;
                }
                if (a.nome > b.nome) {
                    return 1;
                }
                return 0;
            })

            setTipos(valor.reduce((result: Letra[], atributo: Tipo) => {
                const letraInicial = atributo.nome.charAt(0).toUpperCase();
                let letraGroup = result.find(group => group.letra === letraInicial);
                if (!letraGroup) {
                    letraGroup = { letra: letraInicial, tipos: [] };
                    result.push(letraGroup);
                }
                letraGroup.tipos.push(atributo);
                return result;
            }, []))
        })
    }, [atualizar])

    function removeAccentsAndLowercase(str: string): string {
        if (!str) {
            return '';
        }
        return diacritics.remove(str.toLowerCase());
    }

    function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
        if (!text || !searchTerm || typeof text !== 'string' || typeof searchTerm !== 'string') {
            return text;
        }

        const normalizedText = removeAccentsAndLowercase(text); // Remover acentos e converter para minúsculas
        const normalizedSearchTerm = removeAccentsAndLowercase(searchTerm); // Remover acentos do termo de busca e converter para minúsculas
        const parts: React.ReactNode[] = [];
        let currentIndex = 0;

        while (currentIndex < text.length) {
            const matchIndex = normalizedText.indexOf(normalizedSearchTerm, currentIndex);

            if (matchIndex === -1) {
                parts.push(<span key={currentIndex}>{text.substring(currentIndex)}</span>);
                break;
            }

            parts.push(<span key={currentIndex}>{text.substring(currentIndex, matchIndex)}</span>);
            parts.push(<mark key={matchIndex}>{text.substring(matchIndex, matchIndex + searchTerm.length)}</mark>);

            currentIndex = matchIndex + searchTerm.length;
        }

        return parts;
    }
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(removeAccents(term));
    };
    const filteredData = tipos.map((tipo) => {
        const searchRegex = new RegExp(searchTerm, 'i'); // 'i' faz a busca ser case insensitive

        // Verifica o nome da configuração
        if (searchRegex.test(removeAccents(tipo.letra))) {
            return tipo; // Retorna toda a configuração
        }

        // Se o nome da configuração não for compatível, filtra as opções
        const filteredOpcoes =  tipo.tipos.filter((valor) => {
            return (
                searchRegex.test(removeAccents(valor.nome))
                // Adicione mais campos conforme necessário
            );
        });

        // Retorna apenas a configuração com as opções relevantes
        return {
            ...tipo,
            atributos: filteredOpcoes
        };


    });
    const filteredDataWithoutEmptyConfigurations = filteredData.filter((config) => config.tipos.length > 0);
    const onFinishCreate = (values: any) => {

        api.post('tipos', {
            nome: values.tipo
        }).then((resposta) => {
            toast.success('Tipo criado com sucesso')
            setOpenCreateTipo(false)
            setAtualizar(!atualizar)
        })
    }
    const onFinishDelete = (values: any) => {

        api.delete('tipos/' + idTipo).then((resposta) => {
            toast.success('Tipo excluido com sucesso!')
            setOpenExcluir(false)
            setAtualizar(!atualizar)
        })
    }
    const onFinishUpdate = (values: any) => {

        api.patch('tipos/' + idTipo, {
            nome: values.tipo
        }).then((resposta) => {
            toast.success('Tipo atualizado com sucesso!')
            setEditarTipo('')
            setAtualizar(!atualizar)
        })

    }
    function handleMenuClick(e: string, id: string, nome: string) {

        if (e === '1') {
            setIdTipo(id)
            setEditarTipo(id)
        }
        else if (e === '2') {
            setOpenExcluir(true)
            setIdTipo(id)
            setNomeTipo(nome)
        }
    };
    const items: MenuProps['items'] = [
        {
            label: <p className="px-2 font-bold">Editar</p>,
            key: '1',
        },
        {
            label: <p className="px-2 font-bold">Excluir</p>,
            key: '2',
        }
    ];
    return (
        <Layout>
            {openExcluir === true && (
                <Modal width={400} centered open={openExcluir} onCancel={() => setOpenExcluir(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Excluir Tipo</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
                    <Form layout="vertical" className="px-10 mt-6" onFinish={onFinishDelete}>
                        <p>Tem certeza que quer apagar o atributo: <span className="font-bold">{nomeTipo}</span> ?</p>
                        <div className="flex justify-center gap-4 pb-4 mt-8">
                            <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                                Sim
                            </button>
                            <button type="button" onClick={() => setOpenExcluir(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                                Não
                            </button>
                        </div>
                    </Form>

                </Modal>
            )}
            {openCreateTipo === true && (
                <Modal width={400} centered open={openCreateTipo} onCancel={() => setOpenCreateTipo(false)} footer={false} title={<p className="text-2xl font-libre  py-3 px-6 bg-verde text-white rounded-t-lg">Criar Tipo</p>} closeIcon={<IoMdClose size={24} color="white" className="" />}>
                    <Form layout="vertical" className="px-10 mt-6" onFinish={onFinishCreate}>
                        <Form.Item name='tipo' rules={[{ required: true, message: 'Por favor insira o nome do tipo' }]} label={<p className="font-bold text-md">Nome do Tipo</p>}>
                            <Input />
                        </Form.Item>
                        <div className="flex justify-center gap-4 pb-4 mt-8">
                            <button className="w-32 shadow-md bg-verde text-white py-1.5 rounded-xl">
                                Criar Tipo
                            </button>
                            <button type="button" onClick={() => setOpenCreateTipo(false)} className="w-32 font-bold shadow-md border-2 border-verde text-verde py-1.5 rounded-xl hover:bg-verde/10">
                                Cancelar
                            </button>
                        </div>
                    </Form>

                </Modal>
            )}

            <div className="mx-6 pt-6 pb-2 border-gray-300 border-b-2 flex justify-between ">
                <div className="flex items-center gap-2">
                    <Link href='/painel-administrativo/configuracoes' className="underline-offset-4 no-underline hover:underline ">
                        <p className="text-2xl  font-bold">Configurações</p>
                    </Link>
                    <FaLongArrowAltRight />
                    <p className="text-2xl  font-bold">Tipos Imóveis</p>
                </div>
                <div className="flex justify-center items-center bg-white px-2 border-2 rounded-lg focus-within:border-azul-evler">
                    <input onChange={handleSearch} className="w-[500px] focus:outline-none" placeholder="Busque por atributos de imóveis" />
                    <IoMdSearch size={20} />
                </div>
                <div>
                    {profile && profile.perfil && profile?.perfil?.permissoesPerfis.filter((modulo) => {
                        if (modulo.nome === 'Admins') {
                            const valor = modulo.permissoes.filter((permissao) => {
                                if (permissao.nome === 'Cadastrar Administrador') {
                                    return true
                                }
                            })
                            if (valor.length > 0) {
                                return true
                            }
                        }
                    }).length > 0 || profile?.role === 'ROOT'
                        ?
                        <button onClick={() => setOpenCreateTipo(true)} className="bg-verde text-white px-8 py-2 rounded-xl">
                            Cadastrar Tipo
                        </button>
                        :
                        <>
                        </>

                    }

                </div>

            </div>
            <div className="px-12 mt-4 space-y-6 h-[calc(100vh-170px)] overflow-y-auto custom-scrollbar" >
                {filteredDataWithoutEmptyConfigurations.length > 0
                    ?
                    filteredDataWithoutEmptyConfigurations.map((letra) => (
                        <div key={letra.letra}>
                            <div className="border-b-2 border-b-gray-300">
                                <p className="font-bold text-xl">{highlightSearchTerm(letra.letra, searchTerm)}</p>
                            </div>

                            <div className="flex flex-wrap gap-6 mt-4 ">
                                {letra.tipos.map((tipo) => (
                                    <div key={tipo.id} className="bg-gray-300 font-bold py-2 px-4  text-black rounded-md ">
                                        {editarTipo === tipo.id ?
                                            <Form onFinish={onFinishUpdate} className="flex justify-between items-center gap-4 ">
                                                <Form.Item name='tipo' initialValue={tipo.nome} className="mb-0 w-40">
                                                    <Input required />
                                                </Form.Item>
                                                <div className="flex gap-1">
                                                    <button >
                                                        <GiConfirmed size={24} className="text-green-500" />
                                                    </button>
                                                    <button type="button" onClick={() => setEditarTipo('')}>
                                                        <IoMdCloseCircle size={24} className="text-red-500" />
                                                    </button>


                                                </div>
                                            </Form>
                                            :
                                            <div className="flex justify-between items-center gap-4">
                                                <p className="text-lg">{highlightSearchTerm(tipo.nome, searchTerm)}</p>
                                                <div>
                                                    <Dropdown menu={{ items, onClick: (e) => handleMenuClick(e.key, tipo.id, tipo.nome) }}>
                                                        <SlOptionsVertical size={18} />
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        }



                                    </div>
                                ))}
                            </div>

                        </div>
                    ))
                    :
                    <p className="text-xl font-bold">Nenhum tipo localizado</p>

                }
            </div>
        </Layout>
    )
}