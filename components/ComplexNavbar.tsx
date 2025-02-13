import React, { useEffect, useState } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Card,
  IconButton,
  Collapse,

} from "@material-tailwind/react";
import {
  CubeTransparentIcon,
  UserCircleIcon,
  CodeBracketSquareIcon,
  Square3Stack3DIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  PowerIcon,
  RocketLaunchIcon,
  Bars2Icon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { MdDashboard, MdNotifications, MdOutlineBedroomParent, MdOutlineRealEstateAgent } from "react-icons/md";
import Link from "next/link";
import { LiaFileContractSolid } from "react-icons/lia";
import { TbBrowser } from "react-icons/tb";
import { GoGear } from "react-icons/go";
import { VscGraph } from "react-icons/vsc";
import { FaHouseUser, FaRegEdit } from "react-icons/fa";
import axios from "axios";
import {
  accessTokenHomeclix,
  apiKey,
  lembrarHomeclix,
  refreshTokenHomeclix,
  url,
} from "@/global/variaveis";
import { api } from "@/services/apiClient";
import Router from "next/router";
import { destroyCookie, setCookie } from "nookies";
import { Badge }
  from
  "antd"
  ;

interface Imobiliaria {
  id: number;
  nome: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  creci: string;
  foto: string;
  celular: string;
  mostrarSite: boolean;
  mostrarDestaque: boolean;
  role: string;
  status: string;
  imobiliaria: Imobiliaria;
}

interface Profile {
  id: string | null;
  nome: string | null;
  foto: string | null;
}

function getFirstName(fullName: string | null): string {
  if (!fullName) return ''; // Verifica se o nome existe
  return fullName.split(' ')[0]; // Divide a string por espaços e retorna o primeiro nome
}

function ProfileMenu({ id, nome, foto }: Profile) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Avatar
            variant="circular"
            size="sm"
            alt="Avatar"
            className="border border-gray-900 p-0.5"
            src={foto ? foto : "/img/icones/profile.webp"}
          />
          <p className="text-white lowercase first-letter:uppercase text-base px-1">
            {getFirstName(nome)}
          </p>

          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-4 w-4 text-white transition-transform ${isMenuOpen ? "rotate-180" : ""
              }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1 z-50">
        <MenuItem
          key="Meu Perfil"
          onClick={() => Router.push("/painel-administrativo/meu-perfil")}
          className={`flex items-center gap-2 rounded `}
        >
          {React.createElement(UserCircleIcon, {
            className: `h-4 w-4 `,
            strokeWidth: 2,
          })}
          <Typography
            as="span"
            variant="small"
            className="font-normal"
            color={"inherit"}
          >
            Meu Perfil
          </Typography>
        </MenuItem>
        <MenuItem
          key="Deslogar"
          onClick={() => {
            destroyCookie({}, accessTokenHomeclix);
            destroyCookie({}, refreshTokenHomeclix);
            destroyCookie({}, lembrarHomeclix);
            Router.push("/");
          }}
          className={`flex items-center gap-2 rounded 
            hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10
            `}
        >
          {React.createElement(PowerIcon, {
            className: `h-4 w-4 text-red-500 `,
            strokeWidth: 2,
          })}
          <Typography
            as="span"
            variant="small"
            className="font-normal"
            color={"red"}
          >
            Deslogar
          </Typography>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

// nav list menu
const navListMenuItems = [
  {
    title: "@material-tailwind/html",
    description:
      "Learn how to use @material-tailwind/html, packed with rich components and widgets.",
  },
  {
    title: "@material-tailwind/react",
    description:
      "Learn how to use @material-tailwind/react, packed with rich components for React.",
  },
  {
    title: "Material Tailwind PRO",
    description:
      "A complete set of UI Elements for building faster websites in less time.",
  },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const renderItems = navListMenuItems.map(({ title, description }) => (
    <a href="#" key={title}>
      <MenuItem>
        <Typography variant="h6" color="blue-gray" className="mb-1">
          {title}
        </Typography>
        <Typography variant="small" color="gray" className="font-normal">
          {description}
        </Typography>
      </MenuItem>
    </a>
  ));

  return (
    <React.Fragment>
      <Menu allowHover open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <Typography as="a" href="#" variant="small" className="font-normal">
            <MenuItem className="hidden items-center gap-2 font-medium text-blue-gray-900 lg:flex lg:rounded-full ">
              <Square3Stack3DIcon
                className="h-[18px] w-[18px] text-blue-gray-500"
              />{" "}
              Pages{" "}
              <ChevronDownIcon
                strokeWidth={2}
                className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </MenuItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden w-[36rem] grid-cols-7 gap-3 overflow-visible lg:grid">
          <Card
            color="blue"
            shadow={false}
            variant="gradient"
            className="col-span-3 grid h-full w-full place-items-center rounded-md"
          >
            <RocketLaunchIcon strokeWidth={1} className="h-28 w-28" />
          </Card>
          <ul className="col-span-4 flex w-full flex-col gap-1">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <MenuItem className="flex items-center gap-2 font-medium text-blue-gray-900 lg:hidden">
        <Square3Stack3DIcon
          className="h-[18px] w-[18px] text-blue-gray-500"
        />{" "}
        Pages{" "}
      </MenuItem>
      <ul className="ml-6 flex w-full flex-col gap-1 lg:hidden">
        {renderItems}
      </ul>
    </React.Fragment>
  );
}

function NavList() {

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  return (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center text-xl md:text-sm ">
      <Link href={"/painel-administrativo"}>
        <div className="text-gray-400 flex justify-center gap-1 items-center hover:text-white hover:bg-white/20 px-4 py-2 rounded-xl">
          <MdOutlineRealEstateAgent />
          <p className="font-normal ">Imovéis</p>
        </div>
      </Link>
      <Link href={"/painel-administrativo/clientes"}>
        <div className="text-gray-400 flex justify-center gap-1 items-center hover:text-white hover:bg-white/20 px-4 py-2 rounded-xl">
          <FaHouseUser />
          <p className="font-normal ">Clientes</p>
        </div>
      </Link>

      <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
        <MenuHandler>
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center text-gray-400 gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
          >
            <MdOutlineBedroomParent size={16} />
            <p className="first-letter:uppercase lowercase">Aluguéis</p>
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`h-4 w-4 text-white transition-transform ${isMenuOpen ? "rotate-180" : ""
                }`}
            />
          </Button>
        </MenuHandler>
        <MenuList className="p-1 z-50">
          <MenuItem
            key="Meu Perfil"
            onClick={() => Router.push("/painel-administrativo/alugueis")}
            className={`flex items-center gap-2 rounded `}
          >
            <MdOutlineBedroomParent />
            <Typography
              as="span"
              variant="small"
              className="font-normal"
              color={"inherit"}
            >
             Aluguéis
            </Typography>
          </MenuItem>
          {/*<MenuItem
            key="editar aluguéis"
            onClick={() => Router.push("/painel-administrativo/alugueis/editar-alugueis")}
            className={`flex items-center gap-2 rounded 
            
            `}
          >
            <FaRegEdit />
            <Typography
              as="span"
              variant="small"
              className="font-normal"
            >
              Editar Aluguéis
            </Typography>
          </MenuItem>*/}
        </MenuList>
      </Menu>

      
      <Link href={"/painel-administrativo/configuracoes"}>
        <div className="text-gray-400 flex justify-center gap-1 items-center hover:text-white hover:bg-white/20 px-4 py-2 rounded-xl">
          <GoGear />
          <p className="font-normal ">Configuração</p>
        </div>
      </Link>
    </ul>
  );
}

