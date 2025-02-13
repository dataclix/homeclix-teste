import Image from "next/image";
import Link from "next/link";
import { MdOutlineEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { Checkbox, Form, Input } from "antd";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContexts";
import axios from "axios";
import { apiKey, url } from "@/global/variaveis";

type FieldType = {
  email: string;
  senha: string;
  lembrar: boolean;
};

export default function Home() {
  const { signIn } = useContext(AuthContext);
  const login = async (data: FieldType) => {
    await signIn(data);
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-start items-center  p-4 lg:p-0 ">
      <Image src={'/img/logos/dataclix.webp'} width={150} height={40} alt="logo dataclix" className="mt-8 lg:mt-16 mb-4" />
      
      <div className="w-full lg:w-[25%] flex flex-col items-center mt-6 lg:mt-0">
        <p className="uppercase text-4xl lg:text-6xl font-bold text-verde text-center">Homeclix</p>
        
        <Form onFinish={login} layout="vertical" className="w-full mt-8 lg:mt-12">
          <Form.Item name='email' rules={[{ required: true, message: 'Por favor insira o email!' }, { type: 'email', message: "Email inválido!" }]} className="mt-4">
            <Input 
              placeholder="Email" 
              size="large" 
              style={{ backgroundColor: '#124B51', color: '#fff', fontWeight: 'bold' }} 
              className="bg-verde text-white hover:bg-verde placeholder:text-white placeholder:font-bold focus:outline-none" 
            />
          </Form.Item>

          <Form.Item name='senha' rules={[{ required: true, message: 'Por favor insira a senha!' }]} className="mt-4">
            <Input.Password 
              placeholder="Senha" 
              size="large"
              className="bg-verde text-white hover:bg-verde    "
              style={{
                backgroundColor: '#124B51',
                color: '#fff',
                fontWeight: 'bold',
              }}
            />
          </Form.Item>

          <div className="flex justify-between items-center -mt-2 text-sm lg:text-base">
            <Form.Item name='lembrar' initialValue={true} valuePropName="checked">
              <Checkbox className="text-[#1F1509] font-alumni">Lembrar-me</Checkbox>
            </Form.Item>
            <Link href={'/'} className="hover:text-verde hover:underline">Esqueceu a senha?</Link>
          </div>

          <button className="bg-[#20DF7F] text-white font-bold w-full py-2 rounded-md mt-6">Entrar</button>
        </Form>
      </div>

      <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-8 lg:mt-16 lg:absolute lg:bottom-36 lg:right-16">
        <div className="shadow-2xl px-6 py-4 rounded-lg w-full lg:w-auto text-center lg:text-left">
          <p className="font-bold text-verde text-xl mb-4">Entre em contato</p>
          <div className="flex justify-center lg:justify-start items-center gap-2 mt-2">
            <FaWhatsapp size={26} className="text-verde" />
            <p className="text-verde text-md">(32) 9 9136 8183</p>
          </div>
          <div className="flex justify-center lg:justify-start items-center gap-2 mt-2">
            <MdOutlineEmail size={26} className="text-verde" />
            <p className="text-verde text-md">contato@dataclix.com.br</p>
          </div>
        </div>
      </div>

      <svg className="w-full absolute bottom-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 111" preserveAspectRatio="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0L53 4.17052C107 8.34104 213 16.6821 320 30.7977C427 45.2341 533 65.7659 640 69.9364C747 74.1069 853 61.5954 960 57.7457C1067 53.5751 1173 57.7457 1227 59.6705L1280 61.5954V111H1227C1173 111 1067 111 960 111C853 111 747 111 640 111C533 111 427 111 320 111C213 111 107 111 53 111H0V0Z" fill="#20DF7F" fillOpacity="0.8" />
      </svg>
      <svg className="w-full absolute bottom-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 111" preserveAspectRatio="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 44.4L42.6667 53.28C85.3333 62.16 170.667 79.92 256 75.48C341.333 71.04 426.667 44.4 512 26.64C597.333 8.88 682.667 0 768 0C853.333 0 938.667 8.88 1024 24.42C1109.33 39.96 1194.67 62.16 1237.33 73.26L1280 84.36V111H1237.33C1194.67 111 1109.33 111 1024 111C938.667 111 853.333 111 768 111C682.667 111 597.333 111 512 111C426.667 111 341.333 111 256 111C170.667 111 85.3333 111 42.6667 111H0V44.4Z" fill="#124B51" fillOpacity="0.8" />
      </svg>
    </div>
  );
}

export async function getServerSideProps({ query, req }: any) {
  if (req.cookies.PLSYNsSrVpa2uh) {
    const resposta = await axios.post(url + 'auth/refresh', undefined, { headers: { Authorization: `Bearer ${req.cookies.PLSYNsSrVpa2uh}`, 'api-key': apiKey } });
    if (resposta.data) {
      return { redirect: { destination: "/painel-administrativo", permanent: false } };
    } else {
      return { props: { usuario: resposta.data } };
    }
  } else {
    return { props: { usuario: '' } };
  }
}
