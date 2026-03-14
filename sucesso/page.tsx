export default function Sucesso() {
  return (
    <div className="min-h-screen bg-primary-black text-primary-white flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Inscrição Confirmada!</h1>
      <p className="mb-4">Obrigado por se inscrever na Vigília Jovem! Verifique seu e-mail para mais detalhes.</p>
      <a href="https://chat.whatsapp.com/INVITE_LINK" className="bg-primary-green text-primary-white px-4 py-2 rounded hover:bg-primary-red">
        Entrar no Grupo do WhatsApp
      </a>
    </div>
  );
}