export function ComplexNavbar() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const [usuario, setUsuario] = useState<Usuario>();
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  useEffect(() => {
    api.get("usuarios/profile").then((resposta) => {
      setUsuario(resposta.data);
    });
  }, []);

  return (
    <div className=" bg-verde fixed w-full py-2 md:px-12 px-4 z-50">
      <div className="relative mx-auto flex items-center justify-between text-blue-gray-900">
        <IconButton
          size="sm"
          color="white"
          variant="text"
          onClick={toggleIsNavOpen}
          className=" mr-2 lg:hidden"
        >
          <Bars2Icon className="h-6 w-6" />
        </IconButton>
        <div className="flex items-center text-white ">
          <Link href="/painel-administrativo" className="flex items-center gap-2">
            <MdDashboard size={24} />
            <p className="font-extrabold uppercase text-xl ">Homeclix</p>
          </Link>
        </div>
        <div className="hidden lg:flex lg:ml-16">
          <NavList />
        </div>
        <div className="flex items-center gap-2">


          {/*<Badge
            count={2}
            size="small"
            offset={[-12, 8]}
            className="mt-2 mr-1 text-sm"
          >
            <IconButton variant="text" color="blue-gray">
              <MdNotifications className="h-7 w-7 text-white" />
            </IconButton>
          </Badge>*/}





          <ProfileMenu
            key={usuario?.id}
            foto={usuario ? usuario.foto : null}
            id={usuario ? usuario.id : null}
            nome={usuario ? usuario.nome : null}
          />
        </div>
      </div>
      <Collapse open={isNavOpen} className="overflow-scroll  z-10 ">
        <NavList />
      </Collapse>
    </div>
  );
}