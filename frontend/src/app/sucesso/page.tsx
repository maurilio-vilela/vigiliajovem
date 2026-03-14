import Image from 'next/image';
import '../styles/styles.css';
import Layout from '../components/Layout';

export default function Sucesso() {
  return (
    <Layout title="Sucesso - II Vigília Jovem">
      <div className="min-h-screen text-primary-white container flex flex-col items-center justify-center p-4 mx-auto">
        {/* Logotipo */}
        <Image
          src="/images/logo.png"
          alt="Logotipo Vigília Jovem"
          className="logo drop-shadow-lg mb-6"
          width={200}
          height={100}
        />

        {/* Mensagem de Sucesso */}
        <h1 className="text-4xl md:text-3xl font-bold mb-4 text-white animate-fade-in">
          Inscrição Confirmada! 🎉
        </h1>

       {/* Tema do Evento */}
        <h2 className="font-semibold mb-6 text-white/90 animate-fade-in text-center">
          II Vigília Jovem: O Encontro das Duas Sedes
        </h2>

        {/* Parágrafo (Atualizado) */}
        <p className="mb-8 text-white text-center max-w-lg text-lg md:text-xl leading-relaxed">
          Você deu o primeiro passo, jovem! ❤️ Sua inscrição para a <strong>II Vigília Jovem</strong> foi confirmada.
          <br /><br />
          Prepare seu coração! No dia <strong>06 de dezembro, às 22:00</strong>, na <strong>Paróquia Nossa Senhora de Fátima - Vila Luizão</strong>, vivenciaremos uma noite de graça, oração e renovação.
          <br /><br />
          Verifique seu e-mail para mais detalhes e entre no grupo do WhatsApp para não perder nenhuma informação! ✨
        </p>

        {/* Botão para o grupo do WhatsApp */}
        <a
          href="https://chat.whatsapp.com/JBwW5Bj6h7oEU6FvDBLbGK"
          className="btn-whatsapp inline-flex items-center bg-[#25D366] text-white font-semibold text-base px-12 py-24 rounded-full shadow-lg hover:bg-[#20b858] transition-colors duration-300 animate-fade-in"
        >
          <svg className="w-540 h-40 mr-2" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.56 4.245 1.62 6.077L0 24l5.977-1.62A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.022c-1.96 0-3.843-.56-5.48-1.604l-.393-.234-3.543.957.957-3.543-.234-.393A9.978 9.978 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.62-6.194c-.308-.154-1.833-.904-2.118-1.008-.286-.104-.494-.154-.702.154-.208.308-.808 1.008-.988 1.216-.18.208-.36.232-.668.078-.308-.154-1.298-.478-2.474-1.528-.914-.814-1.528-1.814-1.708-2.122-.18-.308-.02-.474.134-.628.138-.138.308-.36.462-.54.154-.18.208-.308.308-.514.1-.206.05-.386-.024-.54-.074-.154-.668-1.604-.914-2.194-.24-.576-.486-.496-.668-.504-.18-.008-.386-.008-.594-.008a1.14 1.14 0 00-.834.386c-.286.308-.988.964-1.008 2.346 0 1.382.988 2.716 1.126 2.922.138.206 1.95 3.15 4.732 4.17 1.754.64 2.47.408 2.96.258.494-.15.914-.594 1.008-1.142.094-.548.054-.996-.218-1.37z"/>
          </svg>
          Entrar no Grupo do WhatsApp
        </a>
      </div>
    </Layout>
  );
}